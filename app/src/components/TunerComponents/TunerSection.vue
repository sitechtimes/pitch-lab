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
          {{ closestNote ? closestNote.note : "" }}
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
import { ref, computed, onUnmounted, onMounted } from "vue";
import { noteFrequencies } from "@/constants/NoteFrequencies";
import { persistedSettings } from "@/stores/persistedStore";

// Reactive state
const audioContext = ref(null);
const analyser = ref(null);
const source = ref(null);
const frequency = ref(null);
const isTuning = ref(false);
const closestNote = ref(null);
const detuneValue = ref(0);
const isFlat = ref(false);
const isSharp = ref(false);
const isInTune = ref(false);
const windowWidth = ref(window.innerWidth);

// Frequency smoothing settings
const frequencyHistory = [];
const maxHistorySize = 5;

// Indicator position for UI
const indicatorPosition = computed(() => {
  const maxRange = 50;
  let detune = Math.max(Math.min(detuneValue.value, maxRange), -maxRange);
  let percentageOffset = (detune / maxRange) * 50;
  return `calc(50% + ${percentageOffset}%)`;
});

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
  // Compare closest notes
  const lowerNote = noteFrequencies[right >= 0 ? right : 0];
  const upperNote =
    noteFrequencies[
      left < noteFrequencies.length ? left : noteFrequencies.length - 1
    ];
  return Math.abs(lowerNote.frequency - freq) <
    Math.abs(upperNote.frequency - freq)
    ? lowerNote
    : upperNote;
}

// Calculate detune in cents
function calculateDetune(detectedFreq, targetFreq) {
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

// Update tuning status
function updateTuning() {
  isFlat.value = detuneValue.value < -10;
  isSharp.value = detuneValue.value > 10;
  isInTune.value = Math.abs(detuneValue.value) <= 10;
}

// Start tracking audio input
async function startTuning() {
  try {
    audioContext.value = new (window.AudioContext ||
      window.webkitAudioContext)();
    analyser.value = audioContext.value.createAnalyser();
    analyser.value.fftSize = 8192; // Increased FFT size for better resolution
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: false,
        autoGainControl: false,
        deviceId: { ideal: persistedSettings().selectedMicrophone },
      },
    });
    source.value = audioContext.value.createMediaStreamSource(stream);
    source.value.connect(analyser.value);
    isTuning.value = true;
    trackFrequency();
  } catch (error) {
    console.error("Error starting tuning:", error);
    stopTuning();
  }
}

// Stop tracking audio input
function stopTuning() {
  if (source.value) source.value.disconnect();
  if (audioContext.value) audioContext.value.close();
  isTuning.value = false;
  frequency.value = null;
  closestNote.value = null;
  detuneValue.value = null;
}

// Toggle tuning on/off
function toggleTuning() {
  isTuning.value ? stopTuning() : startTuning();
}

// Track frequency with parabolic interpolation and zero padding
function trackFrequency() {
  const bufferLength = analyser.value.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);

  function update() {
    if (!isTuning.value) return;

    // Get FFT data
    analyser.value.getFloatFrequencyData(dataArray);

    // Zero Padding: Extend array
    const paddedArray = new Float32Array(analyser.value.fftSize);
    paddedArray.set(dataArray); // Copy original data (remaining elements are zero)

    // Find the index of the maximum amplitude
    let maxIndex = 0;
    let maxAmplitude = -Infinity;
    for (let i = 0; i < bufferLength; i++) {
      if (paddedArray[i] > maxAmplitude) {
        maxAmplitude = paddedArray[i];
        maxIndex = i;
      }
    }

    // Apply parabolic interpolation to refine the peak frequency
    const sampleRate = audioContext.value.sampleRate;
    const detectedFreq = parabolicInterpolation(
      paddedArray,
      maxIndex,
      sampleRate,
    );

    // Rolling average for smoother frequency detection
    if (detectedFreq > 0) {
      frequencyHistory.push(detectedFreq);
      if (frequencyHistory.length > maxHistorySize) frequencyHistory.shift();
    }
    frequency.value =
      frequencyHistory.reduce((sum, freq) => sum + freq, 0) /
        frequencyHistory.length || 0;

    // Update closest note and detune value
    const note = findClosestNote(frequency.value);
    closestNote.value = note;
    detuneValue.value = calculateDetune(frequency.value, note.frequency);
    updateTuning();

    // Schedule next frame
    requestAnimationFrame(update);
  }

  update();
}

// Parabolic interpolation for frequency refinement
function parabolicInterpolation(spectrum, peakIndex, sampleRate) {
  const fftSize = analyser.value.fftSize;

  // Ensure indices are within bounds
  const leftIndex = Math.max(0, peakIndex - 1);
  const rightIndex = Math.min(spectrum.length - 1, peakIndex + 1);

  const alpha = spectrum[leftIndex];
  const beta = spectrum[peakIndex];
  const gamma = spectrum[rightIndex];

  // Parabolic interpolation formula
  const delta = (0.5 * (alpha - gamma)) / (alpha - 2 * beta + gamma);
  const interpolatedIndex = peakIndex + delta;

  // Convert interpolated index to frequency
  return (interpolatedIndex * sampleRate) / fftSize;
}

// Handle window resize for responsive UI
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
onMounted(() => window.addEventListener("resize", handleResize));
onUnmounted(() => window.removeEventListener("resize", handleResize));
</script>
