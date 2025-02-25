<template>
  <div>
    <!-- Microphone Selection -->
    <div class="mb-6">
      <label for="microphone" class="block text-white text-sm mb-2">
        Select Microphone:
      </label>
      <select
        id="microphone"
        v-model="persistedStore.selectedMicrophone"
        class="select select-bordered w-full bg-tuner-bg text-white border-purple focus:ring-purple"
        :disabled="isLoading"
        @change="handleDeviceChange"
      >
        <option v-if="isLoading" value="" disabled>
          Loading microphones...
        </option>
        <option
          v-for="device in store.microphones"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label || `Microphone ${device.deviceId.slice(0, 5)}` }}
        </option>
        <option v-if="store.microphones.length === 0" value="" disabled>
          No microphones found
        </option>
      </select>
    </div>

    <div>
      <button
        v-if="!isTesting"
        @click="settingsStore.testMic(), (isTesting = true)"
      >
        test mic
      </button>
      <button
        v-if="isTesting"
        @click="settingsStore.testMic(), (isTesting = false)"
      >
        Stop testing
      </button>
    </div>

    <!-- Volume Control -->
    <div class="audio-controls mb-6">
      <label for="input-volume" class="block text-white text-sm mb-2">
        Input Volume: {{ store.inputVolume.toFixed(2) }}
      </label>
      <input
        id="input-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model.number="store.inputVolume"
        class="w-full range range-purple"
        @input="store.setInputVolume(store.inputVolume)"
      />
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="text-red-500 text-sm">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { settingsStore } from "../../../../stores/settings";
import { persistedSettings } from "../../../../stores/persistedStore";

const store = settingsStore();
const persistedStore = persistedSettings();
const isLoading = ref(true);
const errorMessage = ref("");
const isTesting = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    await store.initializeAudio();
    await store.getDevices();
    if (!persistedStore.selectedMicrophone && store.microphones.length > 0) {
      persistedStore.selectedMicrophone = store.microphones[0].deviceId;
    }
  } catch (error) {
    errorMessage.value = "Please allow microphone access to continue";
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const handleDeviceChange = async () => {
  try {
    await store.updateInputDevice(persistedStore.selectedMicrophone);
    console.log(`Microphone updated to: ${persistedStore.selectedMicrophone}`);
  } catch (error) {
    errorMessage.value = `Failed to switch microphone: ${error.message}`;
    console.error(error);
  }
};
</script>
