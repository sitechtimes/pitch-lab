<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50"
  >
    <button
      @click="initialize.initializeAudio"
      :disabled="initialize.cannotInitialize"
      class="text-center"
    >
      <p class="text-4xl mb-4">
        <template v-if="initialize.cannotInitialize">
          <template v-if="initialize.noMicrophones && initialize.noSpeakers">
            Cannot access microphone and speaker
          </template>
          <template v-else-if="initialize.noMicrophones">
            Cannot access microphone
          </template>
          <template v-else-if="initialize.noSpeakers">
            Cannot access speaker
          </template>
          <template v-else> Cannot initialize audio </template>
        </template>
        <template v-else> Click To Start Tuning </template>
      </p>

      <div
        class="w-40 h-40 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl transition-transform transform hover:scale-105"
      >
        <img
          :src="initialize.cannotInitialize ? redMic : greenMic"
          alt="Microphone Icon"
          class="w-24 h-24"
        />
      </div>
    </button>
  </div>
</template>

<script setup>
import greenMic from "@/assets/GreenMicrophone.webp";
import redMic from "@/assets/RedMicrophone.webp";

import { watch, onMounted } from "vue";
import { initializeStore } from "@/stores/initialize";
import { devicesStore } from "@/stores/devices";
import { useRouter } from "vue-router";

const devices = devicesStore();
const initialize = initializeStore();
const router = useRouter();

watch(
  () => initialize.isInitialized,
  (newVal) => {
    if (newVal) {
      router.push("/");
    }
  },
);
onMounted(async () => {
  try {
    await devices.getDevices(); // Assuming this populates devices.microphones and devices.speakers
    console.log("Devices checked");

    // Check microphones
    if (!devices.microphones || devices.microphones.length === 0) {
      initialize.noMicrophones = true;
      console.warn("Cannot access microphone");
    }

    // Check speakers
    if (!devices.speakers || devices.speakers.length === 0) {
      initialize.noSpeakers = true;
      console.warn("Cannot access speaker");
    }

    // Set cannotInitialize based on either condition
    initialize.cannotInitialize =
      initialize.noMicrophones || initialize.noSpeakers;

    if (!initialize.cannotInitialize) {
      console.log("Both microphone and speaker detected");
    }
  } catch (error) {
    console.error("Error getting devices:", error);

    // Handle as a generic failure
    initialize.noMicrophones = true;
    initialize.noSpeakers = true;
    initialize.cannotInitialize = true;

    if (error.name === "NotAllowedError") {
      console.warn("Cannot access microphone or speaker: Permission denied");
    } else {
      console.warn("Cannot access microphone or speaker: Unknown error");
    }
  }
});
</script>
