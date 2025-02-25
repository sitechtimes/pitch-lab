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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const selectedFFTSize = ref(2048);
const fftSizes = [256, 512, 1024, 2048, 4096, 8192, 16384];

// Update FFT size
const updateFFTSize = () => {
  console.log(`FFT size updated to ${selectedFFTSize.value}`);
};
</script>
