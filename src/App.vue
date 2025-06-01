<template>
  <div class="w-screen bg-entire-bg text-white min-h-screen">
    <div
      v-if="initialize.isInitialized && isPortrait"
      class="fixed inset-0 px-10 flex items-center justify-center text-5xl py-5 text-white bg-gray-800"
    >
      Please rotate your device horizontally to use this app.
    </div>

    <div v-if="!isPortrait">
      <header class="flex items-center justify-between px-6 py-4 bg-entire-bg">
        <HeaderTitle />
        <div class="flex items-center gap-4 mr-8">
          <router-link
            v-if="!isElectron"
            to="/"
            class="text-3xl hover:underline"
          >
            Home
          </router-link>

          <router-link to="/app" class="text-3xl hover:underline">
            App
          </router-link>

          <router-link to="/tuner" class="text-3xl hover:underline">
            Tuner
          </router-link>

          <router-link
            v-if="!isElectron"
            to="/download"
            class="text-3xl hover:underline"
          >
            Download
          </router-link>
        </div>
      </header>

      <div class="mt-8">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderTitle from "./components/HeaderComponents/HeaderTitle.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { initializeStore } from "./stores/initialize";

const initialize = initializeStore();
const isPortrait = ref(window.innerHeight > window.innerWidth);
const isElectron =
  typeof window !== "undefined" && window.electronEnv?.isElectron === true;
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
