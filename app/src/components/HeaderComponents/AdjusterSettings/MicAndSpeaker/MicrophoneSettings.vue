<template>
  <div>
    <!-- Modal Content -->
    <div>
      <!-- Microphone Selection -->
      <div class="mb-6">
        <label for="microphone" class="block text-white text-sm mb-2">
          Select Microphone:
        </label>
        <select
          id="microphone"
          v-model="store.selectedMicrophone"
          class="select select-bordered w-full"
        >
          <option
            v-for="device in store.microphones"
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ device.label || `Microphone ${device.deviceId}` }}
          </option>
        </select>
      </div>
    </div>

    <!-- slider -->
    <div class="audio-controls">
      <div>
        <label for="input-volume"
          >Input Volume (Microphone): {{ inputVolume.toFixed(2) }}</label
        >
        <input
          id="input-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model="inputVolume"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { settingsStore } from "../../../../stores/settings.js";
import { onMounted, computed } from "vue";

const store = settingsStore();

const inputVolume = computed({
  get: () => store.inputVolume,
  set: (value) => store.setInputVolume(value),
});

// Fetch devices when the modal is shown
onMounted(() => {
  if (store.showModal) {
    store.getDevices();
  }
});
</script>
