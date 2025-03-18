<template>
  <div>
    <div>
      <h3>Recorded Audio:</h3>
    </div>

    <div :key="audioStore.currentRecording.id">
      <audio
        ref="audioElement"
        id="audio"
        controls
        :src="'data:audio/wav;base64,' + audioStore.currentRecording.audio"
      ></audio>
    </div>

    <div>
      <a
        :href="'data:audio/wav;base64,' + audioStore.currentRecording.audio"
        download="recorded-audio.mp4"
      >
        Download
      </a>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, useTemplateRef } from "vue";
import { audioFilesStore } from "@/stores/audioFiles";
import { devicesStore } from "@/stores/devices";

const audioStore = audioFilesStore();
const devices = devicesStore();
const audio = useTemplateRef("audioElement");

onMounted(() => {
  console.log(audio);
  audio.value.volume = devices.outputVolume;
  audio.value.setSinkId(devices.selectedSpeaker);
});

watch(
  () => devices.selectedSpeaker,
  (newSpeaker) => {
    audio.value.setSinkId(newSpeaker);
    audio.value.volume = devices.outputVolume;
  },
);

watch(
  () => devices.outputVolume,
  (newVolume) => {
    audio.value.volume = newVolume;
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
