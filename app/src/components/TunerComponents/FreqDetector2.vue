<template>
  <div class="flex flex-col items-center p-6">
    <h1 class="text-2xl font-bold mb-4">Frequency Detector</h1>

    <div v-if="isDetecting" class="text-lg font-semibold">
      Detected Frequency:
      <span class="text-blue-500">{{ detectedFrequency.toFixed(2) }} Hz</span>
    </div>

    <button
      @click="toggleDetection"
      class="mt-4 px-6 py-3 text-white rounded-lg shadow"
      :class="isDetecting ? 'bg-red-500' : 'bg-green-500'"
    >
      {{ isDetecting ? "Stop Detection" : "Start Detection" }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const audioContext = ref(null);
const analyser = ref(null);
const isDetecting = ref(false);
const detectedFrequency = ref(0);
let animationFrameId = null;
const frequencyHistory = [];
const maxHistorySize = 5; // Adjust for smoother averaging

async function startDetection() {
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  analyser.value = audioContext.value.createAnalyser();

  // Increase FFT size with zero padding for better frequency resolution
  analyser.value.fftSize = 8192; // Larger FFT size improves low-frequency accuracy

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.value.createMediaStreamSource(stream);
  source.connect(analyser.value);

  isDetecting.value = true;
  detectFrequency();
}

function stopDetection() {
  if (audioContext.value) {
    audioContext.value.close();
    audioContext.value = null;
  }
  isDetecting.value = false;
  cancelAnimationFrame(animationFrameId);
  frequencyHistory.length = 0; // Reset history when stopping
}

function toggleDetection() {
  if (isDetecting.value) {
    stopDetection();
  } else {
    startDetection();
  }
}

function detectFrequency() {
  const bufferLength = analyser.value.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);

  function update() {
    if (!isDetecting.value) return;

    analyser.value.getFloatFrequencyData(dataArray);

    // Zero Padding: Extend dataArray size by adding zeros
    const paddedArray = new Float32Array(analyser.value.fftSize);
    paddedArray.set(dataArray); // Copy original data
    // The remaining elements are already zero, effectively applying zero-padding

    let maxIndex = 0;
    let maxAmplitude = -Infinity;

    for (let i = 0; i < bufferLength; i++) {
      if (paddedArray[i] > maxAmplitude) {
        maxAmplitude = paddedArray[i];
        maxIndex = i;
      }
    }

    const sampleRate = audioContext.value.sampleRate;
    const currentFreq = (maxIndex * sampleRate) / analyser.value.fftSize;

    // Add to history and maintain max size
    if (currentFreq > 0) {
      frequencyHistory.push(currentFreq);
      if (frequencyHistory.length > maxHistorySize) {
        frequencyHistory.shift(); // Remove oldest value
      }
    }

    // Compute smoothed frequency
    const averagedFreq =
      frequencyHistory.reduce((sum, freq) => sum + freq, 0) /
      frequencyHistory.length;

    detectedFrequency.value = averagedFreq || 0;

    animationFrameId = requestAnimationFrame(update);
  }

  update();
}
</script>

<style scoped>
button {
  transition: background 0.3s ease-in-out;
}
</style>
