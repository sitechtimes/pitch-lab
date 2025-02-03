<template>
  <div>
    <audio
      ref="audioElement"
      controls
      :src="audioStore.currentAudio.audio"
    ></audio>

    <a
      :href="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
      download="recorded-audio.mp4"
    ></a>

    <button class="btn btn-ghost">
      <img :src="url" class="download-icon" />
    </button>
  </div>
</template>

<script setup>
import url from "../../../public/download-button.png";
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
