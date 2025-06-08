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
        Download for Windows (.exe)
      </a>

      <p class="text-xs text-gray-400">File size: ~90MB</p>
    </div>

    <!-- Support -->
    <p class="text-base text-gray-400 mt-10">
      Having trouble?
      <a href="mailto:gaoevan37@gmail.com" class="underline hover:text-white">
        Contact support
      </a>
      or
      <a
        href="https://insigh.to/b/pitch-lab"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-white"
      >
        leave feedback
      </a>
      here.
    </p>

    <div
      class="bg-yellow-600/20 border-l-4 border-yellow-500 p-4 mt-6 rounded-lg text-yellow-100 text-xl max-w-lg"
    >
      <p class="font-semibold mb-2">Notice:</p>
      <p>
        If you get a SmartScreen or antivirus warning, it’s because the app is
        new and unsigned. One out of many antivirus engines (e.g. Bkav Pro) may
        flag the file as suspicious based on automated heuristics—this is a
        <strong>false positive</strong>, and no actual malware is present.
      </p>
      <p class="mt-2">
        You can independently verify the file’s safety by checking the
        VirusTotal scan here:
        <a
          href="https://www.virustotal.com/gui/file/&lt;your-hash&gt;/detection"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-white"
        >
          VirusTotal results </a
        >.
      </p>
    </div>
  </div>
</template>
<script setup>
const version = "0.0.1";
const releaseDate = "June 8, 2025";
const downloadUrl = "https://downloads.pitchlab.site/PitchLab-Setup.exe";

function trackDownload() {
  if (typeof gtag !== "undefined") {
    gtag("event", "download", {
      event_category: "Download",
      event_label: `pitchlab.exe v${version}`,
    });
  }
}
</script>
