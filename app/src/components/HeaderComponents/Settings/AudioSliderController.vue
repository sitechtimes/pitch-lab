<template>
  <div class="audio-controls">
    <div>
      <label for="input-volume"
        >Input Volume (Microphone): {{ inputVolume.toFixed(2) }}</label
      >
      <input
        id="input-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="inputVolume"
      />
    </div>
    <div>
      <label for="output-volume"
        >Output Volume (Speaker): {{ outputVolume.toFixed(2) }}</label
      >
      <input
        id="output-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="outputVolume"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { settingsStore } from "@/stores/settings";

const settings = settingsStore();

const inputVolume = computed({
  get: () => settings.inputVolume,
  set: (value) => settings.setInputVolume(value),
});

const outputVolume = computed({
  get: () => settings.outputVolume,
  set: (value) => settings.setOutputVolume(value),
});

// Methods to control playback
const playAudio = () => {
  settings.initializeAudio();
  settings.playAudio();
};

const pauseAudio = () => {
  settings.pauseAudio();
};
</script>

<style scoped>
.audio-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

input[type="range"] {
  width: 200px;
}

button {
  margin: 10px;
}
</style>
