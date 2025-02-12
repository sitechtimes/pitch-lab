<template>
  <div class="tuner">
    <h1>Audio Tuner</h1>
    <button @click="toggleRecording">
      {{ isRecording ? "Stop" : "Start" }}
    </button>
    <p v-if="detectedNote">
      Detected Note: {{ detectedNote.note }}<br />
      Frequency: {{ detectedNote.frequency.toFixed(2) }} Hz<br />
      Cents Off: {{ detectedNote.centsOff.toFixed(2) }} cents
    </p>
    <p v-else>No note detected yet.</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { YIN } from "pitchfinder";
import { getNoteFromFrequency, getCentsOff } from "../../constants/Notes";

// Reactive state
const isRecording = ref(false);
const audioContext = ref(null);
const analyser = ref(null);
const detector = ref(null);
const detectedNote = ref(null);

// Toggle recording
async function toggleRecording() {
  if (isRecording.value) {
    stopRecording();
  } else {
    await startRecording();
  }
}

// Start recording
async function startRecording() {
  isRecording.value = true;
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  detector.value = new YIN();

  // Access the microphone
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.value.createMediaStreamSource(stream);
  analyser.value = audioContext.value.createAnalyser();
  analyser.value.fftSize = 2048;

  source.connect(analyser.value);

  const bufferLength = analyser.value.fftSize;
  const dataArray = new Float32Array(bufferLength);

  const detectPitch = () => {
    if (!isRecording.value) return;

    analyser.value.getFloatTimeDomainData(dataArray);
    const frequency = detector.value(dataArray);

    if (frequency && frequency > 0) {
      const note = getNoteFromFrequency(frequency);
      const centsOff = getCentsOff(frequency, note.frequency);
      detectedNote.value = { note: note.note, frequency, centsOff };
    } else {
      detectedNote.value = null;
    }

    requestAnimationFrame(detectPitch);
  };

  detectPitch();
}

// Stop recording
function stopRecording() {
  isRecording.value = false;
  if (audioContext.value) {
    audioContext.value.close();
  }
}
</script>

<style scoped>
.tuner {
  text-align: center;
  margin-top: 50px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
