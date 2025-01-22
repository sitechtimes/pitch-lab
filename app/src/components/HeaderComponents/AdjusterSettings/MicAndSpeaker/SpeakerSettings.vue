<template>
  <div>
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
  </div>
</template>

<script setup>
import { settingsStore } from "../../../../stores/settings.js";
import { onMounted, computed } from "vue";

const store = settingsStore();

const outputVolume = computed({
  get: () => store.outputVolume,
  set: (value) => store.setOutputVolume(value),
});

// Fetch devices when the modal is shown
onMounted(() => {
  if (store.showModal) {
    store.getDevices();
  }
});
</script>
