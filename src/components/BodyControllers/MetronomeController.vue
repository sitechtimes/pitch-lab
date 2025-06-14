<template>
  <div
    class="w-full max-w-4xl mx-auto rounded-xl p-4 sm:p-6 flex flex-col xl:flex-row flex-wrap items-center justify-between gap-6 sm:gap-8"
  >
    <!-- Time Signature & Sound -->
    <div class="flex flex-col gap-2 sm:gap-4 w-full sm:w-auto">
      <div class="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <label class="text-gray-700 text-base md:text-xl font-normal">
          Time Signature:
        </label>
        <select
          v-model="timeSignature"
          @change="updateTempo"
          class="bg-purple text-white px-2 py-1 md:px-3 md:py-2 text-sm md:text-base rounded-lg hover:bg-purple/90 shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <span class="text-gray-500 text-base md:text-xl">/</span>
        <select
          v-model="timeSignatureDenominator"
          @change="updateTempo"
          class="bg-purple text-white px-2 py-1 md:px-3 md:py-2 text-sm md:text-base rounded-lg hover:bg-purple/90 shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="4">4</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-gray-700 text-base md:text-xl font-normal mb-1">
          Sound
        </label>
        <select
          v-model="selectedSound"
          @change="loadSound"
          class="bg-purple text-white px-2 py-1 md:px-3 md:py-2 text-sm md:text-base rounded-lg hover:bg-purple/90 shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option v-for="sound in availableSounds" :key="sound" :value="sound">
            {{ sound }}
          </option>
        </select>
      </div>
    </div>

    <!-- BPM Controls -->
    <div class="flex flex-col items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <label class="text-base md:text-xl text-gray-700 font-normal">
        Tempo (BPM)
      </label>
      <div class="flex items-center gap-2 sm:gap-3">
        <button
          @click="decreaseBPM"
          :disabled="bpm <= 40"
          class="w-8 h-8 sm:w-10 sm:h-10 bg-purple hover:bg-purple/90 text-white font-bold text-base sm:text-lg rounded-lg shadow disabled:opacity-50"
        >
          -
        </button>
        <input
          type="number"
          v-model.number="bpm"
          min="40"
          max="240"
          class="w-16 sm:w-20 border border-gray-300 rounded px-1 sm:px-2 py-0.5 sm:py-1 text-base sm:text-xl text-center bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          @click="increaseBPM"
          :disabled="bpm >= 240"
          class="w-8 h-8 sm:w-10 sm:h-10 bg-purple hover:bg-purple/90 text-white font-bold text-base sm:text-lg rounded-lg shadow disabled:opacity-50"
        >
          +
        </button>
      </div>
      <p class="text-base md:text-xl text-gray-500">Range: 40–240 BPM</p>
    </div>

    <!-- Play/Stop + Beat Circle -->
    <div class="flex flex-col items-center gap-3 sm:gap-4 w-full sm:w-auto">
      <button
        @click="toggleMetronome"
        :disabled="isLoading"
        class="px-3 py-1.5 sm:px-5 sm:py-2 bg-purple hover:bg-purple/90 text-white font-normal text-base sm:text-lg rounded-xl shadow"
      >
        {{ isPlaying ? "Stop" : "Start" }}
      </button>
      <div
        class="w-10 h-10 sm:w-12 sm:h-12 bg-purple rounded-full transition-transform duration-100"
        :class="{ 'scale-150': isBeating }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { devicesStore } from "@/stores/devices";
import quackSound from "@/assets/audio/quack.mp3";
import tackSound from "@/assets/audio/tack.mp3";
import mooSound from "@/assets/audio/moo.mp3";
import croakSound from "@/assets/audio/croak.mp3";
import neighSound from "@/assets/audio/neigh.mp3";

const devices = devicesStore();
const timeSignature = ref("4");
const timeSignatureDenominator = ref("4");
const selectedSound = ref("tack");
const bpm = ref(120);
const isPlaying = ref(false);
const isBeating = ref(false);
const isLoading = ref(false);
let intervalId = null;
let audio = null;
const soundMap = {
  quack: quackSound,
  tack: tackSound,
  moo: mooSound,
  croak: croakSound,
  neigh: neighSound,
};

const availableSounds = ref(["tack", "quack", "moo", "croak", "neigh"]);

const loadSound = () => {
  if (!selectedSound.value || !soundMap[selectedSound.value]) {
    console.warn("Invalid sound selected:", selectedSound.value);
    return;
  }

  isLoading.value = true;

  try {
    audio = new Audio(soundMap[selectedSound.value]);

    audio.volume = devices.outputVolume;
    audio.load();
  } catch (err) {
    console.error("Audio load error:", err);
  }

  isLoading.value = false;
};

const toggleMetronome = () => {
  if (isPlaying.value) {
    stopMetronome();
  } else {
    startMetronome();
  }
};

const startMetronome = () => {
  if (!audio) loadSound();
  isPlaying.value = true;
  const beatDuration = 60000 / bpm.value; // milliseconds per beat
  let beatCount = 0;

  intervalId = setInterval(() => {
    beatCount = (beatCount + 1) % parseInt(timeSignature.value);
    isBeating.value = true;
    audio.currentTime = 0; // Reset audio to start
    audio.play().catch((error) => console.error("Audio play error:", error));

    setTimeout(() => {
      isBeating.value = false;
    }, 100);
  }, beatDuration);
};

const stopMetronome = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isPlaying.value = false;
  isBeating.value = false;
  if (audio) audio.pause();
};

const updateTempo = () => {
  const signature = parseInt(timeSignature.value);
  const denominator = parseInt(timeSignatureDenominator.value);
  if (denominator === 4) {
    bpm.value = Math.max(
      40,
      Math.min(240, bpm.value + (signature === 3 ? -10 : 10)),
    );
  }
  if (isPlaying.value) {
    stopMetronome();
    startMetronome();
  }
};

const increaseBPM = () => {
  if (bpm.value < 240) {
    bpm.value += 1;
    if (isPlaying.value) {
      stopMetronome();
      startMetronome();
    }
  }
};

const decreaseBPM = () => {
  if (bpm.value > 40) {
    bpm.value -= 1;
    if (isPlaying.value) {
      stopMetronome();
      startMetronome();
    }
  }
};

onMounted(() => {
  loadSound();
});

watch([bpm, selectedSound], () => {
  if (isPlaying.value) {
    stopMetronome();
    startMetronome();
  }
});

watch(
  () => devices.selectedSpeaker,
  (newSpeaker) => {
    if (audio && newSpeaker) {
      audio.setSinkId(newSpeaker.deviceId);
      audio.volume = devices.outputVolume;
    }
  },
);

watch(
  () => devices.outputVolume,
  (newVolume) => {
    if (audio) {
      audio.volume = newVolume;
    }
  },
);
</script>
