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

<template>
  <div class="p-4 max-w-md mx-auto">
    <div class="flex gap-2 items-center mb-4">
      <button
        @click="prevNote"
        :disabled="noteIndex <= 0"
        class="p-2 px-4 text-white bg-purple rounded disabled:opacity-40"
      >
        −
      </button>

      <select
        v-model="selectedNote"
        class="flex-1 p-2 text-white bg-purple rounded shadow"
      >
        <option v-for="n in noteFrequencies" :key="n.note" :value="n.note">
          {{ n.note }} ({{ n.frequency.toFixed(2) }} Hz)
        </option>
      </select>

      <button
        @click="nextNote"
        :disabled="noteIndex >= noteFrequencies.length - 1"
        class="p-2 px-4 text-white bg-purple rounded disabled:opacity-40"
      >
        +
      </button>
    </div>

    <button
      @click="toggleDrone"
      class="w-full p-2 text-white bg-purple rounded hover:bg-purple-600 transition"
    >
      {{
        drone.isPlaying && drone.currentNote === selectedNote ? "Stop" : "Play"
      }}
      {{ selectedNote }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

// const createLocalAudioGraph = async () => {
//   try {
//     const audioConstraints = {
//       deviceId: devices.selectedMicrophone?.deviceId,
//       channelCount: devices.channelCount, // Use channelCount from devicesStore
//       noiseSuppression: true,
//       autoGainControl: false,
//     };

//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: audioConstraints,
//     });
//       // finish the rest of the code (not done yet)
//   } catch (err) {
//     console.error("Failed to create local audio graph:", err);
//   }
// };
</script>