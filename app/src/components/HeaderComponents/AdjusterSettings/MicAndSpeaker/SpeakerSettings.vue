<template>
  <div>
    <!-- Speaker Selection -->
    <div class="mb-6">
      <h1 for="speaker" class="block text-white text-3xl mb-2">Speaker:</h1>
      <button
        @click="testSpeaker"
        class="bg-[#36C4E4] text-black w-[20%] rounded-lg mr-4"
      >
        Test Speaker
      </button>

      <select
        id="speaker"
        v-model="store.selectedSpeaker"
        class="select select-bordered w-[60%] text-black"
      >
        <option
          v-for="device in store.speakers"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label || `Speaker ${device.deviceId}` }}
        </option>
      </select>
    </div>
    <div v-if="isPlaying">
      <p>Volume: {{ currentVolume }}</p>
    </div>
  </div>
</template>

<script setup>
import { settingsStore } from "../../../../stores/settings.js";
import { onMounted } from "vue";

const store = settingsStore();

// Fetch devices when the modal is shown
onMounted(() => {
  if (store.showSettingsModal) {
    store.getDevices();
  }
});
</script>
