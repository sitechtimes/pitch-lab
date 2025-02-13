<template>
  <div>      <label for="note-selection" class="text-gray-400 mr-4"
        >Recently Deleted</label
      >
    <div>

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
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";
const persistedStore = persistedSettings();
const audioStore = audioFiles();
const saving = ref(null);

const autoDisappear = () => {
  setTimeout(() => {
    saving.value = null;
  }, 3000);
};

const restoreAudio = () => {
  let index = persistedStore.recentlyDeleted.findIndex(
    (file) => file.id === audioStore.currentAudio.id,
  );
  let date = new Date();
  if (index === Number || index === 0) {
    console.log("found it");
    let obj = persistedStore.recentlyDeleted[index];
    delete obj.deletedDate;
    persistedStore.pastAudio.push(obj);
    persistedStore.recentlyDeleted.splice(index, 1);
  } else {
    console.log(
      "what the hell? how did you manage that? please report this issue. whatever. deleting smth new",
    );
    checkName();
    persistedStore.pastAudio.push({
      id: persistedStore.assignedID,
      name: audioStore.fileName,
      audio: audioStore.currentAudio.audio,
      date: date.toLocaleDateString(),
      deletedDate: date.toLocaleDateString(),
    });
    persistedStore.assignedID++;
  }
  audioStore.currentAudio = null;
  audioStore.fileName = null;
  saving.value = "save";
  autoDisappear();
};

const checkName = () => {
  if (audioStore.fileName !== null) {
    return true;
  } else {
    audioStore.fileName = `Untitled Recording ${persistedStore.assignedID}`;
  }
};
</script>
