<template>
  <div>
    <div :key="audioStore.currentAudio.id" class="flex flex-col items-center">
      <audio
        ref="audioElement"
        id="audio"
        controls
        :src="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
      ></audio>
      <a
        :href="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
        download="recorded-audio.mp4"
      >
        Download
      </a>
    </div>

    <!-- <div>
      <button @click="toggleWaveform">Toggle Waveform</button>
    </div>

    <div v-if="showWaveform">
      <canvas ref="waveformCanvas"></canvas>
    </div> -->
  </div>
</template>

<script setup>
import { watch, onMounted, useTemplateRef } from "vue";
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";
const audioStore = audioFiles();
const persistedStore = persistedSettings();
const audio = useTemplateRef("audioElement");

onMounted(() => {
  console.log(audio);
  audio.value.volume = persistedStore.outputVolume;
  audio.value.setSinkId(persistedStore.selectedSpeaker);
});

watch(
  () => persistedStore.selectedSpeaker,
  (newSpeaker) => {
    audio.value.setSinkId(newSpeaker);
    audio.value.volume = persistedStore.outputVolume;
  },
);

watch(
  () => persistedStore.outputVolume,
  (newVolume) => {
    audio.value.volume = newVolume;
  },
);
</script>

<style scoped>
/* audio {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}
canvas {
  width: 100%;
  height: 100px;
} */
</style>
