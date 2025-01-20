<template>
  <div class="flex flex-col items-center justify-center p-4 w-full h-[70vh]">
    <div class="w-full max-w-screen-lg">
      <!-- Adjust the py value for padding and add custom max-width if needed -->
      <div class="relative h-[25vh] w-[?vw] bg-tuner-bg rounded-lg">
        <div
          v-for="i in 21"
          :key="i"
          class="absolute bottom-4"
          :class="[
            i % 2 === 1 ? 'h-[16vh]' : 'h-[8vh]',
            'bg-white',
            'w-[0.05vw]',
          ]"
          :style="{ left: `${(i - 1) * 5}%` }"
        ></div>
        <!-- Slider indicator, make sure detuneValue is calculated properly -->
        <div
          class="bg-blue-500 w-3 h-12 absolute bottom-4"
          :style="{ left: `calc(50% + ${detuneValue}px)` }"
        ></div>
        <!-- Numerical labels for long bars, adjust positioning if necessary -->
        <div
          v-for="j in 11"
          :key="`label-${j}`"
          class="absolute text-base text-white"
          :style="{
            left: `${(2 * j - 2) * 5}%`,
            bottom: '-30px',
            transform: 'translateX(-50%)',
          }"
        >
          {{ (j - 6) * 10 }}
        </div>
      </div>
      <div class="text-white flex justify-center mt-10 pt-12">
        <!-- Adjusted margin top -->
        <div v-if="isFlat" class="text-3xl text-gray-400 mr-2">b</div>
        <!-- Adjusted size and margin -->
        <div class="bg-tuner-bg p-3 rounded-md text-3xl">{{ currentNote }}</div>
        <!-- Adjusted text size -->
        <div v-if="isSharp" class="text-3xl text-gray-400 ml-2">#</div>
        <!-- Adjusted size and margin -->
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
