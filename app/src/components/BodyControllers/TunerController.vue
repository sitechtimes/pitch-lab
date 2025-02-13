<template>
  <div class="flex flex-col">
    <div
      class="flex items-center justify-between p-4 bg-gray-900 rounded-md text-white max-w-sm"
    >
      <!-- Label -->
      <div class="flex flex-col">
        <label for="tuning" class="text-lg font-semibold mb-2 text-gray-300">
          Tuner
        </label>
        <!-- Dropdown -->
        <div class="relative text-black">
          <select
            v-model="store.selectedNote"
            class="bg-gray-800 text-gray-300 border border-gray-600 rounded px-4 py-1 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <!-- <option
              v-for="option in tuningOptions"
              :key="option.name"
              :value="option"
            >
              Tune to {{ option.name }}
            </option> -->
          </select>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { settingsStore } from "@/stores/settings";
// import { tuningOptions } from "@/constants/NoteFrequencies";
import { persistedSettings } from "@/stores/persistedStore";

const store = settingsStore();
const persistedStore = persistedSettings();
const isPlaying = ref(false); // Toggle play state
let audioCtx = null;
let oscillator = null;
let gainNode = null;

// Initialize volume from persisted settings
const volume = ref(persistedStore.outputVolume * 100); // Convert to percentage

// Start or stop the audio
const togglePlay = async () => {
  if (isPlaying.value) {
    stopOscillator();
  } else {
    await startOscillator();
  }
};

// Start the oscillator
const startOscillator = async () => {
  if (!store.selectedNote || !store.selectedNote.frequency) {
    alert("Please select a valid note.");
    return;
  }

  try {
    // Create the audio context
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create a gain node for volume control
    gainNode = audioCtx.createGain();
    gainNode.gain.value = volume.value / 100; // Set initial volume

    // Create the oscillator
    oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      store.selectedNote.frequency, // Use the selected note's frequency
      audioCtx.currentTime,
    );

    // Connect the oscillator to the gain node
    oscillator.connect(gainNode);

    // Use the persisted speaker from settingsStore
    const destination = audioCtx.createMediaStreamDestination();
    gainNode.connect(destination);

    // Update the output device using the settingsStore function
    await store.updateOutputDevice(persistedStore.selectedSpeaker);

    // Play the audio through the selected speaker
    const audioElement = new Audio();
    audioElement.srcObject = destination.stream;
    audioElement.play();

    // Start the oscillator
    oscillator.start();
    isPlaying.value = true; // Update playing state
  } catch (error) {
    console.error("Error starting oscillator:", error);
    alert("Failed to start audio. Please check your speaker settings.");
  }
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
    gainNode.gain.value = volume.value / 100; // Update gain value
  }
  // Save the updated volume to persisted settings
  store.setOutputVolume(volume.value / 100);
};

// Initialize volume when the component mounts
onMounted(() => {
  volume.value = persistedStore.outputVolume * 100; // Sync with persisted volume
});
</script>

<!-- <style scoped>
/* Tailwind classes are already applied inline */
</style> -->
