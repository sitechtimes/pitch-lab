<template>
  <div
    class="device-selector inset-0 flex items-center justify-center bg-red bg-opacity-50 z-50 absolute bg-black/30 p-4"
  >
    <div>
      <Button
        v-if="!audioStore.viewingDeleted"
        @click="audioStore.viewingDeleted = true"
        >Go to recently deleted</Button
      >
      <Button
        v-if="audioStore.viewingDeleted"
        @click="audioStore.viewingDeleted = false"
        >Go back to history</Button
      >
    </div>

    <div>
      <PastAudio v-if="!audioStore.viewingDeleted" />
      <RecentlyDeleted v-if="audioStore.viewingDeleted" />
    </div>

    <div v-if="audioStore.currentAudio">
      <div :key="audioStore.currentAudio.id">
        <h3>Recorded Audio:</h3>
        <audio
          :src="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
          controls
        ></audio>
        <a
          :href="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
          download="recorded-audio.mp4"
        >
          <button class="btn btn-ghost">
            <img :src="url" class="download-icon" />
          </button>
        </a>
      </div>
    </div>

    <div>
      <button
        @click="
          (audioStore.viewingHistory = false), (audioStore.currentAudio = null)
        "
      >
        Exit History
      </button>
    </div>
  </div>
</template>

<script setup>
import { audioFiles } from "@/stores/audioFiles";
import url from "../../../public/download-button.png";
import PastAudio from "./PastAudio.vue";
import RecentlyDeleted from "./RecentlyDeleted.vue";
const audioStore = audioFiles();
</script>

<style lang="css" scoped>
.download-icon {
  @apply w-6 h-6; /* Use Tailwind's utility classes to set the width and height */
  object-fit: contain; /* Ensure the image maintains its aspect ratio */
}
</style>
