<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-screen-xl">
      <div
        class="relative flex justify-center items-center h-[30vh] bg-tuner-bg py-12 my-12 px-6 rounded-lg shadow-lg"
        style="width: 100%"
      >
        <div class="relative w-full" style="height: 100%">
          <div
            v-for="i in 21"
            :key="i"
            class="absolute bg-white w-[1px]"
            :class="{
              'h-[16vh]': i % 2 === 1,
              'h-[10vh]': i % 2 !== 1,
            }"
            :style="{
              left: `${(i - 1) * 5}%`,
              top: '50%',
              transform: 'translateY(-50%)',
            }"
          ></div>
          <div
            class="w-2 h-16 bg-yellow-500 absolute"
            :style="{
              left: `calc(50% + ${detuneValue}px)`,
              transform: 'translateX(-50%) translateY(-50%)',
              top: '50%',
              border: '4px solid yellow',
            }"
          ></div>
          <div
            v-for="j in 11"
            :key="`label-${j}`"
            class="absolute text-2xl text-white"
            :style="{
              left: `${(2 * j - 2) * 5}%`,
              bottom: '-30px',
              transform: 'translateX(-50%)',
            }"
          >
            {{ (j - 6) * 10 }}
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between w-1/3 mx-auto">
        <div
          :class="{
            'bg-tuner-bg': !isFlat,
            'bg-orange': isFlat,
            'px-5': true,
            'py-3': true,
            'text-3xl': true,
            'rounded-full': true,
            'text-white': true,
          }"
        >
          b
        </div>
        <div
          :class="{
            'bg-tuner-bg': !isInTune,
            'bg-green': isInTune,
            'text-4xl': true,
            'px-5': true,
            'py-3': true,
            'rounded-lg': true,
            'text-white': true,
          }"
        >
          {{ store.selectedNote.name }}
        </div>
        <div
          :class="{
            'bg-tuner-bg': !isSharp,
            'bg-orange': isSharp,
            'px-5': true,
            'py-3': true,
            'text-3xl': true,
            'rounded-full': true,
            'text-white': true,
          }"
        >
          #
        </div>
      </div>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
        @click="startTuning"
      >
        Start Tuning
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Pitchfinder from "pitchfinder";
import { settingsStore } from "../../stores/settings";

const store = settingsStore();
const pitch = ref(null);
const note = ref("");
const detuneValue = ref(0);
const isFlat = ref(false);
const isSharp = ref(false);
const isInTune = ref(false);
const selectedNote = ref(440);

const noteFrequencies = {
  A: 440,
  "B♭": 466.16,
  C: 261.63,
  "E♭": 311.13,
  F: 349.23,
};

let audioContext = null;
let analyser = null;

const normalizeFrequency = (frequency) => {
  const octaveBase = 523.25;
  while (frequency > octaveBase) {
    frequency /= 2;
  }
  while (frequency < 261.63) {
    frequency *= 2;
  }
  return frequency;
};

const setupAudioComponents = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      autoGainControl: false,
      noiseSuppression: false,
      echoCancellation: false,
    },
  });
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 8192;
  source.connect(analyser);
  setupHighPassFilter(source);
};

const setupHighPassFilter = (source) => {
  const highPassFilter = audioContext.createBiquadFilter();
  highPassFilter.type = "highpass";
  highPassFilter.frequency.value = 50;
  source.connect(highPassFilter).connect(analyser);
};

const detectPitch = () => {
  const pitchFinder = Pitchfinder.YIN({ sampleRate: audioContext.sampleRate });
  const dataArray = new Float32Array(analyser.fftSize);
  const amplitudeThreshold = 0.02;
  const pitchBuffer = [];

  const isConstantPitch = () =>
    pitchBuffer.length >= 10 &&
    pitchBuffer.every((p) => Math.abs(p - pitchBuffer[0]) < 1);

  const analyze = () => {
    analyser.getFloatTimeDomainData(dataArray);
    const peakAmplitude = Math.max(...dataArray.map(Math.abs));

    if (peakAmplitude < amplitudeThreshold) {
      console.log("Weak signal detected.");
      requestAnimationFrame(analyze);
      return;
    }

    const detectedPitch = pitchFinder(dataArray);
    processDetectedPitch(detectedPitch);
    requestAnimationFrame(analyze);
  };

  const processDetectedPitch = (detectedPitch) => {
    if (detectedPitch && detectedPitch > 50 && detectedPitch < 2000) {
      pitchBuffer.push(detectedPitch);
      if (pitchBuffer.length > 10) pitchBuffer.shift();
      updateTuning(detectedPitch);
    }
  };

  const updateTuning = (detectedPitch) => {
    const normalizedPitch = normalizeFrequency(detectedPitch);
    const targetPitch = normalizeFrequency(selectedNote.value);
    const detune = 1200 * Math.log2(normalizedPitch / targetPitch);

    pitch.value = detectedPitch;
    note.value = Object.keys(noteFrequencies).find(
      (key) => noteFrequencies[key] === selectedNote.value,
    );
    detuneValue.value = detune;
    isFlat.value = detune < -10;
    isSharp.value = detune > 10;
    isInTune.value = isConstantPitch();

    console.log(
      `Pitch: ${detectedPitch.toFixed(2)} Hz, In Tune: ${isInTune.value}`,
    );
  };

  analyze();
};

const startTuning = () => {
  // Initiates the tuning process when button is clicked
  setupAudioComponents();
  detectPitch();
};

onMounted(startTuning); // Changed to start the tuning when the component mounts.
</script>
