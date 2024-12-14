<template>
  <div class="mt-8">
    <p class="text-gray-400">
      Current Tuning Note: {{ tuningStore.currentNote }}
    </p>
    <div
      class="scale-container relative w-96 h-6 bg-gray-900 rounded overflow-hidden"
    >
      <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-green-500"></div>
      <div
        :style="{ transform: `translateX(${detuneValue}px)` }"
        class="slider w-2 h-6 bg-blue-500 absolute top-0 left-1/2 -translate-x-1/2"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { useTuningStore } from "../stores/tuning";
import { ref } from "vue";

const tuningStore = useTuningStore();
const detuneValue = ref(0); // Replace with actual calculation logic
</script>

<style scoped>
.scale-container {
  position: relative;
  background-color: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
}

.slider {
  height: 24px;
  width: 8px;
  background-color: #00b4d8;
  position: absolute;
  top: 0;
  transform: translateX(-50%);
}
</style>
