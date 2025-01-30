<template>
  <div class="w-screen h-[100vh] bg-entire-bg text-white">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-4 bg-entire-bg">
      <HeaderTitle />
      <SettingsIcon />
    </header>

    <!-- Settings Modal -->
    <DeviceSelector
      v-if="settings.showSettingsModal"
      name="History"
      class="absolute inset-0 bg-black/30 p-4"
    />

    <!-- Main Control Panel -->
    <div class="flex justify-center mt-8">
  
      <div
        class="w-[95%] bg-controllers-bg rounded-3xl p-6 "
      >    
      <div class="flex justify-between text-center w-full text-3xl font-semibold mb-2">      
        <h1 class="w-[40%]">Recorder</h1>    
        <h1 class="w-[30%]">Metronome</h1>       
        <h1 class="w-[30%]">Tuner</h1>
      </div>
      <div class="flex justify-between items-center">
        <!-- Recorder -->
      <div class="w-[40%] flex flex-row justify-between">
        <AudioRecorder />
    
        <div
          v-if="audioStore.viewingHistory"
          class="absolute inset-0 bg-black/30 p-4"
        >
          <HistoryModal />
        </div>  
      </div>
        
        <!-- Metronome -->
        <div class="w-[30%]items-center">
          <MetronomeController />
        </div>
        <!-- Tuner -->
        <div class="w-[30%] ">
          <TunerController />
        </div>
      </div>
      </div>
    </div>

    <!-- Tuning Section -->
    <div class="mt-5 bg-entire-bg">
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
import HistoryModal from "./components/AudioComponents/HistoryModal.vue";
import TunerSection from "./components/TunerComponents/TunerSection.vue";

import { audioFiles } from "./stores/audioFiles";
import { settingsStore } from "./stores/settings.js";

const audioStore = audioFiles();
const settings = settingsStore();
</script>
