<template>
  <div>
    <div>
      <label for="note-selection" class="text-gray-400 mr-4"
        >Recently Deleted</label
      >
      <select
        class="bg-gray-700 text-black rounded"
        v-model="audioStore.currentAudio"
      >
        History:
        <option
          v-for="file in persistedStore.recentlyDeleted"
          :key="file.id"
          :value="{ audio: file.audio, id: file.id }"
        >
          {{ file.name }} recorded on {{ file.date }}
        </option>
      </select>
    </div>
    <!-- buttons to clear recently deleted -->
    <div>
      <button
        @click="(audioStore.warning = true), (audioStore.deleteFunc = 'single')"
      >
        Delete
      </button>
      <button
        @click="(audioStore.warning = true), (audioStore.deleteFunc = 'all')"
      >
        Clear Recently Deleted
      </button>
    </div>

    <div v-if="saving">
      <button @click="saving = null">x</button>
      <p>Successfully Deleted!</p>
    </div>

    <div>
      <WarningModal @died="saving = 'hi'" v-if="audioStore.warning" />
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import WarningModal from "./WarningModal.vue";
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";

const persistedStore = persistedSettings();
const audioStore = audioFiles();
const saving = ref(null);

onUnmounted(() => {
  saving.value = null;
});
</script>
