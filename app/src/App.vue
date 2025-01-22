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
        class="w-[95%] bg-controllers-bg rounded-3xl p-6 flex justify-between items-center"
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
    <div class="mt-20 bg-entire-bg">
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
import TunerSection from "./components/TunerComponents/TunerSection.vue";

const settings = settingsStore();
</script>
