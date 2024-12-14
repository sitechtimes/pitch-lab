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
        <!-- Center line always visible -->
        <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-green-500"></div>
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
        <!-- Slider for Detune Value -->
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
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        noiseSuppression: false,
        echoCancellation: false,
      },
    });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 8192;
    source.connect(analyser);

    // YIN algorithm
    const pitchFinder = Pitchfinder.YIN({
      sampleRate: audioContext.sampleRate,
    });

    const highPassFilter = audioContext.createBiquadFilter();
    highPassFilter.type = "highpass";
    highPassFilter.frequency.value = 50; // Filter out frequencies below 50 Hz
    source.connect(highPassFilter).connect(analyser);

    // detect amplitude
    const calculatePeakAmplitude = (dataArray) => {
      return Math.max(...dataArray.map(Math.abs));
    };

    // Detect pitch
    const dataArray = new Float32Array(analyser.fftSize);

    const pitchBuffer = [];
    const isConstantPitch = () => {
      if (pitchBuffer.length < 10) return false; // Require a sufficient number of samples
      const meanPitch =
        pitchBuffer.reduce((a, b) => a + b, 0) / pitchBuffer.length;
      const deviation = pitchBuffer.every((p) => Math.abs(p - meanPitch) < 1); // Allow slight variation
      return deviation;
    };

    const detect = () => {
      analyser.getFloatTimeDomainData(dataArray);

      // Calculate peak amplitude
      const peakAmplitude = calculatePeakAmplitude(dataArray);

      // Set a threshold for significant signals
      const amplitudeThreshold = 0.02; // Adjust this based on testing
      if (peakAmplitude < amplitudeThreshold) {
        console.log("Weak signal detected. Ignoring noise.");
        requestAnimationFrame(detect); // Continue loop without processing pitch
        return;
      }

      const detectedPitch = pitchFinder(dataArray);

      if (detectedPitch && detectedPitch > 50 && detectedPitch < 2000) {
        pitchBuffer.push(detectedPitch);
        if (pitchBuffer.length > 10) pitchBuffer.shift(); // Maintain buffer size

        const normalizedPitch = normalizeToBaseOctave(detectedPitch);
        const normalizedTarget = normalizeToBaseOctave(selectedNote.value);

        const detune = 1200 * Math.log2(normalizedPitch / normalizedTarget);
        pitch.value = detectedPitch;

        note.value = Object.keys(noteFrequencies).find(
          (key) => noteFrequencies[key] === selectedNote.value,
        );

        detuneValue.value = detune;

        isFlat.value = detune < -10;
        isSharp.value = detune > 10;

        const constant = isConstantPitch();
        console.log(
          `Pitch detected: ${detectedPitch.toFixed(2)} Hz, Constant: ${constant}`,
        );
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
