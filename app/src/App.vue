<template>
  <div class="w-screen bg-[#2A283B]">
    <header class="flex justify-between">
      <h1 class="text-white text-5xl m-6">Pitch Lab</h1>
      <SettingsIcon />
    </header>

    <DeviceSelector
      v-if="settings.showModal"
      name="History"
      class="absolute inset-0 bg-black/30 p-4"
    />
    <div class="flex justify-center">
      <div class="w-[95%] bg-[#1A1725] rounded-3xl my-10">
        <AudioRecorder class="w-[40%]" />
      </div>
    </div>
    <TunerSection />
    <RouterView />
  </div>
</template>

<script setup>
import AudioRecorder from "./components/AudioRecorder.vue";
import DeviceSelector from "./components/DeviceSelector.vue";
import SettingsIcon from "./components/SettingsIcon.vue";
import { settingsStore } from "./stores/settings.js";

const settings = settingsStore();

import TunerSection from "./components/TunerSection.vue";
</script>

<style scoped></style>
