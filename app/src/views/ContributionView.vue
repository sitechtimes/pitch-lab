<template>
  <div class="flex flex-row p-4 w-full  gap-6 items-between">
    <div
      v-for="(item, index) in infoList"
      :key="index"
      class="w-[30%] bg-slate-200 flex rounded-xl"
    >
      <div class="h-full w-[250px] p-7 text-white bg-[#261a6b] rounded-l-xl flex items-center justify-center">
        <img
          :src="item.image"
          alt="Card Image"
          class="rounded-full border-4 border-[#F8F8F8] w-[120px] h-[120px] object-cover"
        />
      </div>
      <div class="p-7 bg-white w-full rounded-r-xl relative flex flex-col justify-between">
        <div>
          <div class="flex justify-between">
            <h1 class="text-[#949494] text-[13px] tracking-[.5px]">
              {{ item.chapter || "CONTRIBUTOR" }}
            </h1>
            <div class="relative"></div>
          </div>
          <h1 class="text-[28px] pt-2 font-[500] tracking-wide">
            {{ item.name || item.title }}
          </h1>
          <p class="text-[#333] pt-2">{{ item.description }}</p>
        </div>
        <div class="flex items-center justify-end">
          <a
            v-if="item.link"
            :href="item.link"
            target="_blank"
            rel="noopener"
            class="h-10 w-[120px] bg-[#261a6be8] text-white rounded-3xl tracking-wide absolute right-10 bottom-7 cursor-pointer flex items-center justify-center hover:bg-[#4938b6e8] transition"
          >
            <svg stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" fill="none" viewBox="0 0 24 24" class="w-8 hover:scale-125 duration-200 hover:stroke-white">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span class="ml-2">GitHub</span>
          </a>
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
    name: "Card 1",
    title: "Developer",
    description: "This is the description for card 1.",
    image:
      "https://static.vecteezy.com/system/resources/previews/035/369/903/non_2x/of-a-cartoon-polar-bear-with-sunglasses-holding-a-beer-pint-drawing-of-a-north-pole-animal-drinking-a-beverage-vector.jpg",
  },
  {
    name: "Kevin Chen",
    title: "UI Designer(?) and Developer",
    description:
      "If a team ever make me a UI designer, that's how you know the team is cooked.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWrFP1f1iIMWelIqYda5VzJVV69GPugDiTWw&s",
    link: "https://github.com/kevinc2465",
  },
  {
    name: "Card 3",
    title: "Contributor",
    description: "This is the description for card 3.",
    image: "https://via.placeholder.com/150",
  },
]);
</script>