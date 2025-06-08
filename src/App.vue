<template>
  <div class="bg-entire-bg text-white min-h-screen">
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

const isElectron =
  typeof window !== "undefined" && window.electronEnv?.isElectron === true;
</script>
