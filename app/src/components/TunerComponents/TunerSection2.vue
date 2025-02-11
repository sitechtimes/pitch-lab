<template>
  <div class="flex flex-col items-center justify-center p-4">
    <h1 class="text-3xl font-bold">Auto Tuner</h1>
    <div
      class="w-full max-w-md mt-6 bg-gray-800 text-white p-6 rounded-lg shadow-lg text-center"
    >
      <p class="text-xl">
        Detected Note: <strong>{{ detectedNote }}</strong>
      </p>
      <p class="text-lg mt-2" :class="tuningStatusClass">{{ tuningStatus }}</p>
      <div class="relative w-full h-10 bg-gray-700 mt-4 rounded-full">
        <div
          class="absolute h-10 bg-yellow-500 rounded-full"
          :style="{ left: indicatorPosition, width: '10px' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Pitchfinder from "pitchfinder";

const detectedNote = ref("");
const detuneValue = ref(0);
const tuningStatus = ref("");
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const pitchFinder = Pitchfinder.YIN({ sampleRate: audioContext.sampleRate });

const noteFrequencies = [
  { note: "A", freq: 440.0 },
  { note: "A#", freq: 466.16 },
  { note: "B", freq: 493.88 },
  { note: "C", freq: 523.25 },
  { note: "C#", freq: 554.37 },
  { note: "D", freq: 587.33 },
  { note: "D#", freq: 622.25 },
  { note: "E", freq: 659.25 },
  { note: "F", freq: 698.46 },
  { note: "F#", freq: 739.99 },
  { note: "G", freq: 783.99 },
  { note: "G#", freq: 830.61 },
];

const tuningStatusClass = computed(() => {
  if (detuneValue.value < -10) return "text-orange-500";
  if (detuneValue.value > 10) return "text-orange-500";
  return "text-green-500";
});

const indicatorPosition = computed(() => {
  const maxOffset = 50;
  const detune = Math.max(Math.min(detuneValue.value, maxOffset), -maxOffset);
  return `calc(50% + ${(detune / maxOffset) * 50}%)`;
});

const getClosestNote = (frequency) => {
  return noteFrequencies.reduce((prev, curr) =>
    Math.abs(curr.freq - frequency) < Math.abs(prev.freq - frequency)
      ? curr
      : prev,
  );
};

const detectPitch = () => {
  const bufferLength = analyser.fftSize;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(dataArray);
  const detectedPitch = pitchFinder(dataArray);

  if (detectedPitch) {
    const closestNote = getClosestNote(detectedPitch);
    detectedNote.value = closestNote.note;
    detuneValue.value = 1200 * Math.log2(detectedPitch / closestNote.freq);
    tuningStatus.value =
      detuneValue.value < -10
        ? "Too Flat"
        : detuneValue.value > 10
          ? "Too Sharp"
          : "In Tune";
  }

  requestAnimationFrame(detectPitch);
};

onMounted(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 2048;
  detectPitch();
});
</script>

<style>
.text-green-500 {
  color: #10b981;
}
.text-orange-500 {
  color: #f97316;
}
</style>
