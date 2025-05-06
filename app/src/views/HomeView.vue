<template>
  <div class="bg-controllers-bg rounded-3xl py-6">
    <div class="w-[95%] p-2 flex-items-center justify-center mx-auto">
      <!-- <h1 class="text-3xl text-[#A3D10A] font-bold text-center">Controllers</h1> -->
      <div class="flex flex-col items-center justify-between md:flex-row">
      <!-- Recorder -->
      <div class="flex w-[35%] flex-col relative">
        <AudioRecorder />
        <div
          v-if="audioStore.showHistoryModal"
          class="absolute inset-0 bg-black/30 p-4"
        >
          <HistoryModal />
        </div>
      </div>
      <div class="w-0.5 bg-[#A3D10A] self-stretch hidden sm:block"></div>

      <!-- Metronome -->
      <div class="w-[35%] items-center flex justify-center">
        <MetronomeController />
      </div>
      <div class="w-0.5 bg-[#A3D10A] self-stretch hidden sm:block"></div>
      <!-- Tuner -->
      <div class="w-[20%] flex justify-center">
        <TunerController />
      </div>
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
