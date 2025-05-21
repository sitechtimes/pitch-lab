<template>
  <div class="flex justify-center">
    <div class="w-[90%] items-center flex flex-row justify-between gap-6">
      <div
        v-for="(item, index) in infoList"
        :key="index"
        class="w-[25%] shadow-xl group before:w-full before:h-24 before:rounded-t-2xl before:bg-gradient-to-bl from-[#87CEEB] via-[#FFA500] to-[#FF4500] before:absolute before:top-0 relative bg-[#F4F4F4] flex flex-col items-center justify-center gap-2 text-center rounded-2xl overflow-hidden"
      >
         <div class="absolute top-8 ">
          <img
            :src="item.image"
            alt="Card Image"
            class="w-28 h-28 rounded-full border-4 border-[#F8F8F8]"
          />
        </div>
      <div class="z-10 text-[#003049] pt-[10rem]">
          <span class="text-2xl font-semibold">{{ item.title }}</span>
          <p class="text-[#808080] mb-4">{{ item.description }}</p>
          <button
            class="px-[8%] py-[3%] rounded-md z-10 flex items-center justify-center mx-auto"
          >
              <a
            v-if="item.link"
            :href="item.link"
            target="_blank"
            rel="noopener"
            class="px-[8%] py-[3%] rounded-md z-10 flex items-center justify-center mx-auto bg-transparent"
          >
            <svg
              stroke-linejoin="round"
              stroke-linecap="round"
              stroke-width="2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
              class="w-8 stroke-black hover:stroke-white"
            >
              <path
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
              ></path>
            </svg>
          </a>
          </button>
        </div>
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
    image:
      "https://static.vecteezy.com/system/resources/previews/035/369/903/non_2x/of-a-cartoon-polar-bear-with-sunglasses-holding-a-beer-pint-drawing-of-a-north-pole-animal-drinking-a-beverage-vector.jpg",
  },
  {
    title: "Kevin Chen",
    description: "Debugger, coder,cdsjdjdhsbfshdbfjshfbjshdbfjshdbfsjhdfbhjbdfsj and designer.",
    image:
      "https://static.vecteezy.com/system/resources/previews/035/369/903/non_2x/of-a-cartoon-polar-bear-with-sunglasses-holding-a-beer-pint-drawing-of-a-north-pole-animal-drinking-a-beverage-vector.jpg",
      link: "https://github.com/kevinc2465"
  },
  {
    title: "Card 3",
    description: "This is the description for card 3.",
    image: "https://via.placeholder.com/150",
  },
]);
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
