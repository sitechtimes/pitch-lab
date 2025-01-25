<template>
  <div
    class="device-selector fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <!-- Modal Header -->
    <div class="bg-gray-800 rounded-lg shadow-lg p-6 w-96 relative">
      <h2 class="text-2xl text-white font-semibold mb-4">Select Devices</h2>
      <MicrophoneSettings />
      <SpeakerSettings />

      <!-- Modal Footer -->
      <div class="space-x-4">
        <button class="btn btn-outline btn-success" @click="saveSettings">
          Save
        </button>
        <button
          class="btn btn-outline btn-error"
          @click="store.showSettingsModal = false"
        >
          Exit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import SpeakerSettings from "./MicAndSpeaker/SpeakerSettings.vue";
import MicrophoneSettings from "./MicAndSpeaker/MicrophoneSettings.vue";

import { settingsStore } from "../../../stores/settings.js";
const store = settingsStore();

const saveSettings = () => {
  store.initializeAudio();
  store.showSettingsModal = false;
};
</script>

<style scoped></style>
