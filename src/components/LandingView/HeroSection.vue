<template>
  <section
    class="flex-1 flex flex-col items-center justify-center text-center px-6 py-16"
  >
    <h2 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
      Tune. Play. Perfect.
    </h2>
    <p class="text-2xl text-gray-light max-w-2xl mb-10 leading-relaxed">
      A precision tuner, powerful metronome, and drone generator — all in one
      beautifully simple tool for musicians.
    </p>

    <!-- Top two buttons side-by-side -->
    <div class="flex flex-wrap justify-center gap-6 mb-6">
      <router-link
        to="/app"
        class="bg-purple hover:bg-purple/80 text-white text-xl sm:text-2xl font-semibold px-6 sm:px-8 py-3 rounded-xl shadow-md transition"
      >
        Open App
      </router-link>
      <router-link
        to="/tuner"
        class="bg-purple hover:bg-purple/80 text-white text-xl sm:text-2xl font-semibold px-6 sm:px-8 py-3 rounded-xl shadow-md transition"
      >
        Start Tuning
      </router-link>
    </div>

    <!-- Bottom download button -->
    <router-link
      to="/download"
      class="inline-block bg-white text-purple font-semibold text-xl sm:text-2xl px-6 sm:px-8 py-3 rounded-xl shadow hover:bg-gray-light transition"
    >
      Download the App
    </router-link>
  </section>
</template>
