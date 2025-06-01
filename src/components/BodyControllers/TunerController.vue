<template>
  <div class="p-6 max-w-xl mx-auto space-y-6 text-white">
    <!-- Note Controls -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <button
        @click="prevNote"
        :disabled="noteIndex <= 0"
        class="px-5 py-2 text-xl font-bold bg-purple hover:bg-purple/90 rounded-lg transition disabled:opacity-40"
      >
        −
      </button>

      <select
        v-model="selectedNote"
        class="flex-1 px-4 py-2 text-xl rounded-lg bg-purple hover:bg-purple/90 text-white shadow focus:outline-none focus:ring-2 focus:ring-purple"
      >
        <option v-for="n in noteFrequencies" :key="n.note" :value="n.note">
          {{ n.note }} ({{ n.frequency.toFixed(2) }} Hz)
        </option>
      </select>

      <button
        @click="nextNote"
        :disabled="noteIndex >= noteFrequencies.length - 1"
        class="px-5 py-2 text-xl font-bold bg-purple hover:bg-purple/90 rounded-lg transition disabled:opacity-40"
      >
        +
      </button>
    </div>

    <!-- Play/Stop Button -->
    <button
      @click="toggleDrone"
      class="w-full py-3 text-lg font-semibold rounded-xl bg-purple hover:bg-purple/80 transition shadow-lg"
    >
      {{
        drone.isPlaying && drone.currentNote === selectedNote ? "Stop" : "Play"
      }}
      {{ selectedNote }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { droneStore } from "@/stores/droneStore";
import { noteFrequencies } from "@/constants/NoteFrequencies";

const drone = droneStore();
const selectedNote = ref("A4");

const noteIndex = computed(() =>
  noteFrequencies.findIndex((n) => n.note === selectedNote.value),
);

const setAndPlayNote = async (index) => {
  if (index >= 0 && index < noteFrequencies.length) {
    selectedNote.value = noteFrequencies[index].note;
    await drone.stopDrone();
    await drone.playDrone(selectedNote.value);
  }
};

const nextNote = async () => {
  if (noteIndex.value < noteFrequencies.length - 1) {
    await setAndPlayNote(noteIndex.value + 1);
  }
};

const prevNote = async () => {
  if (noteIndex.value > 0) {
    await setAndPlayNote(noteIndex.value - 1);
  }
};

const toggleDrone = async () => {
  if (drone.isPlaying && drone.currentNote === selectedNote.value) {
    drone.stopDrone();
  } else {
    await drone.playDrone(selectedNote.value);
  }
};
</script>
