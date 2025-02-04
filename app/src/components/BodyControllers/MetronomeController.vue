<script setup>
import * as Tone from "tone";
import { ref } from "vue";

const bpm = ref(120); // Default tempo
const beatsPerMeasure = ref(4); // Default beats per measure
const beatOptions = [2 / 4, 3 / 4, 4 / 4, 5 / 4, 3 / 8]; // Dropdown options for beats per measure
const isPlaying = ref(false);
let loop;
let currentBeat = 0; // Tracks the current beat in the measure

// Function to start the metronome
const startMetronome = () => {
  Tone.Transport.bpm.value = bpm.value; // Set tempo
  currentBeat = 0; // Reset beat count
  loop = new Tone.Loop((time) => {
    // Choose a different sound for the first beat
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0, decay: 0.1, sustain: 0.1, release: 0.1 },
    }).toDestination();

    const note = currentBeat === 0 ? "C5" : "C4"; // Stronger sound on first beat
    synth.triggerAttackRelease(note, "8n", time);

    // Advance the beat counter
    currentBeat = (currentBeat + 1) % beatsPerMeasure.value;
  }, "4n"); // Loop every quarter note

  loop.start(0);
  Tone.Transport.start();
  isPlaying.value = true;
};

// Function to stop the metronome
const stopMetronome = () => {
  Tone.Transport.stop();
  loop.stop();
  isPlaying.value = false;
};

// Function to toggle the metronome
const toggleMetronome = () => {
  if (isPlaying.value) {
    stopMetronome();
  } else {
    startMetronome();
  }
};
</script>

<template>
  <div>
    <div class="h-full">
      <label for="bpm">Tempo (BPM): </label>
      <input type="number" id="bpm" class="text-black" v-model="bpm" min="30" max="300" />
    </div>
    <div>
      <label for="beats">Beats per Measure: </label>
      <select id="beats" class="text-black" v-model="beatsPerMeasure">
        <option v-for="beat in beatOptions" :key="beat" :value="beat">
          {{ beat }}
        </option>
      </select>
    </div>
    <button @click="toggleMetronome">
      {{ isPlaying ? "Stop" : "Start" }} Metronome
    </button>
  </div>
</template>
