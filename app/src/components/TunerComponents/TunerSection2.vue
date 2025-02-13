<template>
  <div class="audio-tracker">
    <h1>Audio Frequency Tracker</h1>
    <p v-if="frequency">Detected Frequency: {{ frequency.toFixed(2) }} Hz</p>
    <p v-if="closestNote">
      Closest Note: {{ closestNote.note }} ({{
        closestNote.frequency.toFixed(2)
      }}
      Hz)
    </p>
    <p v-if="detuneValue !== null">
      Detune: {{ detuneValue.toFixed(2) }} cents
    </p>
    <p v-else>No audio input detected.</p>
    <button @click="toggleTracking">
      {{ isTracking ? "Stop Tracking" : "Start Tracking" }}
    </button>
  </div>
</template>
<script setup>
import { ref } from "vue";
import * as Pitchfinder from "pitchfinder";
import { noteFrequencies } from "@/constants/NoteFrequencies";
import { persistedSettings } from "@/stores/persistedStore";

// Reactive state
const audioContext = ref(null);
const analyser = ref(null);
const source = ref(null);
const frequency = ref(null);
const isTracking = ref(false);
const detectPitch = ref(null);
const closestNote = ref(null);
const detuneValue = ref(null);

// Binary search to find the closest note
function findClosestNote(freq) {
  let left = 0;
  let right = noteFrequencies.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const noteFreq = noteFrequencies[mid].frequency;

    if (noteFreq === freq) {
      return noteFrequencies[mid];
    } else if (noteFreq < freq) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Compare the two closest notes
  const lowerNote = noteFrequencies[right >= 0 ? right : 0];
  const upperNote =
    noteFrequencies[
      left < noteFrequencies.length ? left : noteFrequencies.length - 1
    ];

  const lowerDiff = Math.abs(lowerNote.frequency - freq);
  const upperDiff = Math.abs(upperNote.frequency - freq);

  return lowerDiff < upperDiff ? lowerNote : upperNote;
}

// Calculate detune in cents
function calculateDetune(detectedFreq, targetFreq) {
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

// Start tracking audio input
async function startTracking() {
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  analyser.value = audioContext.value.createAnalyser();
  analyser.value.fftSize = 4096;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: { ideal: persistedSettings.selectedMicrophone },
    },
  });
  source.value = audioContext.value.createMediaStreamSource(stream);
  source.value.connect(analyser.value);

  detectPitch.value = new Pitchfinder.YIN();
  isTracking.value = true;
  trackFrequency();
}

// Stop tracking audio input
function stopTracking() {
  if (source.value) {
    source.value.disconnect();
    source.value = null;
  }
  if (audioContext.value) {
    audioContext.value.close();
    audioContext.value = null;
  }
  isTracking.value = false;
  frequency.value = null;
  closestNote.value = null;
  detuneValue.value = null;
}

// Toggle tracking on/off
function toggleTracking() {
  if (isTracking.value) {
    stopTracking();
  } else {
    startTracking();
  }
}

// Track frequency continuously
function trackFrequency() {
  if (!isTracking.value) return;

  const bufferLength = analyser.value.fftSize;
  const dataArray = new Float32Array(bufferLength);

  const updateFrequency = () => {
    if (!isTracking.value) return;

    analyser.value.getFloatTimeDomainData(dataArray);
    const pitch = detectPitch.value(dataArray);

    if (pitch) {
      frequency.value = pitch;

      // Find closest note and calculate detune
      const note = findClosestNote(pitch);
      closestNote.value = note;
      detuneValue.value = calculateDetune(pitch, note.frequency);
    }

    requestAnimationFrame(updateFrequency);
  };

  updateFrequency();
}
</script>
