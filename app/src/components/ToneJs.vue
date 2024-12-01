<script setup>
import * as Tone from "tone";
import { ref } from "vue";

const bpm = ref(120); // Default tempo
const isPlaying = ref(false);
let loop;

// Function to start the metronome
const startMetronome = () => {
  Tone.Transport.bpm.value = bpm.value; // Set tempo
  loop = new Tone.Loop((time) => {
    const click = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0, decay: 0.1, sustain: 0.1, release: 0.1 },
    }).toDestination();

    click.triggerAttackRelease("C5", "8n", time); // Play click sound
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

// Watch BPM changes
Tone.Transport.bpm.value = bpm.value;
</script>

<template>
  <div>
    <h1>Metronome</h1>
    <div>
      <label for="bpm">Tempo (BPM): </label>
      <input type="number" id="bpm" v-model="bpm" min="30" max="300" />
    </div>
    <button @click="toggleMetronome">
      {{ isPlaying ? "Stop" : "Start" }} Metronome
    </button>
  </div>
</template>
