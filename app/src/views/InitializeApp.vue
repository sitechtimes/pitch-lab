<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50"
  >
    <div class="text-center">
      <p class="text-4xl mb-4">Click To Start Tuning</p>
      <img
        src="@/assets/logo.webp"
        alt="Pitch Lab Logo"
        class="cursor-pointer w-32 h-32 mx-auto"
        @click="initialize.initializeAudio"
      />
    </div>
  </div>
</template>

<script setup>
import { watch } from "vue";
import { initializeStore } from "@/stores/initialize";
import { useRouter } from "vue-router";

const initialize = initializeStore();
const router = useRouter();

// Watch for initialization completion and redirect
watch(
  () => initialize.isInitialized,
  (newVal) => {
    if (newVal) {
      router.push("/"); // Adjust the route as needed
    }
  },
);
</script>
