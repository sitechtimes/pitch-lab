<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-screen-2xl">
      <div
        class="relative flex justify-center items-center h-[40vh] bg-tuner-bg py-12 my-12 px-6 rounded-lg shadow-lg"
        style="width: 100%"
      >
        <div class="relative w-full" style="height: 100%">
          <div
            v-for="i in 21"
            :key="i"
            class="absolute bg-white w-[1px]"
            :class="{
              'h-[21vh]': i % 2 === 1,
              'h-[15vh]': i % 2 !== 1,
            }"
            :style="{
              left: `${(i - 1) * 5}%`,
              top: '50%',
              transform: 'translateY(-50%)',
            }"
          ></div>
          <div
            class="absolute w-1 h-24 rounded-sm shadow-lg"
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
            class="absolute text-2xl text-white font-mono"
            :style="{
              left: `${(2 * j - 2) * 5}%`,
              bottom: '-40px',
              transform: 'translateX(-50%)',
              textShadow: '0 0 6px rgba(255,255,255,0.4)',
            }"
          >
            {{ (j - 6) * 10 }}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between w-1/3 mx-auto">
        <div
          :class="{
            'bg-tuner-bg': !isFlat,
            'bg-orange': isFlat,
            'px-6': true,
            'py-4': true,
            'text-3xl': true,
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
            'text-4xl': true,
            'px-6': true,
            'py-4': true,
            'rounded-2xl': true,
            'text-white': true,
            'shadow-lg': true,
          }"
        >
          {{ closestNote ? closestNote.note : "" }}
        </div>
        <div
          :class="{
            'bg-tuner-bg': !isSharp,
            'bg-orange': isSharp,
            'px-6': true,
            'py-4': true,
            'text-3xl': true,
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
      <div class="flex flex-col items-center py-9">
        <button
          class="bg-tuner-bg hover:bg-purple-600 active:scale-95 transition-all text-white font-bold py-3 px-6 text-3xl rounded-xl shadow-lg"
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
