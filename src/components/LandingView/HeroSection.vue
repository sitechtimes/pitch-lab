<template>
  <section
    class="flex-1 flex flex-col items-center justify-center text-center px-6"
  >
    <h2 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4">
      Tune. Play. Perfect.
    </h2>
    <p class="text-2xl text-gray-light max-w-xl m-8">
      A precision tuner, powerful metronome, and drone generator — all in one
      beautifully simple tool for musicians.
    </p>
    <router-link
      to="/tuner"
      class="bg-purple hover:bg-purple/80 text-white text-2xl font-semibold px-8 py-3 rounded-xl shadow-md transition"
    >
      Start Tuning
    </router-link>
    <router-link
      to="/download"
      class="m-4 inline-block bg-white text-purple font-semibold text-2xl px-8 py-3 rounded-xl shadow hover:bg-gray-light transition"
    >
      Download the App
    </router-link>
  </section>
</template>
