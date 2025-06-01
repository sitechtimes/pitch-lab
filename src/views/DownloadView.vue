<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-entire-bg text-white p-8"
  >
    <h1 class="text-4xl font-bold mb-4">Download Pitch Lab</h1>
    <p class="text-lg text-center max-w-xl mb-8">
      Get the latest version of Pitch Lab: a free, all-in-one tuner, metronome,
      and recorder app for musicians.
    </p>

    <div
      class="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center"
    >
      <h2 class="text-2xl font-semibold mb-2">Latest Version: {{ version }}</h2>
      <p class="mb-4 text-sm text-gray-300">Built on {{ releaseDate }}</p>

      <a
        :href="downloadUrl"
        @click="trackDownload"
        download
        class="bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-lg text-xl font-semibold"
      >
        Download for Windows (.exe)
      </a>

      <p class="text-xs text-gray-400 mt-4">File size: ~632MB</p>
    </div>

    <p class="text-sm text-gray-400 mt-10">
      Having trouble?
      <a href="mailto:support@pitchlab.app" class="underline"
        >Contact support</a
      >
    </p>
  </div>
</template>

<script setup>
const version = "0.0.0";
const releaseDate = "April 11, 2025";
const downloadUrl = "/downloads/PitchLab Setup 0.0.0.exe";

function trackDownload() {
  if (typeof gtag !== "undefined") {
    gtag("event", "download", {
      event_category: "Download",
      event_label: `pitchlab.exe v${version}`,
    });
  }
}
</script>

<style scoped>
body {
  font-family: "Jaini Purva", sans-serif;
}
</style>
