<template>
  <div class="w-screen bg-entire-bg text-white min-h-screen">
    <!-- Orientation Warning (only shown if initialized) -->
    <div
      v-if="initialize.isInitialized && isPortrait"
      class="fixed inset-0 px-10 flex items-center justify-center text-5xl py-5 text-white bg-gray-800"
    >
      Please rotate your device horizontally to use this app.
    </div>

    <!-- Main App Content (only shown if initialized and in landscape) -->
    <div v-if="!isPortrait">
      <header class="flex items-center justify-between px-6 py-4 bg-entire-bg">
        <HeaderTitle />
        <div class="flex items-center gap-4">
          <router-link to="/" class="text-3xl hover:underline"
            >Home</router-link
          >
          <router-link to="/tuner" class="text-3xl hover:underline"
            >Tuner</router-link
          >
          <!-- <SettingsIcon /> -->
        </div>
      </header>

      <DeviceSelector
        v-if="settingsUI.showSettingsModal"
        name="Settings"
        class="absolute inset-0 bg-black/30 p-4 z-10"
      />

      <div class="mt-8">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderTitle from "./components/HeaderComponents/HeaderTitle.vue";
// import SettingsIcon from "./components/HeaderComponents/SettingsIcon.vue";
import DeviceSelector from "./components/HeaderComponents/AdjusterSettings/DeviceSelector.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { initializeStore } from "./stores/initialize";
import { settingsUIStore } from "./stores/settingsUI";

const settingsUI = settingsUIStore();
const initialize = initializeStore();
const isPortrait = ref(window.innerHeight > window.innerWidth);
const checkOrientation = () => {
  isPortrait.value = window.innerHeight > window.innerWidth;
};
onMounted(() => {
  window.addEventListener("resize", checkOrientation);
  checkOrientation();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkOrientation);
});
</script>
