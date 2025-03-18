<template>
  <div>
    <div>
      <label for="note-selection" class="text-gray-400 mr-4"
        >Recently Deleted</label
      >
      <select
        class="bg-gray-700 text-black rounded"
        v-model="audioStore.currentRecording"
      >
        History:
        <option
          v-for="file in audioStore.recentlyDeleted"
          :key="file.id"
          :value="{ audio: file.audio, id: file.id }"
          @change="audioStore.fileName = file.name"
        >
          {{ file.name }} recorded on {{ file.date }}
        </option>
      </select>
    </div>
    <!-- buttons to clear recently deleted -->
    <div>
      <button @click="restoreAudio">Restore to History</button>
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
      <p v-if="saving === 'delete'">Successfully Deleted!</p>
      <p v-if="saving === 'save'">Successfully Saved!</p>
    </div>

    <div>
      <WarningModal
        @died="(saving = 'delete'), autoDisappear"
        v-if="audioStore.warning"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import WarningModal from "./WarningModal.vue";
import { audioFilesStore } from "@/stores/audioFiles";
const audioStore = audioFilesStore();
const saving = ref(null);

const autoDisappear = () => {
  setTimeout(() => {
    saving.value = null;
  }, 3000);
};

const restoreAudio = () => {
  let index = audioStore.recentlyDeleted.findIndex(
    (file) => file.id === audioStore.currentRecording.id,
  );
  let date = new Date();
  if (index === Number || index === 0) {
    console.log("found it");
    let obj = audioStore.recentlyDeleted[index];
    delete obj.deletedDate;
    audioStore.audioHistory.push(obj);
    audioStore.recentlyDeleted.splice(index, 1);
  } else {
    console.log(
      "what the hell? how did you manage that? please report this issue. whatever. deleting smth new",
    );
    checkName();
    audioStore.audioHistory.push({
      id: audioStore.assignedID,
      name: audioStore.fileName,
      audio: audioStore.currentRecording.audio,
      date: date.toLocaleDateString(),
      deletedDate: date.toLocaleDateString(),
    });
    audioStore.assignedID++;
  }
  audioStore.currentRecording = null;
  audioStore.fileName = null;
  saving.value = "save";
  autoDisappear();
};

const checkName = () => {
  if (audioStore.fileName !== null) {
    return true;
  } else {
    audioStore.fileName = `Untitled Recording ${audioStore.assignedID}`;
  }
};
</script>
