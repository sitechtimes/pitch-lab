<template>
  <div
    class="flex items-center justify-between p-4 bg-gray-900 rounded-md text-white max-w-sm"
  >
    <!-- Label -->
    <div class="flex flex-col">
      <label for="tuning" class="text-lg font-semibold mb-2 text-gray-300">
        Tuner
      </label>

      <!-- Dropdown -->
      <div class="relative">
        <select
          v-model="selectedOption"
          @change="stopOscillator"
          class="bg-gray-800 text-gray-300 border border-gray-600 rounded px-4 py-1 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option
            v-for="option in tuningOptions"
            :key="option.name"
            :value="option"
          >
            Tune to {{ option.name }}
          </option>
        </select>
        <!-- Dropdown Arrow -->
        <div
          class="absolute inset-y-0 right-2 flex items-center pointer-events-none"
        >
          <div
            class="w-2.5 h-2.5 border-t-2 border-r-2 rotate-45 border-purple-500"
          ></div>
        </div>
      </div>
    </div>

    <!-- Listen Button -->
    <button
      @click="togglePlay"
      class="bg-blue-600 hover:bg-blue-700 text-gray-100 font-bold py-2 px-4 rounded shadow-md transition duration-200"
    >
      {{ isPlaying ? "Stop Listening" : "Listen" }}
    </button>

    <!-- Volume Slider -->
    <div class="flex items-center ml-4">
      <div class="text-gray-300 mr-2">
        <span>&#128266;</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        v-model="volume"
        @input="updateVolume"
        class="w-24 h-1 bg-gray-700 rounded appearance-none focus:outline-none accent-purple-500"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useSelectedNoteStore } from "@/stores/selectedNote";
import { tuningOptions } from "@/constants/TuningOptions";

// Initialize the store
const store = useSelectedNoteStore();

// Bind the selected option to the store's state
const selectedOption = ref(store.selectedNote); // Default to the current value in the store
const isPlaying = ref(false); // Toggle play state
let audioCtx = null;
let oscillator = null;
let gainNode = null;
const volume = ref(50); // Default volume at 50%

// Watch for changes in `selectedOption` and update the store
watch(selectedOption, (newValue) => {
  store.updateSelectedNote(newValue);
});

// Start or stop the audio
const togglePlay = () => {
  if (isPlaying.value) {
    stopOscillator();
  } else {
    startOscillator();
  }
};

// Start the oscillator
const startOscillator = () => {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Create a gain node for volume control
  gainNode = audioCtx.createGain();
  gainNode.gain.value = volume.value / 100;

  // Create the oscillator
  oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(
    selectedOption.value.frequency,
    audioCtx.currentTime,
  );

  // Connect the nodes and play
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();

  isPlaying.value = true; // Update playing state
};

// Stop the oscillator
const stopOscillator = () => {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  isPlaying.value = false; // Update playing state
};

// Update the volume dynamically
const updateVolume = () => {
  if (gainNode) {
    gainNode.gain.value = volume.value / 100;
  }
};
</script>

<style scoped>
/* Tailwind classes are already applied inline */
</style>
