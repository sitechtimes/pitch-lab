<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50"
  >
    <div
      class="bg-[#261b32] rounded-lg border-2 border-black shadow-lg p-6 w-[40%] relative"
    >
      <h1 class="text-3xl font-semibold mb-2">History</h1>
      <div class="flex flex-row justify-center">
        <div>
          <Button
            v-if="!audioStore.showDeletedModal"
            @click="audioStore.showDeletedModal = true"
            class="text-xl bg-purple rounded-full p-1 mb-2"
          >
            Go to recently deleted
          </Button>
          <Button
            v-if="audioStore.showDeletedModal"
            @click="audioStore.showDeletedModal = false"
            class="text-xl bg-purple rounded-full p-1 mb-2"
          >
            Go back to history
          </Button>
          <PastAudio v-if="!audioStore.showDeletedModal" />
          <RecentlyDeleted v-if="audioStore.showDeletedModal" />
        </div>
        <div v-if="audioStore.currentRecording">
          <AudioPlayback />
        </div>
      </div>
      <button
        @click="
          (audioStore.showHistoryModal = false),
            (audioStore.currentRecording = null)
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
import PastAudio from "./PastAudio.vue";
import RecentlyDeleted from "./RecentlyDeleted.vue";
import { audioFilesStore } from "@/stores/audioFiles";
const audioStore = audioFilesStore();
</script>
