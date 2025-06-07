<template>
  <div
    class="flex flex-col items-center justify-center mt-12 bg-entire-bg text-white p-8"
  >
    <!-- Header -->
    <section
      class="flex-1 flex flex-col items-center justify-center text-center px-6"
    >
      <h2
        class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4"
      >
        Download Pitch Lab
      </h2>
      <p class="text-lg text-center max-w-xl mb-8 text-gray-light">
        Get the latest version of Pitch Lab — a free, all-in-one tuner,
        metronome, and recorder app for musicians.
      </p>
    </section>
    <!-- Download Card -->
    <div
      class="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center max-w-md w-full"
    >
      <h2 class="text-2xl font-semibold mb-1">Latest Version: {{ version }}</h2>
      <p class="text-sm text-gray-300 mb-4">Released on {{ releaseDate }}</p>

      <a
        :href="downloadUrl"
        @click="trackDownload"
        download
        class="block bg-purple hover:bg-purple/80 transition text-white text-lg font-medium px-6 py-3 rounded-lg shadow mb-2"
      >
        Download for Windows (.zip)
      </a>

      <p class="text-xs text-gray-400">File size: ~90MB</p>
    </div>

    <!-- Support -->
    <p class="text-sm text-gray-400 mt-10">
      Having trouble?
      <a href="mailto:gaoevan37@gmail.com" class="underline hover:text-white">
        Contact support
      </a>
    </p>
  </div>
</template>
<script setup>
const version = "0.0.0";
const releaseDate = "June 1, 2025";
const downloadUrl = "https://downloads.pitchlab.site/PitchLab-Setup.zip";

function trackDownload() {
  if (typeof gtag !== "undefined") {
    gtag("event", "download", {
      event_category: "Download",
      event_label: `pitchlab.exe v${version}`,
    });
  }
}
</script>
