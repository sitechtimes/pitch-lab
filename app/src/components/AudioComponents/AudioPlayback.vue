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
import { ref, onMounted } from "vue";
import { audioFiles } from "@/stores/audioFiles";
// import WaveSurfer from 'wavesurfer.js';

const audioStore = audioFiles();
// const showWaveform = ref(false);
// const waveformCanvas = ref(null);
// const audioElement = ref(null);

// const toggleWaveform = () => {
//   showWaveform.value = !showWaveform.value;
//   if (showWaveform.value) {
//     createWaveform();
//   }
// };

// const createWaveform = () => {
//   const wavesurfer = WaveSurfer.create({
//     container: waveformCanvas.value,
//     waveColor: 'violet',
//     progressColor: 'purple'
//   });
//   wavesurfer.load(audioElement.value);
// };

// onMounted(() => {
//   if (showWaveform.value) {
//     createWaveform();
//   }
// });
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
