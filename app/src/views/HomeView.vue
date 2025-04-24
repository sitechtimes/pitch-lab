<template>
  <div class="bg-controllers-bg rounded-3xl py-6">
    <div class=" flex flex-col w-[90%] sm:flex-row items-center justify-between">
  <!-- Recorder Section -->
  <div class="w-full justify-between sm:w-1/3">
    <AudioRecorder />
    <div
          v-if="audioStore.showHistoryModal"
          class="absolute inset-0 bg-black/30 p-4"
        >
          <HistoryModal />
        </div>
  </div>
  <div class="w-0.5 bg-[#A3D10A] self-stretch hidden sm:block"></div>  <!-- Metronome Section -->
  <div class="w-full sm:w-1/3">
    <MetronomeController />
  </div>
  <div class="w-0.5 bg-[#A3D10A] self-stretch hidden sm:block"></div>  <!-- Tuner Section -->
  <div >
    <TunerController />
  </div>
</div>

    <!-- Tuning Section -->
    
  </div>
  <div class="mt-5 bg-entire-bg">
      <TunerSection />
    </div>
</template>

<script setup>
import AudioRecorder from "../components/BodyControllers/AudioRecorder.vue";
import TunerController from "../components/BodyControllers/TunerController.vue";
import MetronomeController from "../components/BodyControllers/MetronomeController.vue";
import HistoryModal from "../components/AudioComponents/HistoryModal.vue";
import TunerSection from "../components/TunerComponents/TunerSection.vue";
import { audioFilesStore } from "../stores/audioFiles";

const audioStore = audioFilesStore();
</script>
