<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50"
  >
    <div class="text-center">
      <p class="text-2xl mb-4">Start Tuning</p>
      <button
        @click="initialize.initializeAudio"
        class="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
        :disabled="isInitializing"
      >
        {{
          initialize.isInitialized ? "Initializing..." : "Grant Audio Access"
        }}
      </button>
      <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
// redirect back once initialized
import { ref } from "vue";
import { initializeStore } from "@/stores/initialize";

const initialize = initializeStore();
const errorMessage = ref("");
</script>
