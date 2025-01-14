<script setup>
import * as Tone from "tone";
import { ref } from "vue";

const bpm = ref(120); // Default tempo
const beatsPerMeasure = ref(4); // Default beats per measure
const beatOptions = [2 / 4, 3 / 4, 4 / 4, 5 / 4, 3 / 8]; // Dropdown options for beats per measure
const isPlaying = ref(false);
let loop;
let currentBeat = 0; // Tracks the current beat in the measure

// Preload duck quack sounds
const firstBeatQuack = new Tone.Player(
  "https://example.com/first-beat-quack.mp3",
).toDestination();
const normalBeatQuack = new Tone.Player(
  "https://example.com/normal-beat-quack.mp3",
).toDestination();

// Function to start the metronome
const startMetronome = () => {
  Tone.Transport.bpm.value = bpm.value; // Set tempo
  currentBeat = 0; // Reset beat count
  loop = new Tone.Loop((time) => {
    // Play quack sound for the current beat
    if (currentBeat === 0) {
      firstBeatQuack.start(time); // Distinct quack for the first beat
    } else {
      normalBeatQuack.start(time); // Normal quack for other beats
    }

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
    <h1>Metronome</h1>
    <div>
      <label for="bpm">Tempo (BPM): </label>
      <input type="number" id="bpm" v-model="bpm" min="30" max="300" />
    </div>
    <div>
      <label for="beats">Beats per Measure: </label>
      <select id="beats" v-model="beatsPerMeasure">
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
