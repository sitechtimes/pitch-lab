<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50"
  >
    <button
      @click="initialize.initializeAudio"
      :disabled="initialize.cannotInitailize"
      class="text-center"
    >
      <p class="text-4xl mb-4">Click To Start Tuning</p>
      <div
        class="w-40 h-40 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl transition-transform transform hover:scale-105"
      >
        <img
          src="@/assets/GreenMicrophone.webp"
          alt="Pitch Lab Logo"
          class="w-24 h-24"
        />
        <!--add a v-if for cannotInitialize vs !cannotInitailize and put diff pics accordingly-->
      </div>
    </button>
  </div>
</template>

<script setup>
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

    // Check if microphones and speakers are available
    if (!devices.microphones || devices.microphones.length === 0) {
      initialize.cannotInitialize = true;
      console.warn("Cannot access microphone");
    }

    if (!devices.speakers || devices.speakers.length === 0) {
      initialize.cannotInitialize = true;
      console.warn("Cannot access speaker");
    }

    if (devices.microphones?.length > 0 && devices.speakers?.length > 0) {
      console.log("Both microphone and speaker detected");
    }
  } catch (error) {
    console.error("Error getting devices:", error);
    initialize.cannotInitialize = true;
    if (error.name === "NotAllowedError") {
      console.warn("Cannot access microphone or speaker: Permission denied");
    } else {
      console.warn("Cannot access microphone or speaker: Unknown error");
    }
  }
});
</script>
