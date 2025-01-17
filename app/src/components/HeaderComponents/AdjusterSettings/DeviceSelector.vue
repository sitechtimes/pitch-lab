<template>
  <div
    class="device-selector fixed inset-0 flex items-center justify-center bg-opacity-50 z-50"
  >
    <!-- Modal Header -->
    <h2 class="text-2xl text-white font-semibold mb-4">Select Devices</h2>
    <div
      class="bg-[#261b32] rounded-lg border-2 border-black shadow-lg p-6 w-[38%] relative"
    >
      <SpeakerSettings />
      <hr class="my-4 border-[.12rem] border-[#A3D10A] w-[80%] mx-auto" />
      <MicrophoneSettings />   
      <button
        class="btn btn-outline btn-success bg-[#7210E3] mr-4"
        @click="saveSettings"
      >
        Save
      </button>
      <button
        class="btn btn-outline btn-error bg-[#7210E3]"
        @click="store.toggleModal"
      >
        Cancel
      </button>
    </div>
    <!-- Modal Footer -->
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
