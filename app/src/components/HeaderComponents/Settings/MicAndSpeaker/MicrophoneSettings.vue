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
          @change="updateMicrophone"
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
  </div>
</template>

<script setup>
import { settingsStore } from "../../../../stores/settings.js";
import { onMounted } from "vue";

const store = settingsStore();

// Fetch devices when the modal is shown
onMounted(() => {
  if (store.showModal) {
    store.getDevices();
  }
});
</script>
