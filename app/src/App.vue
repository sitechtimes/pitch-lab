<script setup>
import AudioRecorder from "./components/AudioRecorder.vue";
import TunerSection from "./components/TunerSection.vue";
</script>

<template>
  <div>
    <header>
      <div class="wrapper">
        <nav></nav>
      </div>
    </header>
    <AudioRecorder />
    <TunerSection />
    <RouterView />
    <button @click="settings.showModal = !settings.showModal">HIIIIII</button>
    <DeviceSelector v-if="settings.showModal" />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
