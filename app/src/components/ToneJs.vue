<script setup>
import * as Tone from "tone";

// Load drum sounds using Sampler
const sampler = new Tone.Sampler({
  urls: {
    C3: "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/drum-samples/kick.wav",
    D3: "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/drum-samples/snare.wav",
    E3: "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/drum-samples/hihat.wav",
  },
  baseUrl:
    "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/drum-samples/",
}).toDestination();

// Create a simple drum loop
const loop = new Tone.Loop((time) => {
  sampler.triggerAttack("C3", time); // Play kick drum
  sampler.triggerAttack("D3", time + 0.5); // Play snare drum after 0.5 seconds
  sampler.triggerAttack("E3", time + 0.25); // Play hi-hat after 0.25 seconds
}, "1n"); // Loop every quarter note

// Start the loop when the button is clicked
document.getElementById("startDrums").addEventListener("click", () => {
  Tone.start();
  loop.start();
  Tone.Transport.start();
});
</script>

<template>
  <div>
    <button id="startDrums">Start Drum Loop</button>
  </div>
</template>
