<template>
  <div>
    <!-- Microphone Selection -->
    <div class="mb-6">
      <label for="microphone" class="block text-white text-sm mb-2">
        Select Microphone:
      </label>
      <select
        id="microphone"
        v-model="devices.selectedMicrophone"
        class="select select-bordered w-full bg-tuner-bg text-white border-purple focus:ring-purple"
        @change="devices.updateInputDevice()"
      >
        <option
          v-for="device in devices.microphones"
          :key="device.deviceId || device.label"
          :value="device"
        >
          {{ device.label || `Microphone ${device.deviceId.slice(0, 5)}` }}
        </option>

        <option v-if="devices.microphones.length === 0" value="" disabled>
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
        Input Volume: {{ devices.inputVolume }}
      </label>
      <input
        id="input-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="devices.inputVolume"
        class="w-full range range-purple"
      />
    </div>
    <div v-if="errorMessage" class="text-red-500 text-sm">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { devicesStore } from "@/stores/devices";
import { initializeStore } from "../../../../stores/initialize";

const initialize = initializeStore();
const devices = devicesStore();
const errorMessage = ref("");
const isTesting = ref(false);
const averageVolume = ref(0);
let loop = null;

watch(
  () => devices.inputVolume,
  (newVolume) => {
    devices.setInputVolume(newVolume);
  },
);

const testMic = async () => {
  initialize.source.connect(initialize.analyser);
  const bufferLength = initialize.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function calculateVolume() {
    initialize.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    averageVolume.value = sum / bufferLength;
  }
  loop = setInterval(calculateVolume, 100);

  watch(isTesting, () => {
    if (isTesting.value === false) {
      initialize.source.disconnect();
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
