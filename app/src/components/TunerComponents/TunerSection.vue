<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-screen-xl">
      <!-- Adjusted container width -->
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
          <!-- Slider indicator -->
          <div
            class="bg-blue-500 w-3 h-12 absolute bottom-4"
            :style="{ left: `calc(50% + ${detuneValue}px)` }"
          ></div>
          <!-- Updated numerical labels -->
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
        <div class="bg-tuner-bg px-5 py-3 text-3xl rounded-full text-white">
          b
        </div>
        <div class="text-4xl bg-tuner-bg px-5 py-3 rounded-lg text-white">
          {{ currentNote }}
        </div>
        <div class="bg-tuner-bg px-5 py-3 text-3xl rounded-full text-white">
          #
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Mock data for demonstration
const detuneValue = ref(20); // Detune value should be dynamically updated based on pitch detection
const currentNote = ref("F");
</script>

<style scoped>
/* Additional styling as needed */
</style>
