<template>
  <div>
    <!-- Microphone Selection -->
    <div class="mb-6">
      <label for="microphone" class="block text-white text-sm mb-2">
        Select Microphone:
      </label>
      <select
        id="microphone"
        v-model="persistedStore.selectedMicrophone"
        class="select select-bordered w-full bg-tuner-bg text-white border-purple focus:ring-purple"
        :disabled="isLoading"
        @change="store.updateInputDevice(persistedStore.selectedMicrophone)"
      >
        <option v-if="isLoading" value="" disabled>
          Loading microphones...
        </option>
        <option
          v-for="device in store.microphones"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label || `Microphone ${device.deviceId.slice(0, 5)}` }}
        </option>
        <option v-if="store.microphones.length === 0" value="" disabled>
          No microphones found
        </option>
      </select>
    </div>

    <div>
      <button v-if="!isTesting" @click="testMic(), (isTesting = true)">
        Test Mic
      </button>
      <button
        v-if="isTesting"
        @click="(isTesting = false), (barStyle.opacity = 0)"
      >
        Stop testing
      </button>
    </div>

    <div id="dynamic-bar" :style="barStyle"></div>
    <div class="audio-controls mb-6">
      <label for="input-volume" class="block text-white text-sm mb-2">
        Input Volume: {{ persistedStore.inputVolume }}
      </label>
      <input
        id="input-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="persistedStore.inputVolume"
        class="w-full range range-purple"
      />
    </div>
    <div v-if="errorMessage" class="text-red-500 text-sm">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { settingsStore } from "../../../../stores/initialize";
import { persistedSettings } from "../../../../stores/persistedStore";
const store = settingsStore();
const persistedStore = persistedSettings();
const isLoading = ref(true);
const errorMessage = ref("");
const isTesting = ref(false);
const source = ref(null);
const averageVolume = ref(0);
let loop = null;

onMounted(async () => {
  isLoading.value = true;
  try {
    await store.initializeAudio();
    await store.getDevices();
    if (!persistedStore.selectedMicrophone && store.microphones.length > 0) {
      persistedStore.selectedMicrophone = store.microphones[0].deviceId;
    }
  } catch (error) {
    errorMessage.value = "Please allow microphone access to continue";
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

watch(
  () => persistedStore.inputVolume,
  (newVolume) => {
    store.setInputVolume(newVolume);
  },
);

const testMic = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      noiseSuppression: false,
      echoCancellation: true,
      autoGainControl: false,
      deviceId: persistedStore.selectedMicrophone,
    },
  });
  const analyser = store.audioContext.createAnalyser();
  analyser.fftSize = 512;

  source.value = store.audioContext.createMediaStreamSource(stream);
  source.value.connect(analyser);
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function calculateVolume() {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    averageVolume.value = sum / bufferLength;
  }
  loop = setInterval(calculateVolume, 100);

  watch(isTesting, () => {
    if (isTesting.value === false) {
      source.value.disconnect();
      clearInterval(loop);
      loop = null;
    }
  });
};

const barStyle = computed(() => {
  const opacity = averageVolume.value / 100;
  return {
    backgroundColor: `rgb(0, ${Math.min(255, averageVolume.value * 2.55)}, 0)`,
    opacity: opacity,
    width: "100%",
    height: "30px",
    transition: "background-color 0.3s, opacity 0.3s",
  };
});
</script>

<style scoped>
#dynamic-bar {
  width: 100%;
  height: 30px;
  transition:
    background-color 0.3s,
    opacity 0.3s;
}
</style>
