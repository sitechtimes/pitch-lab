<template>
  <div>
        <label for="note-selection" class="text-gray-400 mr-4">Recently Deleted</label>
        <div>
          <select
            class="bg-gray-700 text-black rounded"
            v-model="audioStore.currentAudio"
          >
            <option v-if="persistedStore.recentlyDeleted.length === 0" disabled>
              No recently deleted recordings
            </option>
            <option
              v-for="file in persistedStore.recentlyDeleted"
              :key="file.id"
              :value="{ audio: file.audio, id: file.id }"
              @change="audioStore.fileName = file.name"
            >
              {{ file.name }} recorded on {{ file.date }}
            </option>
          </select>
        </div>
        <!-- buttons to clear recently deleted -->
        <div class="flex flex-row justify-between w-[80%]">
          <button v-if="audioStore.currentAudio" @click="restoreAudio" :disabled="persistedStore.recentlyDeleted.length === 0">Restore to History</button>
          <button
          
            @click="(audioStore.warning = true), (audioStore.deleteFunc = 'single')"
            :disabled="persistedStore.recentlyDeleted.length === 0"
          >
            Delete
          </button>
          <button
            @click="(audioStore.warning = true), (showAlert = true), (audioStore.deleteFunc = 'all')"
            :disabled="persistedStore.recentlyDeleted.length === 0"
          >
            Clear Recently Deleted
          </button>
        </div>
    <!-- <div v-if="showAlert" class=" w-full"> -->
      <div class="flex items-center justify-center">
          <div v-if="saving">
            <button @click="saving = null">Exit</button>
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
      </div>
    <!-- </div> -->
</template>

<script setup>
import { ref } from "vue";
import WarningModal from "./WarningModal.vue";
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";
const persistedStore = persistedSettings();
const audioStore = audioFiles();
const saving = ref(null);
const showAlert = ref(false);

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

<style scoped>

</style>
