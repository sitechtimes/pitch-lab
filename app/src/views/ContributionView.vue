<template>
  <h1></h1>
  <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="(item, index) in infoList"
      :key="index"
      class="group before:hover:scale-95 before:hover:w-80 before:hover:h-44 before:hover:rounded-b-2xl before:transition-all before:duration-500 before:content-[''] before:w-80 before:h-24 before:rounded-t-2xl before:bg-gradient-to-bl from-[#87CEEB] via-[#FFA500] to-[#FF4500] before:absolute before:top-0 w-80 h-72 relative bg-[#F8F8F8] flex flex-col items-center justify-center gap-2 text-center rounded-2xl overflow-hidden"
    >
      <img
        :src="item.image"
        alt="Card Image"
        class="w-28 h-28 mt-8 rounded-full border-4 border-[#F8F8F8] z-10 group-hover:scale-150 group-hover:-translate-x-24 group-hover:-translate-y-20 transition-all duration-500"
      />
      <div class="z-10 group-hover:-translate-y-10 transition-all duration-500">
        <span class="text-2xl font-semibold">{{ item.title }}</span>
        <p class="text-[#808080] mb-4">{{ item.description }}</p>
        <a
          class="bg-[#0000FF] px-4 py-1 text-[#F8F8F8] rounded-md z-10 hover:scale-125 transition-all duration-500 hover:bg-[#4682B4]"
          href=""
        >
          Follow
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Sample data for the cards
const infoList = ref([
  {
    title: "Card 1",
    description: "This is the description for card 1.",
    image: "https://via.placeholder.com/150",
    buttonText: "Learn More",
  },
  {
    title: "Card 2",
    description: "This is the description for card 2.",
    image: "https://via.placeholder.com/150",
    buttonText: "Learn More",
  },
  {
    title: "Card 3",
    description: "This is the description for card 3.",
    image: "https://via.placeholder.com/150",
    buttonText: "Learn More",
  },
]);
</script>

<style scoped>
/* Add any additional custom styles here */
</style>