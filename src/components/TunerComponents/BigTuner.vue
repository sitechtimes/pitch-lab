<template>
  <div class="flex flex-col items-center justify-center px-8">
    <div class="w-full max-w-screen-2xl">
      <div
        class="relative flex justify-center items-center h-[50vh] bg-tuner-bg py-16 my-16 px-12 rounded-xl shadow-xl"
        style="width: 100%"
      >
        <div class="relative w-full" style="height: 100%">
          <div
            v-for="i in 21"
            :key="i"
            class="absolute bg-white w-[2px]"
            :class="{
              'h-[30vh]': i % 2 === 1,
              'h-[20vh]': i % 2 !== 1,
            }"
            :style="{
              left: `${(i - 1) * 5}%`,
              top: '50%',
              transform: 'translateY(-50%)',
            }"
          ></div>
          <div
            class="absolute w-1 h-48 rounded-sm shadow-lg"
            :style="{
              background: 'linear-gradient(to bottom, #facc15, #f59e0b)',
              boxShadow: '0 0 8px rgba(255, 213, 0, 0.6)',
              left: indicatorPosition,
              transform: 'translateX(-50%) translateY(-50%)',
              top: '50%',
            }"
          ></div>
          <div
            v-for="j in 11"
            :key="`label-${j}`"
            class="absolute text-4xl text-white font-semibold"
            :style="{
              left: `${(2 * j - 2) * 5}%`,
              bottom: '-50px',
              transform: 'translateX(-50%)',
            }"
          >
            {{ (j - 6) * 10 }}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between w-1/2 mx-auto gap-8">
        <div
          :class="{
            'bg-tuner-bg': !isFlat,
            'bg-orange': isFlat,
            'px-8': true,
            'py-5': true,
            'text-5xl': true,
            'rounded-full': true,
            'text-white': true,
          }"
        >
          b
        </div>
        <div
          :class="{
            'bg-tuner-bg': !isInTune,
            'bg-green': isInTune,
            'text-6xl': true,
            'px-8': true,
            'py-5': true,
            'rounded-xl': true,
            'text-white': true,
          }"
        >
          {{ closestNote ? closestNote.note : "" }}
        </div>
        <div
          :class="{
            'bg-tuner-bg': !isSharp,
            'bg-orange': isSharp,
            'px-8': true,
            'py-5': true,
            'text-5xl': true,
            'rounded-full': true,
            'text-white': true,
          }"
        >
          #
        </div>
      </div>
      <div class="flex justify-center text-white mt-8 text-3xl font-mono">
        <span v-if="closestNote">{{ detuneValue.toFixed(1) }} cents</span>
      </div>
      <div class="flex flex-col items-center py-12">
        <button
          class="bg-tuner-bg text-white font-bold py-4 px-8 text-4xl rounded-xl shadow-lg"
          @click="toggleTuning"
        >
          {{ isTuning ? "Stop Tuning" : "Start Tuning" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTuner } from "@/composables/useTuner";

const {
  isTuning,
  isFlat,
  isSharp,
  isInTune,
  closestNote,
  detuneValue,
  indicatorPosition,
  toggleTuning,
} = useTuner();
</script>
