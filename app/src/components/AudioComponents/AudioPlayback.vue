<template>
  <div>
    <div>
      <h3>Recorded Audio:</h3>
    </div>

    <div :key="audioStore.currentAudio.id">
      <audio
        ref="audioElement"
        controls
        :src="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
      ></audio>
    </div>

    <div>
      <a
        :href="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
        download="recorded-audio.mp4"
      >
        Download
      </a>
    </div>
  </div>
</template>

<script setup>
import { audioFiles } from "@/stores/audioFiles";
const audioStore = audioFiles();
</script>

<style scoped>
audio {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}
</style>
