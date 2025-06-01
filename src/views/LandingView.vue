<template>
  <div
    class="flex flex-col items-center justify-center mt-12 bg-entire-bg text-white p-8"
  >
    <section
      class="flex-1 flex flex-col items-center justify-center text-center px-6"
    >
      <h2
        class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4"
      >
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

    <!-- Features Section -->
    <section class="mt-5 bg-controllers-bg py-16 px-6 w-full">
      <h2 class="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
        Powerful Features for Every Musician
      </h2>
      <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        <!-- Tuner -->
        <div
          class="bg-white/5 rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-200"
        >
          <div class="text-4xl mb-3">🎵</div>
          <h3 class="text-xl font-semibold text-purple mb-2">
            Precision Tuner
          </h3>
          <p class="text-gray-light text-sm leading-relaxed">
            Detect pitch in real-time with cent-level accuracy. Designed for
            string, brass, voice, and more.
          </p>
        </div>
        <!-- Metronome -->
        <div
          class="bg-white/5 rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-200"
        >
          <div class="text-4xl mb-3">🕒</div>
          <h3 class="text-xl font-semibold text-purple mb-2">
            Custom Metronome
          </h3>
          <p class="text-gray-light text-sm leading-relaxed">
            Control tempo, subdivisions, time signatures, and sound packs to
            match your unique rhythm.
          </p>
        </div>
        <!-- Drone Generator -->
        <div
          class="bg-white/5 rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-200"
        >
          <div class="text-4xl mb-3">🎶</div>
          <h3 class="text-xl font-semibold text-purple mb-2">
            Drone Generator
          </h3>
          <p class="text-gray-light text-sm leading-relaxed">
            Sustain rich tones at any pitch to support ear training and pitch
            stability exercises.
          </p>
        </div>
      </div>
    </section>

    <!-- Credit + Explore + Footer -->
    <section
      class="bg-entire-bg text-center py-10 border-t border-gray-dark space-y-6"
    >
      <!-- Credit -->
      <p class="text-base sm:text-lg text-gray-light">
        Built by students in Staten Island Technical High School’s<br
          class="hidden sm:inline"
        />
        Advanced Computer Science Class
      </p>

      <!-- Subtle Explore Links -->
      <div
        class="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm sm:text-base"
      >
        <a
          href="https://www.sitechtimes.com/"
          target="_blank"
          rel="noopener"
          class="text-purple hover:text-purple/80 underline underline-offset-2 transition"
        >
          SI Tech Times
        </a>
        <a
          href="https://mikewhalen.tech/projects"
          target="_blank"
          rel="noopener"
          class="text-purple hover:text-purple/80 underline underline-offset-2 transition"
        >
          More Student Projects
        </a>
      </div>

      <!-- Footer -->
      <footer class="text-ml sm:text-base text-gray-light mt-2">
        © 2025 <span class="text-white font-semibold">Pitch Lab</span>. All
        rights reserved.
      </footer>
    </section>
  </div>
</template>
