<template>
  <div
    class="metronome-container p-8 max-w-md mx-auto rounded-xl"
    style="background: #120e1d"
  >
    <!-- Time Signature Controls -->
    <div class="time-signature mb-6">
      <div class="flex gap-4 justify-center">
        <select
          v-model="timeSignatureTop"
          class="p-2 rounded bg-tuner-bg text-white focus:ring-purple focus:border-purple"
        >
          <option v-for="n in 7" :value="n + 1" :key="n">{{ n + 1 }}</option>
        </select>
        <select
          v-model="timeSignatureBottom"
          class="p-2 rounded bg-tuner-bg text-white focus:ring-purple focus:border-purple"
        >
          <option value="4">4</option>
          <option value="8">8</option>
        </select>
      </div>
      <div class="text-center mt-2 text-white">Time Signature</div>
    </div>

    <!-- Tempo Controls -->
    <div class="tempo-controls mb-6">
      <div class="flex items-center gap-4 justify-center">
        <button
          @click="adjustTempo(-5)"
          class="px-4 py-2 bg-purple rounded-lg text-white hover:bg-[#5a0db6] transition-colors"
        >
          -
        </button>

        <input
          type="number"
          v-model="tempo"
          class="w-24 text-center p-2 rounded bg-tuner-bg text-white border border-purple focus:ring-purple"
        />

        <button
          @click="adjustTempo(5)"
          class="px-4 py-2 bg-purple rounded-lg text-white hover:bg-[#5a0db6] transition-colors"
        >
          +
        </button>
      </div>
      <div class="text-center mt-2 text-white">BPM</div>
    </div>

    <!-- Sound Selection -->
    <div class="sound-selection mb-6">
      <select
        v-model="selectedSound"
        class="w-full p-2 rounded bg-tuner-bg text-white border border-purple focus:ring-purple"
      >
        <option value="beep">Default Beep</option>
        <option value="duck">Duck Quack</option>
      </select>
    </div>

    <!-- Play/Stop Button -->
    <button
      @click="toggleMetronome"
      :class="[
        'w-full py-4 rounded-xl font-bold transition-colors',
        isPlaying
          ? 'bg-purple hover:bg-[#5a0db6]'
          : 'bg-purple/80 hover:bg-purple',
      ]"
    >
      {{ isPlaying ? "Stop" : "Start" }}
    </button>

    <!-- Visual Pulse -->
    <div
      class="visual-pulse mx-auto mt-6 rounded-full bg-purple"
      :style="{
        width: pulseSize + 'px',
        height: pulseSize + 'px',
        opacity: currentBeat === 1 ? 1 : 0.6,
        transform: `scale(${pulseScale})`,
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from "vue";
import { persistedSettings } from "@/stores/persistedStore";
import { settingsStore } from "@/stores/settings";
import duckSound from "@/assets/rams-duck-quack-edited.mp3";

const persistedStore = persistedSettings();
const settings = settingsStore();

const isPlaying = ref(false);
const tempo = ref(120);
const timeSignatureTop = ref(4);
const timeSignatureBottom = ref(4);
const selectedSound = ref("beep");
const currentBeat = ref(1);
const audioContext = computed(() => settings.audioContext.value);
const pulseScale = ref(1);
const pulseSize = 50;

// Audio elements
let beepBuffer = null;
let duckBuffer = null;
let timerId = null;

const initAudio = async () => {
  try {
    // Initialize store audio first
    const success = await settings.initializeAudio();
    if (!success || !settings.audioContext.value) {
      throw new Error("Audio system failed to initialize");
    }

    // Load buffers only once
    if (!beepBuffer) {
      [beepBuffer, duckBuffer] = await Promise.all([
        loadAudio("/metronome-beep.mp3"),
        loadAudio(duckSound),
      ]);
    }

    // Connect metronome to output
    const source = settings.audioContext.value.createBufferSource();
    source.connect(settings.outputGainNode.value);

    return true;
  } catch (error) {
    console.error("Metronome audio init failed:", error);
    return false;
  }
};
// Load audio files
const loadAudio = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.value.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error("Failed to load audio:", url, error);
    throw error; // Rethrow for handling in initAudio
  }
};

const playSound = () => {
  try {
    if (!audioContext.value) throw new Error("Audio context not initialized");

    const buffer = selectedSound.value === "duck" ? duckBuffer : beepBuffer;
    const source = audioContext.value.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.value.createGain();
    gainNode.gain.value = currentBeat.value === 1 ? 1 : 0.7;

    source.connect(gainNode);
    gainNode.connect(settings.mediaStreamDestination.value);
    source.start(0);

    settings.audioElement.value?.play().catch(console.error);
  } catch (error) {
    console.error("Playback error:", error);
    // Handle playback failure
  }
  console.log("Audio Context State:", {
    storeInitialized: !!settings.audioContext.value,
    componentAudioContext: !!audioContext.value,
    mediaStreamDest: !!settings.mediaStreamDestination.value,
    audioElement: !!settings.audioElement.value,
  });
};
// Visual pulse animation
const animatePulse = () => {
  pulseScale.value = 1.3;
  setTimeout(() => {
    pulseScale.value = 1;
  }, 50);
};

// Metronome tick handler
const tick = () => {
  playSound();
  animatePulse();
  currentBeat.value = (currentBeat.value % timeSignatureTop.value) + 1;
};

// Start/stop metronome
const toggleMetronome = async () => {
  if (!isPlaying.value) {
    try {
      await initAudio();
      timerId = setInterval(tick, beatInterval.value);
    } catch (error) {
      isPlaying.value = false; // Reset state on error
      console.log(error);
      return;
    }
  } else {
    clearInterval(timerId);
    currentBeat.value = 1;
  }
  isPlaying.value = !isPlaying.value;
};
// Tempo adjustment
const adjustTempo = (change) => {
  tempo.value = Math.max(20, Math.min(300, tempo.value + change));
};

// Watch tempo changes
watch(tempo, () => {
  if (isPlaying.value) {
    clearInterval(timerId);
    timerId = setInterval(tick, beatInterval.value);
  }
});

// Initialize devices on mount
onMounted(async () => {
  await settings.getDevices();
  // Initialize with store's selected speaker
  if (persistedStore.selectedSpeaker) {
    await settings.updateOutputDevice(persistedStore.selectedSpeaker);
  }
});
// Cleanup
onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId);
  settings.cleanupAudio(); // Use store's cleanup method
});

// Computed beat interval
const beatInterval = computed(() => {
  const beatsPerSecond = tempo.value / 60;
  return 1000 / beatsPerSecond;
});
</script>

<style scoped>
.visual-pulse {
  transition: all 0.1s ease-in-out;
  box-shadow: 0 0 15px rgba(114, 16, 227, 0.3);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
</style>
