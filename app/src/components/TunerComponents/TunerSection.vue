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
              left: indicatorPosition,
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
          {{ selectedNoteName }}
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
      <div class="flex flex-col items-center py-9">
        <button
          class="bg-tuner-bg text-white font-bold py-2 px-4 text-3xl rounded shadow"
          @click="toggleTuning"
        >
          {{ isTuning ? "Stop Tuning" : "Start Tuning" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Pitchfinder from "pitchfinder";
import { settingsStore } from "../../stores/settings";

const store = settingsStore();
const pitch = ref(null);
const note = ref("");
const detuneValue = ref(0);
const isFlat = ref(false);
const isSharp = ref(false);
const isInTune = ref(false);
const selectedNoteName = computed(() => store.selectedNote.name);
const selectedNoteFrequency = computed(() => store.selectedNote.frequency);
const isTuning = ref(false);
const windowWidth = ref(window.innerWidth);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

const noteFrequencies = {
  A: 440,
  "B♭": 466.16,
  C: 261.63,
  "E♭": 311.13,
  F: 349.23,
};

let audioContext = null;
let analyser = null;

const indicatorPosition = computed(() => {
  const maxRange = 50;
  let detune = Math.max(Math.min(detuneValue.value, maxRange), -maxRange);
  let percentageOffset = (detune / maxRange) * 50;
  return `calc(50% + ${percentageOffset}%)`;
});

const toggleTuning = async () => {
  isTuning.value = !isTuning.value;

  if (isTuning.value) {
    try {
      if (!audioContext) {
        await setupAudioComponents();
      }
      detectPitch();
    } catch (error) {
      console.error("Error setting up audio components:", error);
      isTuning.value = false;
    }
  } else {
    if (audioContext) {
      await audioContext.close();
      audioContext = null;
      analyser = null;
    }
  }
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
  if (!audioContext) {
    console.error("Audio context is not initialized.");
    return;
  }

  const pitchFinder = Pitchfinder.YIN({ sampleRate: audioContext.sampleRate });
  const dataArray = new Float32Array(analyser.fftSize);
  const amplitudeThreshold = 0.02; //adjust sensitivity here maybe put in settings
  const pitchBuffer = [];

  const updateTuning = (detectedPitch) => {
    const normalizedPitch = normalizeFrequency(detectedPitch);
    const targetPitch = normalizeFrequency(selectedNoteFrequency.value);
    const detune = 1200 * Math.log2(normalizedPitch / targetPitch);

    pitch.value = detectedPitch;
    note.value = Object.keys(noteFrequencies).find(
      (key) => noteFrequencies[key] === selectedNoteFrequency.value,
    );
    detuneValue.value = detune;
    isFlat.value = detune < -10;
    isSharp.value = detune > 10;
    isInTune.value = Math.abs(detune) <= 10;
    console.log(
      `Pitch: ${normalizedPitch.toFixed(2)} Hz, In Tune: ${isInTune.value}`,
    );
    console.log("Detune" + detune.toFixed(2));
  };

  const processDetectedPitch = (detectedPitch) => {
    if (detectedPitch && detectedPitch > 50 && detectedPitch < 2000) {
      pitchBuffer.push(detectedPitch);
      if (pitchBuffer.length > 10) pitchBuffer.shift();
      updateTuning(detectedPitch);
    }
  };

  const analyze = () => {
    if (!isTuning.value) {
      console.log("Stopping pitch detection.");
      return; // Stop the loop
    }

    try {
      analyser.getFloatTimeDomainData(dataArray);
      const peakAmplitude = Math.max(...dataArray.map(Math.abs));

      if (peakAmplitude < amplitudeThreshold) {
        console.log("Weak signal detected.");
        requestAnimationFrame(analyze);
        return;
      }

      const detectedPitch = pitchFinder(dataArray);
      processDetectedPitch(detectedPitch);
    } catch (error) {
      console.error("Error during pitch detection:", error);
    }

    requestAnimationFrame(analyze);
  };

  analyze();
};

const normalizeFrequency = (frequency) => {
  while (frequency < 261.63) {
    frequency *= 2;
  }
  while (frequency >= 523.25) {
    frequency /= 2;
  }
  return frequency;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
