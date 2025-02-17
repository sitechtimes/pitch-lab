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

async function startDetection() {
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  analyser.value = audioContext.value.createAnalyser();
  analyser.value.fftSize = 4096;

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

    let maxIndex = 0;
    let maxAmplitude = -Infinity;

    // Find the bin with the highest amplitude
    for (let i = 1; i < bufferLength - 1; i++) {
      if (dataArray[i] > maxAmplitude) {
        maxAmplitude = dataArray[i];
        maxIndex = i;
      }
    }

    // Parabolic Interpolation for better frequency estimation
    let trueIndex = maxIndex;
    if (maxIndex > 0 && maxIndex < bufferLength - 1) {
      const alpha = dataArray[maxIndex - 1];
      const beta = dataArray[maxIndex];
      const gamma = dataArray[maxIndex + 1];

      const peakOffset = (0.5 * (alpha - gamma)) / (alpha - 2 * beta + gamma);
      trueIndex = maxIndex + peakOffset;
    }

    const sampleRate = audioContext.value.sampleRate;
    detectedFrequency.value = (trueIndex * sampleRate) / analyser.value.fftSize;

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
