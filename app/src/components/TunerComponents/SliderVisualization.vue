<template>
  <div class="bg-gray-900 p-4 rounded-lg mt-6">
    <div class="flex justify-between text-white text-xs">
      <span>-50</span>
      <span>-40</span>
      <span>-30</span>
      <span>-20</span>
      <span>-10</span>
      <span>0</span>
      <span>10</span>
      <span>20</span>
      <span>30</span>
      <span>40</span>
      <span>50</span>
    </div>
    <div class="h-32 bg-gray-800 mt-4 relative">
      <!-- Bars -->
      <div class="absolute inset-0 flex items-end justify-around">
        <div class="w-2 h-12 bg-green-500"></div>
        <div class="w-2 h-8 bg-green-400"></div>
        <div class="w-2 h-20 bg-green-300"></div>
        <!-- Repeat as needed -->
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped></style>
