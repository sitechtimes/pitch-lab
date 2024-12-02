<template>
  <div
    class="device-selector fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    v-if="store.showModal"
  >
    <!-- Modal Content -->
    <div class="bg-gray-800 rounded-lg shadow-lg p-6 w-96 relative">
      <!-- Modal Header -->
      <h2 class="text-2xl text-white font-semibold mb-4">Select Devices</h2>

      <!-- Microphone Selection -->
      <div class="mb-6">
        <label for="microphone" class="block text-white text-sm mb-2">
          Select Microphone:
        </label>
        <select
          id="microphone"
          v-model="store.selectedMicrophone"
          @change="updateMicrophone"
          class="select select-bordered w-full"
        >
          <option
            v-for="device in store.microphones"
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ device.label || `Microphone ${device.deviceId}` }}
          </option>
        </select>
      </div>

      <!-- Speaker Selection -->
      <div class="mb-6">
        <label for="speaker" class="block text-white text-sm mb-2">
          Select Speaker:
        </label>
        <select
          id="speaker"
          v-model="store.selectedSpeaker"
          @change="updateSpeaker"
          class="select select-bordered w-full"
        >
          <option
            v-for="device in store.speakers"
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ device.label || `Speaker ${device.deviceId}` }}
          </option>
        </select>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end space-x-4">
        <button class="btn btn-outline btn-success" @click="saveSettings">
          Save
        </button>
        <button class="btn btn-outline btn-error" @click="closeModal">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { settingsStore } from "../stores/settings.js";
import { onMounted } from "vue";

const store = settingsStore();

// Fetch devices when the modal is shown
onMounted(() => {
  if (store.showModal) {
    store.getDevices();
  }
});

const closeModal = () => {
  store.toggleModal();
};

const updateMicrophone = () => {
  store.updateMicrophone(store.selectedMicrophone);
};

const updateSpeaker = () => {
  store.updateSpeaker(store.selectedSpeaker);
};

const saveSettings = () => {
  updateMicrophone();
  updateSpeaker();
  closeModal();
};
</script>

<style scoped></style>
