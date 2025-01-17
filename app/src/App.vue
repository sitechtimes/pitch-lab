<template>
  <div class="w-screen bg-[#2A283B] text-white">
    <!-- Header -->
    <header
      class="flex items-center justify-between px-6 py-4 bg-[#1A1725] shadow-lg"
    >
      <HeaderTitle />
      <SettingsIcon />
    </header>

    <!-- Settings Modal -->
    <DeviceSelector
      v-if="settings.showModal"
      name="Setting"
      class="absolute inset-0 bg-black/30 p-4"
    />
    <div>
      <HistoryModal
        v-if="audioStore.viewingHistory"
        class="absolute inset-0 bg-black/30 p-4"
      />
    </div>
    <!-- Main Control Panel -->
    <div class="flex justify-center mt-8">
      <div
        class="w-[95%] bg-[#1A1725] rounded-3xl p-6 flex justify-between items-center"
      >
        <!-- Recorder -->
        <AudioRecorder class="w-[30%]" />

        <!-- Metronome -->
        <div class="w-[30%] flex flex-col items-center">
          <h2 class="text-lg font-semibold mb-2">Metronome</h2>
          <MetronomeController />
        </div>

        <!-- Tuner -->
        <div class="w-[30%] flex flex-col items-center">
          <h2 class="text-lg font-semibold mb-2">Tuner</h2>
          <TunerController />
        </div>
      </div>
    </div>

    <!-- Tuning Section -->
    <div class="mt-8">
      <TunerSection />
    </div>

    <RouterView />
  </div>
</template>

<script setup>
import HeaderTitle from "./components/HeaderComponents/HeaderTitle.vue";
import AudioRecorder from "./components/BodyControllers/AudioRecorder.vue";
import TunerController from "./components/BodyControllers/TunerController.vue";
import DeviceSelector from "./components/HeaderComponents/AdjusterSettings/DeviceSelector.vue";
import SettingsIcon from "./components/HeaderComponents/SettingsIcon.vue";
import MetronomeController from "./components/BodyControllers/MetronomeController.vue";
import { settingsStore } from "./stores/settings.js";
import HistoryModal from "./components/AudioComponents/HistoryModal.vue";
import { audioFiles } from "./stores/audioFiles";

const settings = settingsStore();
const audioStore = audioFiles();

import TunerSection from "./components/TunerComponents/TunerSection.vue";
</script>

<style scoped>
header {
  background-color: #1a1725;
  border-bottom: 2px solid #3a3a3a;
}
</style>
