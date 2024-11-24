<template>
  <div class="tuner p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Tuning App</h1>

    <!-- Notes Buttons -->
    <div class="notes flex space-x-4">
      <button
        v-for="note in notes"
        :key="note"
        @click="setTargetNote(note)"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
      >
        {{ note }}
      </button>
    </div>

    <!-- Current Note Information -->
    <div v-if="currentNote" class="current-note mt-6 text-xl">
      Current Note: {{ currentNote }}
    </div>

    <div v-if="detectedFrequency" class="frequency mt-4">
      Detected Frequency: {{ detectedFrequency.toFixed(2) }} Hz
    </div>

    <div v-if="currentNote && detectedFrequency" class="difference mt-2">
      Difference from Reference: {{ frequencyDifference.toFixed(2) }} Hz
    </div>

    <!-- Tuning Bar -->
    <div
      v-if="detectedFrequency"
      class="tuning-bar mt-6 relative w-full h-20 bg-gray-800 rounded-md flex items-center justify-center"
    >
      <div
        class="marker absolute h-full w-1 bg-green-500 rounded"
        :style="{ left: `${barPosition}%` }"
      ></div>
      <div
        class="scale absolute w-full h-full flex justify-between px-2 text-white"
      >
        <div
          v-for="i in 11"
          :key="i"
          class="line h-full flex flex-col items-center"
        >
          <div class="bar w-px h-10 bg-gray-500"></div>
          <div>{{ (i - 6) * 10 }}</div>
        </div>
      </div>
    </div>

    <!-- Closest Detected Note -->
    <div
      v-if="detectedNote"
      class="detected-note mt-4 flex items-center justify-center text-2xl text-white"
    >
      <div class="note-display p-3 bg-gray-700 rounded">{{ detectedNote }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import * as Tone from "tone";
import Pitchfinder from "pitchfinder";

const notes = ref(["A", "B♭", "C", "E♭", "F"]);
const currentNote = ref(null);
const detectedFrequency = ref(null);
const synth = ref(null);
const synthGain = ref(null);
const referenceFrequencies = {
  A: 440.0,
  "B♭": 466.16,
  C: 261.63,
  "E♭": 311.13,
  F: 349.23,
};
const pitchFinder = ref(null);

const pitchDifference = computed(() => {
  if (currentNote.value && detectedFrequency.value) {
    const referenceFrequency = referenceFrequencies[currentNote.value];
    const cents =
      1200 * Math.log2(detectedFrequency.value / referenceFrequency);
    return cents;
  }
  return 0;
});

const barPosition = computed(() => {
  // Map pitch difference to bar position (-50 to 50 range to 0% to 100%)
  return Math.min(100, Math.max(0, 50 + pitchDifference.value));
});

const detectedNote = computed(() => {
  if (!detectedFrequency.value) return null;

  // Calculate which reference note the detected frequency is closest to
  let closestNote = null;
  let minDifference = Infinity;

  for (const [note, frequency] of Object.entries(referenceFrequencies)) {
    const difference = Math.abs(frequency - detectedFrequency.value);
    if (difference < minDifference) {
      minDifference = difference;
      closestNote = note;
    }
  }

  return closestNote;
});

const frequencyDifference = computed(() => {
  if (currentNote.value && detectedFrequency.value) {
    const referenceFrequency = referenceFrequencies[currentNote.value];
    return detectedFrequency.value - referenceFrequency;
  }
  return 0;
});

const setTargetNote = (note) => {
  currentNote.value = note;
  playNote(note);
};

const playNote = (note) => {
  if (!synth.value) {
    synth.value = new Tone.Synth();
    synthGain.value = new Tone.Gain(0.5).toDestination();
    synth.value.connect(synthGain.value);
  }
  const noteMap = {
    A: "A4",
    "B♭": "A#4",
    C: "C4",
    "E♭": "D#4",
    F: "F4",
  };
  synth.value.triggerAttackRelease(noteMap[note], "8n");
};

const startTuner = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("getUserMedia not supported on your browser.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);

    // Create a band-pass filter
    const bandPassFilter = audioContext.createBiquadFilter();
    bandPassFilter.type = "bandpass";
    bandPassFilter.frequency.value = 440; // Center frequency (for A4)
    bandPassFilter.Q.value = 10; // Quality factor to determine the bandwidth of the filter

    // Connect the filter in the audio chain
    source.connect(bandPassFilter);

    // Create the analyser node
    const analyser = audioContext.createAnalyser();
    bandPassFilter.connect(analyser);

    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    pitchFinder.value = Pitchfinder.YIN();

    const detectPitch = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const validData = dataArray.some((value) => Math.abs(value) > 0.01);
      console.log("Analyzing audio data...");

      if (!validData) {
        detectedFrequency.value = null;
        requestAnimationFrame(detectPitch);
        return;
      }

      const pitch = pitchFinder.value(dataArray, audioContext.sampleRate);
      if (pitch !== null && pitch >= 20 && pitch <= 5000) {
        console.log("Detected pitch:", pitch);
        detectedFrequency.value = pitch;
      } else {
        console.log("Invalid pitch detected:", pitch);
        detectedFrequency.value = null;
      }
      requestAnimationFrame(detectPitch);
    };

    detectPitch();
  } catch (err) {
    console.error("Error accessing audio stream: ", err);
  }
};

onMounted(() => {
  startTuner();
});
</script>

<style scoped>
.tuning-bar {
  position: relative;
  height: 60px;
  background-color: #333;
  border-radius: 8px;
  overflow: hidden;
}
.marker {
  transition: left 0.1s linear;
}
.scale {
  pointer-events: none;
}
.line {
  position: relative;
  width: 1px;
}
.bar {
  height: 30px;
  background-color: #666;
}
.note-display {
  min-width: 50px;
  text-align: center;
}
</style>
