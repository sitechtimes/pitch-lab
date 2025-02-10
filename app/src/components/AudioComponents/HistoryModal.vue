<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50"
  >
    <div
      class="bg-[#261b32] rounded-lg border-2 border-black shadow-lg p-6 w-[40%] relative"
    >
      <h1 class="text-3xl font-semibold mb-2">History</h1>
      <div class="flex flex-row justify-center">
        <div>
          <Button
            v-if="!audioStore.viewingDeleted"
            @click="audioStore.viewingDeleted = true"
            class="text-xl bg-purple rounded-full p-1 mb-2"
          >
            Go to recently deleted
          </Button>
          <Button
            v-if="audioStore.viewingDeleted"
            @click="audioStore.viewingDeleted = false"
            class="text-xl bg-purple rounded-full p-1 mb-2"
          >
            Go back to history
          </Button>
          <PastAudio v-if="!audioStore.viewingDeleted" />
          <RecentlyDeleted v-if="audioStore.viewingDeleted" />
        </div>
        <div v-if="audioStore.currentAudio">
          <AudioPlayback />
        </div>
      </div>
      <button
        @click="
          (audioStore.viewingHistory = false), (audioStore.currentAudio = null)
        "
        class="text-xl"
      >
        Exit History
      </button>
    </div>
  </div>
</template>

<script setup>
import { audioFiles } from "@/stores/audioFiles";
import AudioPlayback from "./AudioPlayback.vue";
import PastAudio from "./PastAudio.vue";
import RecentlyDeleted from "./RecentlyDeleted.vue";
const audioStore = audioFiles();
</script>

<style scoped>
.download-icon {
  @apply w-6 h-6; /* Use Tailwind's utility classes to set the width and height */
  object-fit: contain; /* Ensure the image maintains its aspect ratio */
}
</style>
