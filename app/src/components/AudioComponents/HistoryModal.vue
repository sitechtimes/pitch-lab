<template>
  <div>
    <div>
      <button
        v-if="!audioStore.viewingDeleted"
        @click="audioStore.viewingDeleted = true"
      >
        Go to recently deleted
      </button>
      <button
        v-if="audioStore.viewingDeleted"
        @click="audioStore.viewingDeleted = false"
      >
        Go back to history
      </button>
    </div>

    <div>
      <PastAudio v-if="!audioStore.viewingDeleted" />
      <RecentlyDeleted v-if="audioStore.viewingDeleted" />
    </div>

    <div v-if="audioStore.currentAudio">
      <div :key="audioStore.currentAudio.id">
        <AudioPlayback />
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
import AudioPlayback from "./AudioPlayback.vue";
import PastAudio from "./PastAudio.vue";
import RecentlyDeleted from "./RecentlyDeleted.vue";
const audioStore = audioFiles();
</script>
