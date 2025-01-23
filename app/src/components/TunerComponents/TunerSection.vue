<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-screen-xl">
      <!-- Adjusted container width -->
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
          <!-- Slider indicator -->
          <div
            class="w-2 h-16 bg-yellow-500 absolute"
            :style="{
              left: `calc(50% + ${detuneValue}px)`,
              transform: 'translateX(-50%) translateY(-50%)',
              top: '50%',
              border: '4px solid yellow',
            }"
          ></div>
          <!-- Updated numerical labels -->
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
        <div class="bg-tuner-bg px-5 py-3 text-3xl rounded-full text-white">
          b
        </div>
        <div class="text-4xl bg-tuner-bg px-5 py-3 rounded-lg text-white">
          {{ store.selectedNote.name }}
        </div>
        <div class="bg-tuner-bg px-5 py-3 text-3xl rounded-full text-white">
          #
        </div>
      </div>
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
const detuneValue = ref(0); // The slider position
const isFlat = ref(false);
const isSharp = ref(false);
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

const normalizeToBaseOctave = (frequency) => {
  while (frequency > 523.25) {
    frequency /= 2;
  }
  while (frequency < 261.63) {
    frequency *= 2;
  }
  return frequency;
};

const startPitchDetection = async () => {
  try {
    // Request microphone input
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

    // YIN algorithm
    const pitchFinder = Pitchfinder.YIN({
      sampleRate: audioContext.sampleRate,
    });

    const highPassFilter = audioContext.createBiquadFilter();
    highPassFilter.type = "highpass";
    highPassFilter.frequency.value = 50; // Filter out frequencies below 50 Hz
    source.connect(highPassFilter).connect(analyser);

    // detect amplitude
    const calculatePeakAmplitude = (dataArray) => {
      return Math.max(...dataArray.map(Math.abs));
    };

    // Detect pitch
    const dataArray = new Float32Array(analyser.fftSize);

    const pitchBuffer = [];
    const isConstantPitch = () => {
      if (pitchBuffer.length < 10) return false; // Require a sufficient number of samples
      const meanPitch =
        pitchBuffer.reduce((a, b) => a + b, 0) / pitchBuffer.length;
      const deviation = pitchBuffer.every((p) => Math.abs(p - meanPitch) < 1); // Allow slight variation
      return deviation;
    };

    const detect = () => {
      analyser.getFloatTimeDomainData(dataArray);

      // Calculate peak amplitude
      const peakAmplitude = calculatePeakAmplitude(dataArray);

      // Set a threshold for significant signals
      const amplitudeThreshold = 0.02; // Adjust this based on testing
      if (peakAmplitude < amplitudeThreshold) {
        console.log("Weak signal detected. Ignoring noise.");
        requestAnimationFrame(detect); // Continue loop without processing pitch
        return;
      }

      const detectedPitch = pitchFinder(dataArray);

      if (detectedPitch && detectedPitch > 50 && detectedPitch < 2000) {
        pitchBuffer.push(detectedPitch);
        if (pitchBuffer.length > 10) pitchBuffer.shift(); // Maintain buffer size

        const normalizedPitch = normalizeToBaseOctave(detectedPitch);
        const normalizedTarget = normalizeToBaseOctave(selectedNote.value);

        const detune = 1200 * Math.log2(normalizedPitch / normalizedTarget);
        pitch.value = detectedPitch;

        note.value = Object.keys(store.selectedNote).find(
          (key) => noteFrequencies[key] === selectedNote.value,
        );

        detuneValue.value = detune;

        isFlat.value = detune < -10;
        isSharp.value = detune > 10;

        const constant = isConstantPitch();
        console.log(
          `Pitch detected: ${detectedPitch.toFixed(2)} Hz, Constant: ${constant}`,
        );
      }

      requestAnimationFrame(detect);
    };

    detect();
  } catch (err) {
    console.error("Error accessing microphone: ", err);
    alert("Could not access your microphone. Please allow microphone access.");
  }
};

onMounted(() => {
  startPitchDetection();
});
</script>
