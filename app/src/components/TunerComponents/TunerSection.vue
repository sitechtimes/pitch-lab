<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-screen-lg">
      <div class="relative w-full bg-tuner-bg py-8 rounded-lg">
        <!-- Long bars and short bars -->
        <div
          v-for="i in 21"
          :key="i"
          class="absolute bottom-4"
          :class="[i % 2 === 1 ? 'h-20' : 'h-10', 'bg-white', 'w-0.5']"
          :style="{ left: `${(i - 1) * 4.76}%` }"
        ></div>
        <!-- Slider indicator -->
        <div
          class="bg-blue-500 w-2 h-10 absolute bottom-4"
          :style="{ left: `calc(50% + ${detuneValue}px)` }"
        ></div>
        <!-- Numerical labels for long bars -->
        <div
          v-for="j in 11"
          :key="`label-${j}`"
          class="absolute text-xs text-white"
          :style="{ left: `${(2 * j - 2) * 4.76}%`, bottom: '-20px' }"
        >
          {{ (j - 6) * 10 }}
        </div>
      </div>
      <div class="text-white flex justify-center mt-2">
        <div v-if="isFlat" class="text-2xl text-gray-400 mr-1">b</div>
        <div class="text-2xl">{{ currentNote }}</div>
        <div v-if="isSharp" class="text-2xl text-gray-400 ml-1">#</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Mock data for demonstration
const detuneValue = ref(20); // Detune value should be dynamically updated based on pitch detection
const currentNote = ref("F");
const isFlat = ref(false);
const isSharp = ref(detuneValue.value > 0);
</script>

<style scoped>
/* Additional styling as needed */
</style>
