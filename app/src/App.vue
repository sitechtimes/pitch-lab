<template>
  <div class="w-screen bg-entire-bg text-white min-h-screen">
    <header class="flex items-center justify-between px-6 py-4 bg-entire-bg md:flex-col">
      <HeaderTitle />
      <div class="flex items-center gap-4">
        <router-link to="/" class="text-xl hover:underline">Home</router-link>
        <router-link to="/tuner" class="text-xl hover:underline"
          >Tuner</router-link
        >
        <SettingsIcon />
      </div>
    </header>

    <DeviceSelector
      v-if="settings.showSettingsModal"
      name="Settings"
      class="absolute inset-0 bg-black/30 p-4 z-10"
    />

    <div class="mt-8">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { settingsStore } from "./stores/settings.js";
import HeaderTitle from "./components/HeaderComponents/HeaderTitle.vue";
import SettingsIcon from "./components/HeaderComponents/SettingsIcon.vue";
import DeviceSelector from "./components/HeaderComponents/AdjusterSettings/DeviceSelector.vue";

const settings = settingsStore();
</script>
