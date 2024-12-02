<template>
  <div class="w-screen bg-[#2A283B]">
    <header class="flex justify-between">
      <h1 class="text-white text-5xl m-6">Pitch Lab</h1>
      <!-- HeaderTitle -->
      <SettingsIcon />
    </header>
    <AudioRecorder />
    <AudioController />
    <TunerSection />
    <RouterView />
  </div>
</template>

<script setup>
import HeaderTitle from "./components/HeaderComponents/HeaderTitle.vue";
import AudioRecorder from "./components/BodyComponents/AudioRecorder.vue";
import DeviceSelector from "./components/HeaderComponents/Settings/DeviceSelector.vue";
import SettingsIcon from "./components/HeaderComponents/Settings/SettingsIcon.vue";
import { settingsStore } from "./stores/settings.js";

const settings = settingsStore();

import TunerSection from "./components/TunerComponents/TunerSection.vue";
</script>

<style scoped></style>
