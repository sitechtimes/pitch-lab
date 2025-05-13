<template>
  <h1></h1>
  <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="(item, index) in infoList"
      :key="index"
      class="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center"
    >
      <img
        :src="item.image"
        alt="Card Image"
        class="w-24 h-24 object-cover rounded-full mb-4"
      />
      <h2 class="text-lg font-semibold mb-2">{{ item.title }}</h2>
      <p class="text-gray-600 mb-4">{{ item.description }}</p>
      <button
        class="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition"
        @click="item.action()"
      >
        {{ item.buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

//Sample data for the cards
const infoList = ref([
  {
    title: "Card 1",
    description: "This is the description for card 1.",
    image: "https://via.placeholder.com/150",
    buttonText: "Learn More",
    action: () => alert("Card 1 clicked!"),
  },
  {
    title: "Card 2",
    description: "This is the description for card 2.",
    image: "https://via.placeholder.com/150",
    buttonText: "Learn More",
    action: () => alert("Card 2 clicked!"),
  },
  {
    title: "Card 3",
    description: "This is the description for card 3.",
    image: "https://via.placeholder.com/150",
    buttonText: "Learn More",
    action: () => alert("Card 3 clicked!"),
  },
]);
</script>

<style scoped>
/* Add any additional custom styles here */
</style>