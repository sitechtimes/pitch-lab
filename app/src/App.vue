<template>
  <div class="w-screen bg-[#2A283B]">
    <header class="flex justify-between">
      <HeaderTitle />
      <SettingsIcon />
    </header>

    <DeviceSelector
      v-if="settings.showModal"
      name="History"
      class="absolute inset-0 bg-black/30 p-4"
    />

    <div class="flex justify-center">
      <div class="w-[95%] bg-[#1A1725] rounded-3xl my-10">
        <AudioRecorder class="ml-9 w-[30%]" />
      </div>
      <!-- add metronome and tuner thingy here -->
    </div>

    <TunerSection />
    <MetronomeComponent />
    <RouterView />
  </div>
</template>

<script setup>
import HeaderTitle from "./components/HeaderComponents/HeaderTitle.vue";
import AudioRecorder from "./components/BodyComponents/AudioRecorder.vue";
import DeviceSelector from "./components/HeaderComponents/Settings/DeviceSelector.vue";
import SettingsIcon from "./components/HeaderComponents/Settings/SettingsIcon.vue";
import TunerSection from "./components/TunerComponents/TunerSection.vue";
import MetronomeComponent from "./components/MetronomeComponent.vue";
import { settingsStore } from "./stores/settings.js";

const settings = settingsStore();
</script>

<style scoped></style>
