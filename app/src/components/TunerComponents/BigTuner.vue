<template>
  <div class="flex flex-col items-center justify-center px-8">
    <div class="w-full max-w-screen-2xl">
      <div
        class="relative flex justify-center items-center h-[50vh] bg-tuner-bg py-16 my-16 px-12 rounded-xl shadow-xl"
        style="width: 100%"
      >
        <div class="relative w-full" style="height: 100%">
          <div
            v-for="i in 21"
            :key="i"
            class="absolute bg-white w-[2px]"
            :class="{
              'h-[30vh]': i % 2 === 1,
              'h-[20vh]': i % 2 !== 1,
            }"
            :style="{
              left: `${(i - 1) * 5}%`,
              top: '50%',
              transform: 'translateY(-50%)',
            }"
          ></div>
          <div
            class="absolute w-1 h-48 rounded-sm shadow-lg"
            :style="{
              background: 'linear-gradient(to bottom, #facc15, #f59e0b)',
              boxShadow: '0 0 8px rgba(255, 213, 0, 0.6)',
              left: indicatorPosition,
              transform: 'translateX(-50%) translateY(-50%)',
              top: '50%',
            }"
          ></div>
          <div
            v-for="j in 11"
            :key="`label-${j}`"
            class="absolute text-4xl text-white font-semibold"
            :style="{
              left: `${(2 * j - 2) * 5}%`,
              bottom: '-50px',
              transform: 'translateX(-50%)',
            }"
          >
            {{ (j - 6) * 10 }}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between w-1/2 mx-auto gap-8">
        <div
          :class="{
            'bg-tuner-bg': !isFlat,
            'bg-orange': isFlat,
            'px-8': true,
            'py-5': true,
            'text-5xl': true,
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
            'text-6xl': true,
            'px-8': true,
            'py-5': true,
            'rounded-xl': true,
            'text-white': true,
          }"
        >
          {{ closestNote ? closestNote.note : "" }}
        </div>
        <div
          :class="{
            'bg-tuner-bg': !isSharp,
            'bg-orange': isSharp,
            'px-8': true,
            'py-5': true,
            'text-5xl': true,
            'rounded-full': true,
            'text-white': true,
          }"
        >
          #
        </div>
      </div>
      <div class="flex justify-center text-white mt-8 text-3xl font-mono">
        <span v-if="closestNote">{{ detuneValue.toFixed(1) }} cents</span>
      </div>
      <div class="flex flex-col items-center py-12">
        <button
          class="bg-tuner-bg text-white font-bold py-4 px-8 text-4xl rounded-xl shadow-lg"
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
import { devicesStore } from "@/stores/devices";

const devices = devicesStore();

const localAudioContext = ref(null);
const localStream = ref(null);
const localSource = ref(null);
const localGain = ref(null);
const localAnalyser = ref(null);

const frequency = ref(null);
const lastValidFrequency = ref(null);
const isTuning = ref(false);
const closestNote = ref(null);
const detuneValue = ref(0);
const isFlat = ref(false);
const isSharp = ref(false);
const isInTune = ref(false);
const windowWidth = ref(window.innerWidth);

const frequencyHistory = [];
const maxHistorySize = 5;

const fftSize = 4096;
const MAX_FREQUENCY = 4186;
const MIN_FREQUENCY = 27.5;

const createLocalAudioGraph = async () => {
  try {
    const audioConstraints =
      devices.selectedMicrophone?.deviceId &&
      devices.selectedMicrophone.deviceId !== ""
        ? {
            deviceId: { exact: devices.selectedMicrophone.deviceId },
            channelCount: { ideal: 1 },
            noiseSuppression: true,
            autoGainControl: false,
          }
        : {
            channelCount: { ideal: 1 },
            noiseSuppression: true,
            autoGainControl: false,
          };

    localStream.value = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
    });

    localAudioContext.value = new (window.AudioContext ||
      window.webkitAudioContext)();

    const streamSource = localAudioContext.value.createMediaStreamSource(
      localStream.value,
    );
    localSource.value = streamSource;

    const splitter = localAudioContext.value.createChannelSplitter(2);
    const merger = localAudioContext.value.createChannelMerger(1);
    streamSource.connect(splitter);
    splitter.connect(merger, 0, 0);
    localSource.value = merger;

    const gainNode = localAudioContext.value.createGain();
    gainNode.gain.value = devices.inputVolume;
    localGain.value = gainNode;

    const analyserNode = localAudioContext.value.createAnalyser();
    analyserNode.fftSize = fftSize;
    localAnalyser.value = analyserNode;

    merger.connect(gainNode).connect(analyserNode);
    console.log("🔊 Local AudioContext initialized in view");
  } catch (err) {
    console.error("Failed to create local audio graph:", err);
  }
};

const cleanupLocalAudio = () => {
  localStream.value?.getTracks().forEach((track) => track.stop());
  if (
    localAudioContext.value &&
    typeof localAudioContext.value.close === "function"
  ) {
    localAudioContext.value.close();
  }
  localAudioContext.value = null;
  localStream.value = null;
  localSource.value = null;
  localGain.value = null;
  localAnalyser.value = null;
  console.log("🧼 Local audio cleaned up");
};

const indicatorPosition = computed(() => {
  const maxRange = 50;
  let detune = Math.max(Math.min(detuneValue.value, maxRange), -maxRange);
  let percentageOffset = (detune / maxRange) * 50;
  return `calc(50% + ${percentageOffset}%)`;
});

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

function calculateDetune(detectedFreq, targetFreq) {
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

function updateTuning() {
  isFlat.value = detuneValue.value < -10;
  isSharp.value = detuneValue.value > 10;
  isInTune.value = Math.abs(detuneValue.value) <= 10;
}

async function startTuning() {
  try {
    if (!localAudioContext.value) await createLocalAudioGraph();

    if (localAudioContext.value?.state === "suspended") {
      await localAudioContext.value.resume();
    }

    isTuning.value = true;
    trackFrequency();
  } catch (error) {
    console.error("Error starting tuning:", error);
    stopTuning();
  }
}

function stopTuning() {
  isTuning.value = false;
  frequency.value = null;
  closestNote.value = null;
  detuneValue.value = null;
}

function toggleTuning() {
  isTuning.value ? stopTuning() : startTuning();
}

function trackFrequency() {
  const analyser = localAnalyser.value;
  const bufferLength = analyser.fftSize;
  const timeData = new Float32Array(bufferLength);

  function update() {
    if (!isTuning.value || !analyser) return;

    analyser.getFloatTimeDomainData(timeData);
    const sampleRate = localAudioContext.value.sampleRate;
    const detectedFreq = yinDetector(timeData, sampleRate);

    if (
      detectedFreq !== -1 &&
      detectedFreq >= MIN_FREQUENCY &&
      detectedFreq <= MAX_FREQUENCY
    ) {
      lastValidFrequency.value = detectedFreq;

      frequencyHistory.push(detectedFreq);
      if (frequencyHistory.length > maxHistorySize) frequencyHistory.shift();

      frequency.value =
        frequencyHistory.reduce((sum, freq) => sum + freq, 0) /
        frequencyHistory.length;

      const note = findClosestNote(frequency.value);
      closestNote.value = note;
      detuneValue.value = calculateDetune(frequency.value, note.frequency);
      updateTuning();
    } else {
      frequency.value = lastValidFrequency.value || 0;
    }

    requestAnimationFrame(update);
  }

  update();
}

function yinDetector(buffer, sampleRate) {
  const threshold = 0.1;
  const probabilityThreshold = 0.1;
  const yinBufferLength = Math.floor(buffer.length / 2);
  const yinBuffer = new Float32Array(yinBufferLength);

  // Step 1: Difference function
  for (let tau = 0; tau < yinBufferLength; tau++) {
    let sum = 0;
    for (let i = 0; i < yinBufferLength; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < yinBufferLength; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] *= tau / runningSum;
  }

  let tauEstimate = -1;
  for (let tau = 2; tau < yinBufferLength; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      tauEstimate = tau;
      break;
    }
  }

  if (tauEstimate === -1) return -1;

  const betterTau =
    tauEstimate > 0 && tauEstimate < yinBufferLength - 1
      ? tauEstimate +
        (yinBuffer[tauEstimate + 1] - yinBuffer[tauEstimate - 1]) /
          (2 *
            (2 * yinBuffer[tauEstimate] -
              yinBuffer[tauEstimate - 1] -
              yinBuffer[tauEstimate + 1]))
      : tauEstimate;
  const confidence = 1 - yinBuffer[tauEstimate];

  if (confidence < probabilityThreshold) {
    return -1;
  }

  return sampleRate / betterTau;
}

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
onMounted(() => {
  window.addEventListener("resize", handleResize);
  toggleTuning();
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  stopTuning();
  cleanupLocalAudio();
});
</script>
