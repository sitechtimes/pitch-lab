<template>
  <div
    class="metronome-container p-8 max-w-2xl mx-auto rounded-xl"
  >
    <div class="flex items-center gap-6 justify-between">
      <!-- Time Signature -->
      <div class="time-signature">
        <div class="flex gap-2 items-center">
          <select
            v-model="timeSignatureTop"
            class="p-2 w-16 text-center rounded bg-tuner-bg text-white focus:ring-purple focus:border-purple"
          >
            <option v-for="n in 7" :value="n + 1" :key="n">{{ n + 1 }}</option>
          </select>
          <div class="text-white">/</div>
          <select
            v-model="timeSignatureBottom"
            class="p-2 w-16 text-center rounded bg-tuner-bg text-white focus:ring-purple focus:border-purple"
          >
            <option value="4">4</option>
            <option value="8">8</option>
          </select>
        </div>
        <div class="text-center mt-2 text-white text-sm">Time Signature</div>
      </div>

      <!-- Tempo Controls -->
      <div class="tempo-controls">
        <div class="flex items-center gap-3">
          <button
            @click="adjustTempo(-5)"
            class="px-4 py-2 bg-purple rounded-lg text-white hover:bg-[#5a0db6] transition-colors"
          >
            -
          </button>
          <div class="relative">
            <input
              type="number"
              v-model="tempo"
              class="w-24 text-center p-2 rounded bg-tuner-bg text-white border border-purple focus:ring-purple"
            />
            <div class="text-white text-sm mt-1">BPM</div>
          </div>
          <button
            @click="adjustTempo(5)"
            class="px-4 py-2 bg-purple rounded-lg text-white hover:bg-[#5a0db6] transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <!-- Sound Selection -->
      <div class="sound-selection w-40">
        <select
          v-model="selectedSound"
          class="w-full p-2 rounded bg-tuner-bg text-white border border-purple focus:ring-purple"
        >
          <option value="beep">Default Beep</option>
          <option value="duck">Duck Quack</option>
        </select>
      </div>

      <!-- Play/Stop Button & Pulse -->
      <div class="flex flex-col items-center gap-2">
        <button
          @click="toggleMetronome"
          :class="[
            'px-8 py-3 rounded-xl font-bold transition-colors',
            isPlaying
              ? 'bg-purple hover:bg-[#5a0db6]'
              : 'bg-purple/80 hover:bg-purple',
          ]"
        >
          {{ isPlaying ? "Stop" : "Start" }}
        </button>
        <div
          class="visual-pulse rounded-full bg-purple"
          :style="{
            width: pulseSize + 'px',
            height: pulseSize + 'px',
            opacity: currentBeat === 1 ? 1 : 0.6,
            transform: `scale(${pulseScale})`,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from "vue";
import { persistedSettings } from "@/stores/persistedStore";
import { settingsStore } from "@/stores/settings";
import duckSound from "@/assets/metronome-quack.mp3";
import beepSound from "@/assets/metronome-tack.mp3";

const persistedStore = persistedSettings();
const settings = settingsStore();

// State variables
const isPlaying = ref(false);
const tempo = ref(120);
const timeSignatureTop = ref(4);
const timeSignatureBottom = ref(4);
const selectedSound = ref("beep");
const currentBeat = ref(1);
const pulseScale = ref(1);
const pulseSize = 50;
let beepBuffer = null;
let duckBuffer = null;
let timerId = null;
let source = null;

const toggleMetronome = async () => {
  if (!isPlaying.value) {
    try {
      // Initialize audio resources
      const success = await initAudio();
      if (!success) throw new Error("Failed to initialize audio");

      // Resume the audio context if suspended
      if (settings.audioContext.state === "suspended") {
        await settings.audioContext.resume();
      }

      // Start the metronome
      timerId = setInterval(tick, beatInterval.value);
    } catch (error) {
      isPlaying.value = false; // Reset state on error
      console.error(error);
      return;
    }
  } else {
    clearInterval(timerId);
    currentBeat.value = 1;
  }
  isPlaying.value = !isPlaying.value;
};
// Initialize audio resources
const initAudio = async () => {
  try {
    const success = await settings.initializeAudio();
    if (!success || !settings.audioContext) {
      throw new Error("Audio system failed to initialize");
    }

    // Load buffers only once
    if (!beepBuffer) {
      [beepBuffer, duckBuffer] = await Promise.all([
        loadAudio(beepSound),
        loadAudio(duckSound),
      ]);
    }

    // Set the output device using the persisted speaker
    if (persistedStore.selectedSpeaker) {
      await settings.updateOutputDevice(persistedStore.selectedSpeaker);
    }

    // Apply the persisted output volume
    settings.setOutputVolume(persistedStore.outputVolume);

    console.log("Metronome audio initialized successfully.");
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
    return await settings.audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error("Failed to load audio:", url, error);
    throw error; // Rethrow for handling in initAudio
  }
};
const playSound = () => {
  try {
    if (!settings.audioContext)
      throw new Error("Audio context not initialized");
    if (!settings.outputGainNode)
      throw new Error("Output gain node not initialized");

    // Select the appropriate buffer
    const buffer = selectedSound.value === "duck" ? duckBuffer : beepBuffer;

    // Create an audio source and gain node
    source = settings.audioContext.createBufferSource();
    const gainNode = settings.audioContext.createGain();

    // Calculate playback speed and duration
    const beatDuration = 60 / tempo.value; // Duration of one beat in seconds
    const playbackRate = 1 / beatDuration; // Adjust playback speed to match tempo
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    // Volume control
    gainNode.gain.value = currentBeat.value === 1 ? 1 : 0.7;

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(settings.outputGainNode);

    // Start and stop the sound with precise timing
    const startTime = settings.audioContext.currentTime;
    source.start(startTime);
    source.stop(startTime + beatDuration);
  } catch (error) {
    console.error("Playback error:", error);
  }
};

const animatePulse = () => {
  pulseScale.value = 1.3;
  setTimeout(() => {
    pulseScale.value = 1;
  }, 100);
};

// Metronome tick handler
const tick = () => {
  initAudio();
  playSound();
  animatePulse();
  currentBeat.value = (currentBeat.value % timeSignatureTop.value) + 1;
};

// Adjust tempo
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
  await settings.getDevices(); // Fetch available devices
  if (persistedStore.selectedSpeaker) {
    await settings.updateOutputDevice(persistedStore.selectedSpeaker); // Set the persisted speaker
  }
});

// Cleanup
onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId);
  settings.cleanupAudio(); // Clean up audio resources
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
