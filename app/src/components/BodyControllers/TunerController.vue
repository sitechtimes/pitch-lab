<template>
  <div
    class="p-6 bg-controllers-bg rounded-xl shadow-md flex flex-col items-center gap-6 w-full max-w-md mx-auto"
  >
    <h2 class="text-2xl font-bold text-gray-800">Drone Generator</h2>

    <div class="w-full">
      <label class="block text-gray-700 font-semibold mb-2">Select Note:</label>
      <select
        v-model="selectedNote"
        class="w-full px-4 py-2 bg-purple-600 bg-purple text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
      >
        <option
          v-for="(freq, note) in noteFrequencies"
          :key="note"
          :value="note"
        >
          {{ note }} ({{ freq }} Hz)
        </option>
      </select>
    </div>

    <div class="w-full flex items-center justify-between">
      <span class="text-gray-700 font-medium">Volume</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model.number="volume"
        @input="updateVolume"
        class="w-3/4 h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer"
      />
    </div>

    <button
      @click="toggleDrone"
      class="bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow hover:bg-purple-600 transition"
    >
      {{ isDronePlaying ? "Stop Drone" : "Play Drone" }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { droneStore } from "@/stores/droneStore";
import { devicesStore } from "@/stores/devices";

const drone = droneStore();
const devices = devicesStore();

const selectedNote = computed({
  get: () => drone.selectedNote,
  set: (val) => (drone.selectedNote = val),
});

const isDronePlaying = computed(() => drone.isDronePlaying);
const noteFrequencies = computed(() => drone.noteFrequencies);
const volume = computed(() => devices.outputVolume);

const toggleDrone = () => {
  if (drone.isDronePlaying) {
    drone.stopDrone();
  } else {
    drone.playDrone();
  }
};

const updateVolume = (event) => {
  devices.setOutputVolume(event.target.valueAsNumber);
};
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  background: #7e22ce;
  border: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  background: #7e22ce;
  border: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}
</style>
