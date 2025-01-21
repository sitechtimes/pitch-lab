<template>
  <div>
    <!-- Modal Content -->
    <div>
      <!-- Microphone Selection -->
      <div class="mb-6">
        <h1 for="microphone" class="block text-white text-3xl mb-2">
          Microphone:
        </h1>
        <button class="bg-[#A3D10A] text-black w-[20%] rounded-lg mr-4">Test Microphone</button>
        <select
          id="microphone"
          v-model="store.selectedMicrophone"
          @change="updateMicrophone"

          class="select select-bordered w-[60%] text-black"
        >
          <option
            v-for="device in store.microphones"
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ device.label || `Microphone ${device.deviceId}` }}
          </option>
        </select>        
        <h2 class="my-3">Output Level:</h2><label for="input-volume"
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
