<template>
  <div
    class="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white flex flex-col"
  >
    <!-- Header -->
    <header
      class="w-full p-6 flex items-center justify-between max-w-7xl mx-auto"
    >
      <h1 class="text-3xl font-bold tracking-tight">PitchLab</h1>
      <router-link
        to="/tuner"
        class="bg-white text-purple-700 font-semibold px-5 py-2 rounded-lg shadow hover:bg-gray-100 transition"
      >
        Launch App
      </router-link>
    </header>

    <!-- Hero Section -->
    <section
      class="flex-1 flex flex-col items-center justify-center text-center px-6"
    >
      <h2 class="text-5xl font-extrabold leading-tight max-w-2xl mb-6">
        Tune. Play. Perfect.
      </h2>
      <p class="text-lg text-purple-200 max-w-xl mb-8">
        A precision tuner, powerful metronome, and drone generator — all in one
        beautifully simple tool for musicians.
      </p>
      <router-link
        to="/tuner"
        class="bg-purple-600 hover:bg-purple-500 text-white text-xl font-medium px-8 py-4 rounded-xl shadow-md transition"
      >
        Start Tuning</router-link
      >
    </section>

    <!-- Features Section -->
    <section class="bg-purple-800 py-12 px-6 text-center">
      <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-2">🎵 Tuner</h3>
          <p class="text-purple-200 text-sm">
            Accurate pitch detection with visual cent guides for every
            instrument.
          </p>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-2">🕒 Metronome</h3>
          <p class="text-purple-200 text-sm">
            Fully customizable tempo, time signatures, and sound packs.
          </p>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-2">🎶 Drone Generator</h3>
          <p class="text-purple-200 text-sm">
            Play sustained notes with adjustable tone and volume for ear
            training.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="text-center py-6 text-purple-300 text-sm">
      © 2025 PitchLab. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
// No logic needed for now
</script>

<style scoped>
body {
  font-family: "Inter", sans-serif;
}
</style>
