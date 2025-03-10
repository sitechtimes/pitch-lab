<template>
  <div class="metronome-container">
    <h1>Metronome</h1>
    <div class="controls">
      <select v-model="persistedStore.timeSignature" @change="updateTempo">
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      /
      <select
        v-model="persistedStore.timeSignatureDenominator"
        @change="updateTempo"
      >
        <option value="4">4</option>
      </select>

      <select v-model="persistedStore.selectedSound" @change="loadSound">
        <option value="duck">Select Options</option>
        <option v-for="sound in availableSounds" :key="sound" :value="sound">
          {{ sound }}
        </option>
      </select>

      <button @click="toggleMetronome" :disabled="isLoading">
        {{ isPlaying ? "Stop" : "Start" }}
      </button>

      <div class="bpm-controls">
        <button @click="decreaseBPM" :disabled="persistedStore.bpm <= 40">
          -
        </button>
        <span>{{ persistedStore.bpm }} BPM</span>
        <button @click="increaseBPM" :disabled="persistedStore.bpm >= 240">
          +
        </button>
      </div>

      <div class="beat-circle" :class="{ beat: isBeating }"></div>
    </div>
  </div>
</template>

<script setup>
import { persistedSettings } from "@/stores/persistedStore";
import { ref, onMounted, watch } from "vue";
const persistedStore = persistedSettings();

// State
const isPlaying = ref(false);
const isBeating = ref(false);
const isLoading = ref(false);
let intervalId = null;
let audio = null;

const availableSounds = ref(["quack", "tack"]); // Add more as needed

const loadSound = () => {
  isLoading.value = true;
  audio = new Audio(`/${persistedStore.selectedSound}.mp3`);
  audio.setSinkId(persistedStore.selectedSpeaker);
  audio.volume = persistedStore.outputVolume;
  audio.load();
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
  const beatDuration = 60000 / persistedStore.bpm; // milliseconds per beat
  let beatCount = 0;

  intervalId = setInterval(() => {
    beatCount = (beatCount + 1) % parseInt(persistedStore.timeSignature);
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
  const signature = parseInt(persistedStore.timeSignature);
  const denominator = parseInt(persistedStore.timeSignatureDenominator);
  if (denominator === 4) {
    persistedStore.bpm = Math.max(
      40,
      Math.min(240, persistedStore.bpm + (signature === 3 ? -10 : 10)),
    );
  }
  if (isPlaying.value) {
    stopMetronome();
    startMetronome();
  }
};

const increaseBPM = () => {
  if (persistedStore.bpm < 240) {
    persistedStore.bpm += 1;
    if (isPlaying.value) {
      stopMetronome();
      startMetronome();
    }
  }
};

const decreaseBPM = () => {
  if (persistedStore.bpm > 40) {
    persistedStore.bpm -= 1;
    if (isPlaying.value) {
      stopMetronome();
      startMetronome();
    }
  }
};

onMounted(() => {
  loadSound();
});

watch([persistedStore.bpm, persistedStore.selectedSound], () => {
  if (isPlaying.value) {
    stopMetronome();
    startMetronome();
  }
});

watch(
  () => persistedStore.selectedSpeaker,
  (newSpeaker) => {
    audio.setSinkId(newSpeaker);
    audio.volume = persistedStore.outputVolume;
  },
);

watch(
  () => persistedStore.outputVolume,
  (newVolume) => {
    audio.volume = newVolume;
  },
);
</script>

<style scoped>
.metronome-container {
  color: white;
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

select,
button {
  padding: 5px 10px;
  font-size: 16px;
  background-color: #8a2be2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

.bpm-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.bpm-controls button {
  width: 30px;
  height: 30px;
}

.beat-circle {
  width: 50px;
  height: 50px;
  background-color: #8a2be2;
  border-radius: 50%;
  margin: 0 auto;
  transition: transform 0.1s ease-in-out;
}

.beat-circle.beat {
  transform: scale(1.5); /* Enlarge the circle when beating */
}
</style>
