<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50"
  >
    <button
      @click="initialize.initializeAudio"
      :disabled="initialize.cannotInitialize"
      class="text-center"
    >
      <div class="text-4xl mb-4">
        <div v-if="initialize.cannotInitialize">
          <div v-if="initialize.noMicrophones && initialize.noSpeakers">
            Cannot access microphone and speaker.
            <div class="p-3">
              Try a different browser or check microphone and speaker
              permissions.
            </div>
          </div>
          <div v-else-if="initialize.noMicrophones">
            Cannot access microphone
          </div>
          <div v-else-if="initialize.noSpeakers">Cannot access speaker</div>
          <div v-else>Cannot initialize audio</div>
        </div>
        <div v-else>Click To Start Tuning</div>
      </div>

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
    await devices.getDevices();

    if (!devices.selectedMicrophone) {
      initialize.noMicrophones = true;
      initialize.cannotInitialize = true;
      console.warn("Cannot access microphone");
    }
    if (!devices.selectedSpeaker) {
      initialize.noSpeakers = true;
      console.warn("Cannot access speaker");
    }

    if (!devices.selectedSpeaker.value) {
      console.log("Both microphone and speaker detected");
    }
    //some logs
    if (initialize.noMicrophones && initialize.noSpeakers) {
      console.log("No microphone and speaker detected");
    } else if (initialize.noMicrophones) {
      console.log("No microphone detected");
    } else if (initialize.noSpeakers) {
      console.log("No speaker detected");
    }
    devices.cleanupAudio();
  } catch (error) {
    console.error("Error getting devices:", error);

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
