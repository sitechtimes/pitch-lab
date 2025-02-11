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

const indicatorPosition = computed(() => {
  const maxRange = 50;
  let detune = Math.max(Math.min(detuneValue.value, maxRange), -maxRange);
  let percentageOffset = (detune / maxRange) * 50;
  return `calc(50% + ${percentageOffset}%)`;
});

const toggleTuning = async () => {
  try {
    isTuning.value = !isTuning.value;

    if (isTuning.value) {
      store.cleanupAudio();

      const success = await store.initializeAudio();
      if (!success) {
        console.error("Failed to initialize audio context.");
        return;
      } else {
        console.log("Audio initialized.");
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
      detectPitch();
    } else {
      store.cleanupAudio();
    }
  } catch (error) {
    console.error("Tuning error:", error);
    store.cleanupAudio();
    isTuning.value = false;
  }
};

const detectPitch = () => {
  if (!store.analyser || !store.audioContext) {
    console.error("Analyser node or AudioContext is not initialized.");
    return;
  }

  const bufferLength = store.analyser.fftSize;
  const dataArray = new Float32Array(bufferLength);

  const pitchFinder = Pitchfinder.YIN({
    sampleRate: store.audioContext.sampleRate,
  });
  const amplitudeThreshold = 0.005; //adjust sensitivity here maybe put in settings
  const pitchBuffer = [];

  const updateTuning = (detectedPitch) => {
    const normalizedPitch = normalizeFrequency(detectedPitch);
    const targetPitch = selectedNoteFrequency.value;
    const detune = 1200 * Math.log2(normalizedPitch / targetPitch);
    pitch.value = detectedPitch;
    detuneValue.value = detune;
    isFlat.value = detune < -10;
    isSharp.value = detune > 10;
    isInTune.value = Math.abs(detune) <= 10;
    console.log(
      `Pitch: ${normalizedPitch.toFixed(2)} Hz, In Tune: ${isInTune.value}`,
    );
    console.log("Detune" + detune.toFixed(2));
    console.log(`Detected Pitch: ${detectedPitch} Hz`);
    console.log(`Normalized Pitch: ${normalizedPitch} Hz`);
    console.log(`Target Pitch: ${targetPitch} Hz`);
  };
  const getMedian = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const processDetectedPitch = (detectedPitch) => {
    if (detectedPitch && detectedPitch > 50 && detectedPitch < 2000) {
      pitchBuffer.push(detectedPitch);
      if (pitchBuffer.length > 10) pitchBuffer.shift();
      const medianPitch = getMedian(pitchBuffer);
      updateTuning(medianPitch);
    }
  };

  const analyze = () => {
    if (!isTuning.value) {
      console.log("Stopping pitch detection.");
      return;
    }

    try {
      store.analyser.getFloatTimeDomainData(dataArray);
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
  const targetFrequency = selectedNoteFrequency.value;
  const octaveDifference = Math.round(Math.log2(frequency / targetFrequency));
  const baseFrequencyInOctave = targetFrequency * Math.pow(2, octaveDifference);
  const pitchOffset = frequency - baseFrequencyInOctave;
  let normalizedFrequency = targetFrequency + pitchOffset;

  if (normalizedFrequency < targetFrequency / 2) {
    normalizedFrequency *= 2;
  } else if (normalizedFrequency >= targetFrequency * 2) {
    normalizedFrequency /= 2;
  }
  return normalizedFrequency;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
