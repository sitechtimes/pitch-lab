<template>
  <section
    class="flex-1 flex flex-col items-center justify-center text-center px-6 py-16"
  >
    <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
      Pitch Lab – Free Tuner App for Musicians
    </h1>
    <p class="text-2xl text-gray-light max-w-2xl mb-10 leading-relaxed">
      Tune your instrument with precision, keep time with a customizable
      metronome, and strengthen your pitch with drone tones — all in one simple,
      powerful tool designed for musicians of all levels.
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
