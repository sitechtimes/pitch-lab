<template>
  <div class="min-h-screen bg-entire-bg text-white flex flex-col">
    <!-- Hero Section -->
    <!-- Hero Section -->
    <section
      class="flex-1 flex flex-col items-center justify-center text-center px-6"
    >
      <h2
        class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4"
      >
        Tune. Play. Perfect.
      </h2>
      <p class="text-lg text-gray-light max-w-xl mb-8">
        A precision tuner, powerful metronome, and drone generator — all in one
        beautifully simple tool for musicians.
      </p>
      <router-link
        to="/tuner"
        class="bg-purple hover:bg-purple/80 text-white text-lg font-semibold px-8 py-3 rounded-xl shadow-md transition"
      >
        Start Tuning
      </router-link>
      <router-link
        to="/download"
        class="mt-4 inline-block bg-white text-purple font-semibold text-lg px-8 py-3 rounded-xl shadow hover:bg-gray-light transition"
      >
        Download the App
      </router-link>
    </section>

    <!-- Features Section -->
    <section class="bg-controllers-bg py-12 px-6 text-center">
      <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <h3 class="text-xl font-bold mb-2 text-purple">🎵 Tuner</h3>
          <p class="text-gray-light text-sm leading-relaxed">
            Accurate pitch detection with visual cent guides for every
            instrument.
          </p>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-purple">🕒 Metronome</h3>
          <p class="text-gray-light text-sm leading-relaxed">
            Fully customizable tempo, time signatures, and sound packs.
          </p>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-purple">🎶 Drone Generator</h3>
          <p class="text-gray-light text-sm leading-relaxed">
            Play sustained notes with adjustable tone and volume for ear
            training.
          </p>
        </div>
      </div>
    </section>

    <!-- Credit Section -->
    <section class="bg-entire-bg text-center py-6 border-t border-gray-dark">
      <p class="text-sm text-gray-light">
        Built in Staten Island Technical High School's Advanced Computer Science
        class
      </p>
    </section>

    <!-- Footer -->
    <footer class="text-center py-6 text-gray text-ml">
      © 2025 Pitch Lab. All rights reserved.
    </footer>
  </div>
</template>
