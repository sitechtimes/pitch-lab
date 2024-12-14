<template>
  <div
    class="flex flex-col items-center space-y-2 bg-[#26233A] p-4 rounded-lg w-full"
  >
    <!-- Dropdown for Tuning -->
    <select
      v-model="selectedTuning"
      class="bg-[#1A1725] text-white px-3 py-2 rounded focus:outline-none"
    >
      <option
        v-for="option in tuningOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Listen Button -->
    <button
      @click="toggleListening"
      class="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded transition"
    >
      {{ isListening ? "Stop Listening" : "Listen" }}
    </button>

    <!-- Volume Slider -->
    <div class="flex items-center space-x-2 mt-2">
      <i class="material-icons text-white">volume_up</i>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        v-model="volume"
        class="slider"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isListening = ref(false);
const selectedTuning = ref("B");
const volume = ref(50);

const tuningOptions = [
  { label: "Tune A to 440 Hz", value: "A" },
  { label: "Tune B to b", value: "B" },
  { label: "Tune C to c#", value: "C" },
  { label: "Tune D to d", value: "D" },
];

const toggleListening = () => {
  isListening.value = !isListening.value;
  console.log(isListening.value ? "Listening started" : "Listening stopped");
};
</script>

<style scoped>
.slider {
  appearance: none;
  width: 100px;
  height: 5px;
  background: #6b7280;
  outline: none;
  border-radius: 3px;
  transition: 0.3s;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: #4f46e5;
  border-radius: 50%;
  cursor: pointer;
}

.slider:hover::-webkit-slider-thumb {
  background: #4338ca;
}
</style>
