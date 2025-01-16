<template>
  <div>
    <!-- Speaker Selection -->
    <div class="mb-6">
      <h1 for="speaker" class="block text-white text-3xl mb-2">
        Speaker:
      </h1>
      <button class="bg-[#36C4E4] text-black w-[20%] rounded-lg mr-4">Test Speaker</button>

      <select
        id="speaker"
        v-model="store.selectedSpeaker"
        @change="updateSpeaker"
        class="select select-bordered w-[60%] text-black"
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
