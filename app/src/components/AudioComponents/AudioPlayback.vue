<template>
  <div>
    <div>
      <h3>Recorded Audio:</h3>
    </div>

    <div>
      <audio
        ref="audioElement"
        controls
        :src="audioStore.currentAudio.audio"
      ></audio>
    </div>

    <div>
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
