<template>
  <div>
    <div></div>

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
          () => {
            audioStore.viewingHistory = false;
            audioStore.currentAudio = null;
          }
        "
      >
        Exit History
      </button>
    </div>
  </div>
</template>

<script setup>
import { audioFiles } from "@/stores/audioFiles";
import PastAudio from "./PastAudio.vue";
import RecentlyDeleted from "./RecentlyDeleted.vue";
const audioStore = audioFiles();
</script>
