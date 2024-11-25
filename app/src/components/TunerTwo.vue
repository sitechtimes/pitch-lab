<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100"
  >
    <h1 class="text-3xl font-bold text-gray-700 mb-6">Pitch Finder</h1>
    <p class="text-gray-600 mb-4">
      Click the button below to start detecting pitch.
    </p>
    <button
      @click="startPitchDetection"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
    >
      Start Pitch Detection
    </button>
    <div v-if="pitch" class="mt-8 text-center">
      <p class="text-2xl font-semibold text-gray-800">
        Detected Note: {{ note }}
      </p>
      <p class="text-lg text-gray-600">Frequency: {{ pitch.toFixed(2) }} Hz</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Pitchfinder from "pitchfinder";

// Reactive variables
const pitch = ref(null);
const note = ref("");
let audioContext = null;
let analyser = null;

// Start pitch detection
const startPitchDetection = async () => {
  try {
    // Request microphone input
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    // Initialize YIN algorithm
    const pitchFinder = Pitchfinder.YIN({
      sampleRate: audioContext.sampleRate,
    });

    // Define note names
    const noteNames = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];

    // Helper function to get note name
    const getNoteName = (frequency) => {
      const A4 = 440; // Frequency of A4
      const semitone = 12 * Math.log2(frequency / A4);
      const noteIndex = Math.round(semitone) + 69; // MIDI note number
      const octave = Math.floor(noteIndex / 12) - 1;
      const note = noteNames[noteIndex % 12];
      return `${note}${octave}`;
    };

    // Detect pitch in real-time
    const dataArray = new Float32Array(analyser.fftSize);
    const detect = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const detectedPitch = pitchFinder(dataArray);
      if (detectedPitch) {
        pitch.value = detectedPitch;
        note.value = getNoteName(detectedPitch);
      } else {
        pitch.value = null;
        note.value = "No pitch detected";
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
body {
}
</style>
