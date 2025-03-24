<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50"
  >
    <button @click="initialize.initialize" class="text-center">
      <p class="text-4xl mb-4">Click To Start Tuning</p>
      <div
        class="w-40 h-40 bg-green rounded-full flex items-center justify-center mx-auto shadow-2xl transition-transform transform hover:scale-105"
      >
        <img src="@/assets/logo.webp" alt="Pitch Lab Logo" class="w-24 h-24" />
      </div>
    </button>
  </div>
</template>

<script setup>
import { watch } from "vue";
import { initializeStore } from "@/stores/initialize";
import { useRouter } from "vue-router";

const initialize = initializeStore();
const router = useRouter();

watch(
  () => initialize.isInitialized,
  (newVal) => {
    if (newVal) {
      router.push("/");
    }
  },
);
</script>
