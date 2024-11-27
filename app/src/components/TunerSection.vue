<template>
  <div class="tuner p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Tuning App</h1>
    <div class="notes flex space-x-4">
      <button
        v-for="note in notes"
        :key="note"
        @click="() => setTargetNote(note)"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
      >
        {{ note }}
      </button>
    </div>
    <div v-if="currentNote" class="current-note mt-6 text-xl">
      Current Note: {{ currentNote }}
    </div>
    <div v-if="detectedFrequency" class="frequency mt-4">
      Detected Frequency: {{ detectedFrequency.toFixed(2) }} Hz
    </div>
    <div v-if="detectedFrequency && currentNote" class="pitch-slider mt-6">
      <div class="relative w-full h-2 bg-gray-300 rounded">
        <div
          class="absolute h-2 bg-green-500 rounded"
          :style="{ left: `${barPosition}%`, width: '4px' }"
        ></div>
      </div>
      <div class="text-sm text-center mt-2">
        Pitch Difference: {{ pitchDifference.toFixed(2) }} cents
      </div>
    </div>
    <button
      @click="toggleReferenceNote"
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition mt-4"
    >
      {{ isPlayingReference ? "Stop Reference Note" : "Play Reference Note" }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import * as Tone from "tone";
import Pitchfinder from "pitchfinder";

const notes = ["A", "B♭", "C", "E♭", "F"];
const currentNote = ref(null);
const detectedFrequency = ref(null);
const isPlayingReference = ref(false);
let synth = null;
let referenceSynth = null;
let pitchFinder = null;
let frequencyHistory = []; // Array to store recent frequency values for smoothing
const SMOOTHING_WINDOW_SIZE = 5;
const MIN_SIGNAL_LEVEL = 0.005; // Lowered minimum signal level to consider a valid input

const referenceFrequencies = {
  A: 440.0,
  "B♭": 466.16,
  C: 261.63,
  "E♭": 311.13,
  F: 349.23,
};

const pitchDifference = computed(() => {
  if (
    currentNote.value &&
    detectedFrequency.value &&
    detectedFrequency.value > 0
  ) {
    const referenceFrequency = referenceFrequencies[currentNote.value];
    const cents =
      1200 * Math.log2(detectedFrequency.value / referenceFrequency);
    return cents;
  }
  return 0;
});

const barPosition = computed(() => {
  // Map pitch difference to bar position (-50 to 50 range to 0% to 100%)
  return Math.min(100, Math.max(0, 50 + pitchDifference.value));
});

const setTargetNote = (note) => {
  currentNote.value = note;
  playNote(note);
};

const playNote = (note) => {
  if (!synth) {
    synth = new Tone.Synth().toDestination();
  }
  const noteMap = {
    A: "A4",
    "B♭": "A#4",
    C: "C4",
    "E♭": "D#4",
    F: "F4",
  };
  synth.triggerAttackRelease(noteMap[note], "8n");
};

const toggleReferenceNote = () => {
  if (isPlayingReference.value) {
    if (referenceSynth) {
      referenceSynth.triggerRelease();
      isPlayingReference.value = false;
    }
  } else {
    if (currentNote.value) {
      if (!referenceSynth) {
        referenceSynth = new Tone.FMSynth().toDestination();
      }
      const noteMap = {
        A: "A4",
        "B♭": "A#4",
        C: "C4",
        "E♭": "D#4",
        F: "F4",
      };
      referenceSynth.triggerAttack(noteMap[currentNote.value]); // Play indefinitely until stopped
      isPlayingReference.value = true;
    }
  }
};

const startTuner = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("getUserMedia not supported on your browser.");
    return;
  }

  try {
    await Tone.start(); // Ensure Tone.js audio context is started
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);

    // Create a gain node to control the signal level
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1; // Adjust the gain if needed

    // Create a band-pass filter
    const bandPassFilter = audioContext.createBiquadFilter();
    bandPassFilter.type = "bandpass";
    bandPassFilter.frequency.value = 440; // Center frequency (for A4)
    bandPassFilter.Q.value = 20; // Increased Quality factor to focus more on the target frequency

    // Connect the nodes in the audio chain
    source.connect(gainNode);
    gainNode.connect(bandPassFilter);

    // Create the analyser node
    const analyser = audioContext.createAnalyser();
    bandPassFilter.connect(analyser);

    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    pitchFinder = Pitchfinder.YIN();

    const detectPitch = () => {
      analyser.getFloatTimeDomainData(dataArray);
      // Calculate the root-mean-square (RMS) to determine signal strength
      const rms = Math.sqrt(
        dataArray.reduce((sum, value) => sum + value * value, 0) / bufferLength,
      );
      if (rms > MIN_SIGNAL_LEVEL) {
        let pitch = pitchFinder(dataArray, audioContext.sampleRate);
        console.log("Detected pitch: ", pitch); // Debugging output
        if (pitch !== null && pitch !== 17640 && pitch > 20 && pitch < 5000) {
          frequencyHistory.push(pitch);
          if (frequencyHistory.length > SMOOTHING_WINDOW_SIZE) {
            frequencyHistory.shift(); // Keep the history array at the desired size
          }
          const averageFrequency =
            frequencyHistory.reduce((a, b) => a + b, 0) /
            frequencyHistory.length;
          detectedFrequency.value = averageFrequency;
        } else {
          detectedFrequency.value = pitch !== 17640 ? pitch : 0; // Ignore 17640 as it is likely an error
        }
      } else {
        detectedFrequency.value = 0; // Set to 0 if the signal is too weak
      }
      requestAnimationFrame(detectPitch);
    };

    detectPitch();
  } catch (err) {
    console.error("Error accessing audio stream: ", err);
  }
};

onMounted(() => {
  startTuner();
});
</script>

<style scoped>
/* Removed @apply and replaced with inline styles in the template */
</style>
