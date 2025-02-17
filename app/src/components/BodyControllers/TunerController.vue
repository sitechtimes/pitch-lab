<template>
  <div class="flex flex-col">
    <div
      class="flex items-center justify-between p-4 bg-gray-900 rounded-md text-white max-w-sm"
    >
      <!-- Label -->
      <div class="flex flex-col">
        <label for="fft-size" class="text-lg font-semibold mb-2 text-gray-300">
          FFT Size
        </label>
        <!-- FFT Size Dropdown -->
        <div class="relative text-black">
          <select
            v-model="selectedFFTSize"
            @change="updateFFTSize"
            class="bg-gray-800 text-gray-300 border border-gray-600 rounded px-4 py-1 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option v-for="size in fftSizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <!-- Volume Slider -->
        <div class="flex items-center mt-4">
          <div class="text-gray-300 mr-2">
            <span>&#128266;</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            v-model="volume"
            @input="updateVolume"
            class="w-24 h-1 bg-gray-700 rounded appearance-none focus:outline-none accent-purple-500"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { persistedSettings } from "@/stores/persistedStore";

// Reactive state
const selectedFFTSize = ref(2048); // Default FFT size
const fftSizes = [256, 512, 1024, 2048, 4096, 8192, 16384]; // Available FFT sizes
const volume = ref(persistedSettings().outputVolume * 100); // Initialize volume from persisted settings

// Update FFT size
const updateFFTSize = () => {
  console.log(`FFT size updated to ${selectedFFTSize.value}`);
  // You can trigger any FFT-related logic here if needed
};

// Update the volume dynamically
const updateVolume = () => {
  const normalizedVolume = volume.value / 100;
  console.log(`Volume updated to ${normalizedVolume}`);
  // Save the updated volume to persisted settings
  persistedSettings().setOutputVolume(normalizedVolume);
};

// Initialize volume when the component mounts
onMounted(() => {
  volume.value = persistedSettings().outputVolume * 100; // Sync with persisted volume
});
</script>
