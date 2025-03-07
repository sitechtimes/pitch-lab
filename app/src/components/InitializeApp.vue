<template>
  <div>
    <div
      v-if="!isInitialized"
      class="fixed inset-0 flex items-center justify-center text-3xl text-white bg-gray-800 z-50"
    >
      Initializing app... Please wait.
    </div>
    <div v-else>
      <slot></slot>
      <!-- Render child components (e.g., your main app) -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from "vue";
import { useSettingsStore } from "../stores/settingsStore";

const store = useSettingsStore();
const isInitialized = computed(() => store.isInitialized);

onMounted(async () => {
  await store.initialize(); // Initialize the app
});

onUnmounted(() => {
  store.cleanup(); // Clean up resources when the app unmounts
});
</script>
