<template>
  <div class="flex justify-center">
    <div class="flex flex-col justify-between items-center w-[85%]">
      <div>
        <select
          class="bg-gray-700 text-black rounded w-[90%]"
          v-model="audioStore.currentAudio"
        >
          <option disabled value="">History:</option>
          <option
            v-for="file in persistedStore.pastAudio"
            :key="file.id"
            :value="{ audio: file.audio, id: file.id }"
            @change="audioStore.fileName = file.name"
          >
            {{ file.name }} recorded on {{ file.date }}
          </option>
        </select>
      </div>
      <div v-if="audioStore.currentAudio">
        <input
          type="text"
          class="text-black w-1/2 mt-3"
          v-model="audioStore.fileName"
          :disabled="!isEditing"
        />
        <button @click="handleSave">
          {{ isEditing ? "Save File" : "Rename File" }}
        </button>
        <button @click="deleteAudio">Delete</button>
      </div>
    </div>
    <div v-if="saving" class="fixed inset-0 flex justify-center mt-4 z-50">
      <div
        class="h-[5%] w-[60%] text-lg flex items-center justify-center bg-opacity-60"
        :class="{
          'bg-red': saving === 'delete',
          'bg-green': saving === 'save',
        }"
      >
        <p v-if="saving === 'delete'">Successfully Deleted!</p>
        <p v-if="saving === 'save'">Successfully Saved!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { audioFilesStore } from "@/stores/audioFiles";
import { ref } from "vue";
const audioStore = audioFilesStore();

const saving = ref(null);
const isEditing = ref(false);

const handleSave = () => {
  if (isEditing.value) {
    saveAudio();
  }
  isEditing.value = !isEditing.value;
};

const checkName = () => {
  if (audioStore.fileName !== null) {
    return true;
  } else {
    audioStore.fileName = `Untitled Recording ${audioStore.assignedID}`;
  }
};

const saveAudio = () => {
  let index = audioStore.audioHistory.findIndex(
    (file) => file.id === audioStore.currentRecording.id,
  );
  if (index === Number || index === 0) {
    console.log("found dupe maybe");
    if (checkName() === true) {
      audioStore.pastAudio[index].name = audioStore.fileName.trim();
    }
  } else {
    console.log(
      "what the hell??? how'd you manage that? please report this. whatever, creating smth new",
    );
    let date = new Date();
    checkName();
    audioStore.audioHistory.push({
      id: audioStore.assignedID,
      name: audioStore.fileName.trim(),
      audio: audioStore.currentRecording.audio,
      date: date.toLocaleDateString(),
    });
    audioStore.assignedID++;
  }
  audioStore.fileName = null;
  saving.value = "save";
  autoDisappear();
};

const deleteAudio = () => {
  let index = audioStore.audioHistory.findIndex(
    (file) => file.id === audioStore.currentRecording.id,
  );
  let date = new Date();
  if (index === Number || index === 0) {
    console.log("found it");
    let obj = Object.defineProperty(
      audioStore.audioHistory[index],
      "dateDeleted",
      {
        value: date.toLocaleDateString(),
        writable: true,
        enumerable: true,
        configurable: true,
      },
    );
    audioStore.recentlyDeleted.push(obj);
    audioStore.audioHistory.splice(index, 1);
  } else {
    console.log(
      "what the hell? how did you manage that? please report this issue. whatever. deleting smth new",
    );
    checkName();
    audioStore.recentlyDeleted.push({
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
  saving.value = "delete";
  autoDisappear();
};

const autoDisappear = () => {
  setTimeout(() => {
    saving.value = null;
  }, 2000);
};
</script>
