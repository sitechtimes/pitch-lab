<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50"
  >
    <div
      class="bg-[#261b32] rounded-lg border-2 border-black shadow-lg p-6 w-[40%] relative"
    >
      <div class="w-full flex flex-row justify-between mb-[1%]">
        <h1
          class="text-3xl font-semibold mb-2"
          v-if="!audioStore.showDeletedModal"
        >
          History
        </h1>
        <h1
          class="text-3xl font-semibold mb-2"
          v-if="audioStore.showDeletedModal"
        >
          Recently Deleted
        </h1>
        <button
          v-if="!audioStore.showDeletedModal"
          @click="audioStore.showDeletedModal = true"
          class="text-xl bg-purple rounded-full p-2 mb-2"
        >
          Go to recently deleted
        </button>
        <button
          v-if="audioStore.showDeletedModal"
          @click="audioStore.showDeletedModal = false"
          class="text-xl bg-purple rounded-full p-1 mb-2"
        >
          Go back to history
        </button>
      </div>
      <div class="w-full flex justify-center">
        <div class="flex items-center h-full">
          <AudioHistory v-if="!audioStore.showDeletedModal" />
          <RecentlyDeleted v-if="audioStore.showDeletedModal" />
        </div>
        <div v-if="audioStore.currentAudio">
          <AudioPlayback />
        </div>
      </div>
      <button
        @click="
          (audioStore.showHistoryModal = false),
            (audioStore.currentAudio = null),
            (audioStore.showDeletedModal = false)
        "
        class="text-xl"
      >
        Exit History
      </button>
    </div>
  </div>
</template>

<script setup>
import AudioPlayback from "./AudioPlayback.vue";
import AudioHistory from "./AudioHistory.vue";
import RecentlyDeleted from "./RecentlyDeleted.vue";
import { audioFilesStore } from "@/stores/audioFiles";
const audioStore = audioFilesStore();
</script>

<style scoped></style>
