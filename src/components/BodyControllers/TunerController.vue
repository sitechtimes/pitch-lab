<template>
  <div class="p-6 w-full max-w-xl mx-auto space-y-6 text-white">
    <!-- Note Controls -->
    <div
      class="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
    >
      <button
        @click="prevNote"
        :disabled="noteIndex <= 0"
        class="w-full sm:w-auto px-4 py-2 text-lg sm:text-xl font-bold bg-purple hover:bg-purple/90 rounded-lg transition disabled:opacity-40"
      >
        −
      </button>

      <select
        v-model="selectedNote"
        class="w-full px-3 py-2 text-lg sm:text-xl rounded-lg bg-purple hover:bg-purple/90 text-white shadow focus:outline-none focus:ring-2 focus:ring-purple"
      >
        <option v-for="n in noteFrequencies" :key="n.note" :value="n.note">
          {{ n.note }} ({{ n.frequency.toFixed(2) }} Hz)
        </option>
      </select>

      <button
        @click="nextNote"
        :disabled="noteIndex >= noteFrequencies.length - 1"
        class="w-full sm:w-auto px-4 py-2 text-lg sm:text-xl font-bold bg-purple hover:bg-purple/90 rounded-lg transition disabled:opacity-40"
      >
        +
      </button>
    </div>

    <!-- Play/Stop Button -->
    <button
      @click="toggleDrone"
      class="w-full py-3 text-base sm:text-lg font-semibold rounded-xl bg-purple hover:bg-purple/80 transition shadow-lg"
    >
      {{
        drone.isPlaying && drone.currentNote === selectedNote ? "Stop" : "Play"
      }}
      {{ selectedNote }}
    </button>

    <!-- Mic Volume Slider -->
    <!-- Mic Volume Slider -->
    <div
      class="flex flex-row md:flex-col lg:flex-row items-center w-full gap-2"
    >
      <span class="whitespace-nowrap text-sm">Mic Volume:</span>

      <div class="flex-1 min-w-0">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model="devices.inputVolume"
          class="w-full range range-primary"
        />
      </div>

      <span class="whitespace-nowrap text-sm">
        {{ (devices.inputVolume * 100).toFixed(0) }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { droneStore } from "@/stores/droneStore";
import { noteFrequencies } from "@/constants/NoteFrequencies";
import { devicesStore } from "@/stores/devices";

const drone = droneStore();
const devices = devicesStore();

const selectedNote = ref("A4");

const noteIndex = computed(() =>
  noteFrequencies.findIndex((n) => n.note === selectedNote.value),
);

async function setAndPlayNote(index) {
  if (index >= 0 && index < noteFrequencies.length) {
    selectedNote.value = noteFrequencies[index].note;
    await drone.stopDrone();
    await drone.playDrone(selectedNote.value);
  }
}

const nextNote = () => setAndPlayNote(noteIndex.value + 1);
const prevNote = () => setAndPlayNote(noteIndex.value - 1);

function toggleDrone() {
  if (drone.isPlaying && drone.currentNote === selectedNote.value) {
    drone.stopDrone();
  } else {
    drone.playDrone(selectedNote.value);
  }
}
</script>
