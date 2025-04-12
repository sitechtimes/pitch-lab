<template>
  <div class="bg-controllers-bg rounded-3xl">
    <div class="flex items-center justify-center">
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

    <!-- Tuning Section -->
    <div class="mt-5 bg-entire-bg">
      <TunerSection />
    </div>
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
