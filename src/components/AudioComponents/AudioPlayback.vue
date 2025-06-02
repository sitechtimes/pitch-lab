<template>
  <div>
    <div
      :key="audioStore.currentRecording.id"
      class="flex flex-col items-center"
    >
      <audio
        ref="audioElement"
        id="audio"
        controls
        :src="'data:audio/wav;base64,' + audioStore.currentRecording.audio"
      ></audio>
      <a
        :href="'data:audio/wav;base64,' + audioStore.currentRecording.audio"
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
import { audioFilesStore } from "@/stores/audioFiles";
import { devicesStore } from "@/stores/devices";
const audioStore = audioFilesStore();
const devices = devicesStore();
const audio = useTemplateRef("audioElement");

onMounted(() => {
  console.log(audio);
  if (audioElement.value) {
    audio.value.volume = devices.outputVolume;
    audio.value.setSinkId(devices.selectedSpeaker);  
  }
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
