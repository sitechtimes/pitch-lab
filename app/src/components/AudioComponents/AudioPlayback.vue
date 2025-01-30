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
import { onMounted } from "vue";
import { settingsStore } from "@/stores/settings.js"; // Adjust to your store path
import { audioFiles } from "@/stores/audioFiles";
const settings = settingsStore();
const audioStore = audioFiles();

// Methods
const setupAudioRouting = () => {
  const audioContext = settings.audioContext; // Get Tone.js context from the store

  // Create a source node from the audio element
  const audioSource = audioContext.createMediaElementSource(
    audioStore.currentAudio.audio,
  );

  // Example: Apply a gain node (volume control)
  const gainNode = audioContext.createGain();
  gainNode.gain.value = settings.volume; // Set the initial volume from the store

  // Connect the source to the gain node, and then to the Tone.js context destination (the speakers)
  audioSource.connect(gainNode);
  gainNode.connect(audioContext.destination);
};

onMounted(() => {
  setupAudioRouting();
});
</script>

<style scoped>
audio {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}
</style>
