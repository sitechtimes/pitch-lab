<template>
  <div
    class="drone-generator p-4 border border-gray-300 rounded-lg max-w-md mx-auto text-center"
  >
    <h3 class="text-lg font-semibold mb-4">Drone Generator</h3>
    <div class="controls flex flex-col gap-4">
      <!-- Note Selection -->
      <div class="note-selector flex items-center gap-2 justify-center">
        <label for="note-select" class="text-sm font-medium">Note:</label>
        <select
          id="note-select"
          v-model="localSelectedNote"
          @change="updateNote"
          class="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="note in availableNotes" :key="note" :value="note">
            {{ note }}
          </option>
        </select>
      </div>

      <!-- Octave Adjustment -->
      <div class="octave-controls flex items-center gap-2 justify-center">
        <label class="text-sm font-medium">Octave:</label>
        <button
          @click="shiftOctave(-1)"
          :disabled="currentOctave <= minOctave"
          class="px-3 py-1 border border-gray-300 rounded-md bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span class="text-lg">{{ currentOctave }}</span>
        <button
          @click="shiftOctave(1)"
          :disabled="currentOctave >= maxOctave"
          class="px-3 py-1 border border-gray-300 rounded-md bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <!-- Play/Stop Button -->
      <button
        class="play-toggle px-4 py-2 rounded-md text-white font-semibold"
        :class="{
          'bg-green-600 hover:bg-green-700': !isDronePlaying,
          'bg-red-600 hover:bg-red-700': isDronePlaying,
        }"
        @click="toggleDrone"
      >
        {{ isDronePlaying ? "Stop" : "Play" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { droneStore } from "@/stores/droneStore"; // Corrected import for Pinia store

// Initialize store
const drones = droneStore();

// Reactive state
const localSelectedNote = ref(drones.selectedNote);
const currentOctave = ref(4); // Default octave (e.g., A4)
const minOctave = 2; // Minimum octave (e.g., C2)
const maxOctave = 6; // Maximum octave (e.g., C6)

// Base notes for selection (without octave)
const baseNotes = ["C", "D", "E", "F", "G", "A", "B"];

// Extended note frequencies with multiple octaves
const extendedNoteFrequencies = computed(() => {
  const frequencies = {};
  for (let octave = minOctave; octave <= maxOctave; octave++) {
    baseNotes.forEach((note) => {
      const noteName = `${note}${octave}`;
      const baseFreq = drones.noteFrequencies[`${note}4`]; // Reference A4, C4, etc.
      if (baseFreq) {
        // Calculate frequency for the given octave
        const freq = baseFreq * Math.pow(2, octave - 4);
        frequencies[noteName] = freq;
      }
    });
  }
  return frequencies;
});

// Available notes for the dropdown
const availableNotes = computed(() => {
  return Object.keys(extendedNoteFrequencies.value).sort();
});

// Update store note and frequencies
const updateNote = () => {
  drones.selectedNote = localSelectedNote.value;
  // Update noteFrequencies in the store
  drones.noteFrequencies = { ...extendedNoteFrequencies.value };
};

// Shift octave up or down
const shiftOctave = (direction) => {
  const newOctave = currentOctave.value + direction;
  if (newOctave >= minOctave && newOctave <= maxOctave) {
    currentOctave.value = newOctave;
    // Get the base note (e.g., 'A' from 'A4')
    const baseNote = localSelectedNote.value.replace(/\d/, "");
    localSelectedNote.value = `${baseNote}${newOctave}`;
    updateNote();
  }
};

// Toggle drone playback
const toggleDrone = () => {
  if (drones.isDronePlaying) {
    drones.stopDrone();
  } else {
    drones.playDrone();
  }
};

// Computed property for isDronePlaying to ensure reactivity
const isDronePlaying = computed(() => drones.isDronePlaying);
</script>
