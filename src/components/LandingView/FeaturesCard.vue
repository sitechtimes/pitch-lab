<template>
  <div
    class="bg-white/5 rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-200 text-left flex flex-col h-full"
  >
    <div class="text-4xl mb-4">{{ icon }}</div>
    <h3 class="text-3xl font-semibold text-purple mb-2">{{ title }}</h3>
    <p class="text-gray-light text-xl leading-relaxed flex-grow">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  description: String,
});
</script>
