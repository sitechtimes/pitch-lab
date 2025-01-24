<template>
  <div>
    <!-- Speaker Selection -->
    <div class="mb-6">
      <h1 for="speaker" class="block text-white text-3xl mb-2">Speaker:</h1>
      <button
        @click="testSpeaker"
        class="bg-[#36C4E4] text-black w-[20%] rounded-lg mr-4"
      >
        Test Speaker
      </button>

      <select
        id="speaker"
        v-model="store.selectedSpeaker"
        class="select select-bordered w-[60%] text-black"
      >
        <option
          v-for="device in store.speakers"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label || `Speaker ${device.deviceId}` }}
        </option>
      </select>
    </div>
    <div v-if="isPlaying">
      <p>Volume: {{ currentVolume }}</p>
    </div>
  </div>
</template>

<script setup>
import { settingsStore } from "../../../../stores/settings.js";
import { onMounted, computed, ref } from "vue";

const store = settingsStore();
const isPlaying = ref(false);
const currentVolume = ref(0);

// Fetch devices when the modal is shown
onMounted(() => {
  if (store.showSettingsModal) {
    store.getDevices();
  }
});

const testSpeaker = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const analyser = audioContext.createAnalyser();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
  oscillator.connect(gainNode);
  gainNode.connect(analyser);
  analyser.connect(audioContext.destination);

  oscillator.start();
  isPlaying.value = true;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const updateVolume = () => {
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    currentVolume.value = Math.round(volume);
    if (isPlaying.value) {
      requestAnimationFrame(updateVolume);
    }
  };

  updateVolume();

  setTimeout(() => {
    oscillator.stop();
    isPlaying.value = false;
  }, 2000); // Play sound for 2 seconds
};
</script>
