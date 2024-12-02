<template>
  <div class="flex flex-col items-center justify-center bg-gray-800 text-white">
    <h1 class="text-3xl font-bold text-gray-200 mb-6">Pitch Finder</h1>
    <p class="text-gray-400 mb-4">
      Click the button below to start detecting pitch.
    </p>
    <button
      @click="startPitchDetection"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
    >
      Start Pitch Detection
    </button>

    <!-- Note Selection -->
    <div class="mt-6">
      <label for="note-selection" class="text-gray-400 mr-4">Tune to:</label>
      <select
        id="note-selection"
        v-model="selectedNote"
        class="bg-gray-700 text-white p-2 rounded"
      >
        <option
          v-for="(frequency, noteName) in noteFrequencies"
          :key="noteName"
          :value="frequency"
        >
          {{ noteName }}
        </option>
      </select>
    </div>

    <!-- Tuning Scale -->
    <div class="mt-8">
      <div
        class="scale-container relative w-96 h-6 bg-gray-900 rounded overflow-hidden"
      >
        <div
          class="absolute top-0 bottom-0 left-1/2 w-0.5"
          :class="pitch ? 'bg-green-500' : 'bg-transparent'"
        ></div>
        <!-- Notch Lines -->
        <div v-for="i in 11" :key="i" class="absolute inset-y-0">
          <div
            :style="{ left: `${50 + i * 5}px` }"
            class="h-full w-0.5 bg-gray-500"
          ></div>
          <div
            :style="{ left: `${50 - i * 5}px` }"
            class="h-full w-0.5 bg-gray-500"
          ></div>
        </div>
        <!-- Slider -->
        <div
          :style="{ transform: `translateX(${detuneValue}px)` }"
          class="slider w-2 h-6 bg-blue-500 absolute top-0 left-1/2 -translate-x-1/2"
        ></div>
      </div>

      <div class="flex justify-center items-center mt-6">
        <p class="mr-2 text-2xl font-semibold">{{ note }}</p>
        <p v-if="isFlat" class="text-2xl text-gray-400">b</p>
        <p v-if="isSharp" class="text-2xl text-gray-400">#</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Pitchfinder from "pitchfinder";

const pitch = ref(null);
const note = ref("");
const detuneValue = ref(0); // The slider position
const isFlat = ref(false);
const isSharp = ref(false);
const selectedNote = ref(440); // Default to "A" (440 Hz)

let audioContext = null;
let analyser = null;

// Note frequencies for selection
const noteFrequencies = {
  A: 440,
  "B♭": 466.16,
  C: 261.63,
  "E♭": 311.13,
  F: 349.23,
};

const normalizeToBaseOctave = (frequency) => {
  while (frequency > 523.25) {
    frequency /= 2;
  }
  while (frequency < 261.63) {
    frequency *= 2;
  }
  return frequency;
};

const startPitchDetection = async () => {
  try {
    // Request microphone input
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    source.connect(analyser);

    // YIN algorithm
    const pitchFinder = Pitchfinder.YIN({
      sampleRate: audioContext.sampleRate,
    });

    // Detect pitch
    const dataArray = new Float32Array(analyser.fftSize);
    const detect = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const detectedPitch = pitchFinder(dataArray);

      if (detectedPitch && detectedPitch > 50 && detectedPitch < 2000) {
        const normalizedPitch = normalizeToBaseOctave(detectedPitch);
        const normalizedTarget = normalizeToBaseOctave(selectedNote.value);

        const detune = 1200 * Math.log2(normalizedPitch / normalizedTarget); // Detune in cents
        pitch.value = detectedPitch;

        // Determine the note name for display purposes
        note.value = Object.keys(noteFrequencies).find(
          (key) => noteFrequencies[key] === selectedNote.value,
        );

        detuneValue.value = detune; // Update slider position

        // Determine if the pitch is sharp or flat
        isFlat.value = detune < -10; // Flat if detune is less than -10 cents
        isSharp.value = detune > 10; // Sharp if detune is more than 10 cents

        console.log(
          `Pitch detected: ${detectedPitch.toFixed(2)} Hz (Normalized: ${normalizedPitch.toFixed(2)} Hz, Target: ${note.value}, Detune: ${detune.toFixed(2)} cents)`,
        );
      } else {
        pitch.value = null;
        note.value = "No pitch detected";
        detuneValue.value = 0; // Reset slider
        isFlat.value = false;
        isSharp.value = false;
      }

      requestAnimationFrame(detect);
    };

    detect();
  } catch (err) {
    console.error("Error accessing microphone: ", err);
    alert("Could not access your microphone. Please allow microphone access.");
  }
};
</script>

<style scoped>
.scale-container {
  position: relative;
  background-color: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
}

.slider {
  height: 24px;
  width: 8px;
  background-color: #00b4d8;
  position: absolute;
  top: 0;
  transform: translateX(-50%);
}
</style>
