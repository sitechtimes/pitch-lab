<template>
  <button
    @click="redirectToHome"
    class="flex items-center space-x-4 focus:outline-none text-6xl tracking-wide m-6"
  >
    <img src="@/assets/logo.webp" alt="Pitch Lab Logo" class="sm:w-12 md:w-16 h-auto" />
    <span class="text-white sm:text-5xl md:text-7xl tracking-wide">Pitch Lab</span>
  </button>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const redirectToHome = () => {
  router.push("/");
};
</script>
