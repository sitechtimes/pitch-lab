<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-screen-lg">
      <!-- Adjust the py value for padding and add custom max-width if needed -->
      <div
        class="relative flex justify-center items-center h-[30vh] w-full bg-tuner-bg py-12 my-12 rounded-lg"
      >
        <div class="relative w-full max-w-screen-md" style="height: 100%">
          <div
            v-for="i in 21"
            :key="i"
            class="absolute bg-white w-[1px]"
            :class="{
              'h-[16vh]': i % 2 === 1,
              'h-[8vh]': i % 2 !== 1,
            }"
            :style="{
              left: `${(i - 1) * 5}%`,
              top: '50%',
              transform: 'translateY(-50%)',
            }"
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
            class="absolute text-xl text-white"
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
      <div class="flex items-center justify-between w-1/5 mx-auto">
        <div v-if="isFlat" class="text-3xl text-white">b</div>
        <div class="text-4xl bg-tuner-bg px-4 py-3 rounded-md text-white">
          {{ currentNote }}
        </div>
        <div v-if="isSharp" class="text-3xl text-white">#</div>
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
