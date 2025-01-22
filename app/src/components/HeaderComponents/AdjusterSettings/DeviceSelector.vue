<template>
  <div
    class="device-selector fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <!-- Modal Header -->
    <h2 class="text-2xl text-white font-semibold mb-4">Select Devices</h2>
    <div class="bg-gray-800 rounded-lg shadow-lg p-6 w-96 relative">
      <MicrophoneSettings />
      <SpeakerSettings />
    </div>
    <!-- Modal Footer -->
    <div class="flex justify-end space-x-4">
      <button class="btn btn-outline btn-success" @click="saveSettings">
        Save
      </button>
      <button class="btn btn-outline btn-error" @click="store.toggleModal">
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { settingsStore } from "../../../stores/settings.js";
import SpeakerSettings from "./MicAndSpeaker/SpeakerSettings.vue";
import MicrophoneSettings from "./MicAndSpeaker/MicrophoneSettings.vue";
const store = settingsStore();

// Fetch devices when the modal is shown

const saveSettings = () => {
  store.updateMicrophone(store.selectedMicrophone);
  store.updateSpeaker(store.selectedSpeaker);
  store.toggleModal;
};
</script>

<style scoped></style>
