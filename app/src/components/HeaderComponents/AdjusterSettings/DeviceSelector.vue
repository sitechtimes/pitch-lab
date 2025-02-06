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

      <!-- Modal Footer -->
      <div class="space-x-4">
        <button
          class="btn btn-outline btn-error"
          @click="store.showSettingsModal"
        >
          Exit
        </button>
      </div>
      </div>

    <!-- Modal Footer -->
  </div>

</template>

<script setup>
import SpeakerSettings from "./MicAndSpeaker/SpeakerSettings.vue";
import MicrophoneSettings from "./MicAndSpeaker/MicrophoneSettings.vue";

import { settingsStore } from "../../../stores/settings.js";
const store = settingsStore();
</script>

<style scoped></style>
