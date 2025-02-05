<template>
  <div>
    <!-- Speaker Selection -->
    <div class="mb-6">
      <label for="speaker" class="block text-white text-sm mb-2">
        Select Speaker:
      </label>
      <select
        id="speaker"
        v-model="selectedSpeaker"
        class="select select-bordered w-full bg-tuner-bg text-white border-purple focus:ring-purple"
        :disabled="isLoading"
        @change="handleSpeakerChange"
      >
        <option v-if="isLoading" value="" disabled>Loading speakers...</option>
        <option
          v-for="device in store.speakers"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{
            device.label ||
            (device.deviceId
              ? `Speaker ${shortId(device.deviceId)}`
              : "System Default")
          }}
        </option>
        <option v-if="store.speakers.length === 0" value="" disabled>
          No speakers found
        </option>
      </select>
    </div>

    <!-- Volume Control -->
    <div class="audio-controls mb-6">
      <label for="output-volume" class="block text-white text-sm mb-2">
        Output Volume: {{ store.outputVolume.toFixed(2) }}
      </label>
      <input
        id="output-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model.number="store.outputVolume"
        class="w-full range range-purple"
        @input="store.setOutputVolume(store.outputVolume)"
      />
    </div>

    <!-- Audio Visualization -->
    <div class="visualization-container mb-6">
      <canvas
        ref="visualizerCanvas"
        class="w-full h-32 bg-tuner-bg rounded-lg"
      ></canvas>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="text-red-500 text-sm">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { settingsStore } from "../../../../stores/settings";
import { persistedSettings } from "../../../../stores/persistedStore";

const store = settingsStore();
const persistedStore = persistedSettings();
const visualizerCanvas = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");
const animationFrameId = ref(null);
const selectedSpeaker = ref(persistedStore.selectedSpeaker);

// Visualization setup
let analyser = null;
let bufferLength = null;
let dataArray = null;

const setupVisualizer = () => {
  if (!store.audioContext.value) return;

  analyser = store.audioContext.value.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  // Connect audio output to analyser
  store.outputGainNode.value.connect(analyser);

  drawVisualizer();
};

const drawVisualizer = () => {
  if (!visualizerCanvas.value || !analyser) return;

  const canvas = visualizerCanvas.value;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "#120E1D";
  ctx.fillRect(0, 0, width, height);

  // Draw purple bars
  const barWidth = (width / bufferLength) * 2.5;
  let x = 0;

  ctx.fillStyle = "#7210E3";
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * height;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }

  animationFrameId.value = requestAnimationFrame(drawVisualizer);
};

const shortId = (id) => id.slice(0, 5);

onMounted(async () => {
  isLoading.value = true;
  try {
    // First initialize audio to ensure permission
    await store.initializeAudio();
    await store.getDevices();

    if (!persistedStore.selectedSpeaker && store.speakers.length > 0) {
      persistedStore.selectedSpeaker = store.speakers[0].deviceId;
    }

    selectedSpeaker.value = persistedStore.selectedSpeaker;

    setupVisualizer();

    console.log(`Speaker initialized: ${selectedSpeaker.value}`);
  } catch (error) {
    errorMessage.value = "Please allow speaker access to continue";
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const handleSpeakerChange = async () => {
  try {
    if (selectedSpeaker.value) {
      // Update the persisted store first
      persistedStore.selectedSpeaker = selectedSpeaker.value;

      // Update the output device in the audio pipeline
      await store.updateOutputDevice(selectedSpeaker.value);

      console.log(`Speaker updated to: ${selectedSpeaker.value}`);
    }
  } catch (error) {
    errorMessage.value = `Failed to switch speaker: ${error.message}`;
    // Revert selection on error
    selectedSpeaker.value = persistedStore.selectedSpeaker;
  }
};

// Cleanup

onMounted(async () => {
  try {
    await store.initializeAudio();
    await store.getDevices();

    // Handle default speaker
    if (!persistedStore.selectedSpeaker) {
      await store.updateOutputDevice(""); // System default
    }
  } catch (error) {
    errorMessage.value = "Error initializing audio output";
    console.log(error);
  }
});
</script>
