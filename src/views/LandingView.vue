<template>
  <div
    class="flex flex-col items-center justify-center mt-12 bg-entire-bg text-white p-8"
  >
    <HeroSection />

    <!-- Features Section -->
    <section class="py-16 px-6 text-center">
      <h2 class="text-3xl sm:text-4xl font-bold text-white mb-12">Features</h2>
      <div
        class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
      >
        <FeatureCard
          v-for="(feature, index) in features"
          :key="index"
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
        />
      </div>
    </section>

    <CreditsSection />
  </div>
</template>

<script setup>
import FeatureCard from "@/components/LandingView/FeaturesCard.vue";
import HeroSection from "@/components/LandingView/HeroSection.vue";
import CreditsSection from "@/components/LandingView/CreditsSection.vue";
const features = [
  {
    icon: "🎵",
    title: "Precision Tuner",
    description:
      "Detect pitch in real-time with cent-level accuracy. Designed for string, brass, voice, and more.",
  },
  {
    icon: "🕒",
    title: "Custom Metronome",
    description:
      "Control tempo, subdivisions, time signatures, and sound packs to match your unique rhythm.",
  },
  {
    icon: "🎶",
    title: "Drone Generator",
    description:
      "Sustain rich tones at any pitch to support ear training and pitch stability exercises.",
  },
];
</script>
