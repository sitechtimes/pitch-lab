<template>
  <div class="device-selector" v-if="store.showModal">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <h2>Select Devices</h2>
      <!-- Microphone selection -->
      <div>
        <label for="microphone">Select Microphone:</label>
        <select
          id="microphone"
          v-model="store.selectedMicrophone"
          @change="updateMicrophone"
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

      <!-- Speaker selection -->
      <div>
        <label for="speaker">Select Speaker:</label>
        <select
          id="speaker"
          v-model="store.selectedSpeaker"
          @change="updateSpeaker"
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

      <div>
        <button @click="saveSettings">Save</button>
        <button @click="closeModal">Cancel</button>
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
</script>

<style scoped>
.device-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.device-selector .modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.device-selector .modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  z-index: 10;
}

.device-selector .modal-content button {
  margin-top: 10px;
}
</style>
