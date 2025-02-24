<template>
  <div>
    <div>
      <h3>Recorded Audio:</h3>
    </div>

    <div :key="audioStore.currentAudio.id">
      <audio
        ref="audioElement"
        id="audio"
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
import { watch, onMounted } from "vue";
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";
const audioStore = audioFiles();
const persistedStore = persistedSettings();
const audio = document.getElementById("audio");

onMounted(() => {
  audio.volume = persistedStore.outputVolume;
  audio.setSinkId(persistedStore.selectedSpeaker);
});

watch(
  () => persistedStore.selectedSpeaker,
  (newSpeaker) => {
    audio.setSinkId(newSpeaker);
    audio.volume = persistedStore.outputVolume;
  },
);

watch(
  () => persistedStore.outputVolume,
  (newVolume) => {
    audio.volume = newVolume;
  },
);
</script>

<style scoped>
audio {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}
</style>
