<template>
  <div>      <div class="flex flex-row">

    <div>    

      <select
        class="bg-gray-700 text-black rounded w-[90%]"
        v-model="audioStore.currentAudio"
      >
        History:
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
      <button @click="handleSave">{{ isEditing ? 'Save File' : 'Rename File' }}</button>
      <button @click="deleteAudio">Delete</button>
    </div>
    <div v-else class="mt-3 text-center text-lg text-gray-500">
      No recording selected. Please select a recording to see options.
    </div>
</div>
    <div v-if="saving" class="fixed inset-0 flex justify-center mt-4 z-50">
      <div class="h-[5%] w-[60%] text-lg flex items-center justify-center bg-opacity-60"
      :class="{'bg-red': saving === 'delete', 'bg-green': saving === 'save'}">
        <p v-if="saving === 'delete'">Successfully Deleted!</p>
        <p v-if="saving === 'save'">Successfully Saved!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";
import { ref } from "vue";
const audioStore = audioFiles();
const persistedStore = persistedSettings();
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
    audioStore.fileName = `Untitled Recording ${persistedStore.assignedID}`;
  }
};

const saveAudio = () => {
  let index = persistedStore.pastAudio.findIndex(
    (file) => file.id === audioStore.currentAudio.id,
  );
  if (index === Number || index === 0) {
    console.log("found dupe maybe");
    if (checkName() === true) {
      persistedStore.pastAudio[index].name = audioStore.fileName.trim();
    }
  } else {
    console.log(
      "what the hell??? how'd you manage that? please report this. whatever, creating smth new",
    );
    let date = new Date();
    checkName();
    persistedStore.pastAudio.push({
      id: persistedStore.assignedID,
      name: audioStore.fileName.trim(),
      audio: audioStore.currentAudio.audio,
      date: date.toLocaleDateString(),
    });
    persistedStore.assignedID++;
  }
  audioStore.fileName = null;
  saving.value = "save";
  autoDisappear();
};

const deleteAudio = () => {
  let index = persistedStore.pastAudio.findIndex(
    (file) => file.id === audioStore.currentAudio.id,
  );
  let date = new Date();
  if (index === Number || index === 0) {
    console.log("found it");
    let obj = Object.defineProperty(
      persistedStore.pastAudio[index],
      "dateDeleted",
      {
        value: date.toLocaleDateString(),
        writable: true,
        enumerable: true,
        configurable: true,
      },
    );
    persistedStore.recentlyDeleted.push(obj);
    persistedStore.pastAudio.splice(index, 1);
  } else {
    console.log(
      "what the hell? how did you manage that? please report this issue. whatever. deleting smth new",
    );
    checkName();
    persistedStore.recentlyDeleted.push({
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
  saving.value = "delete";
  autoDisappear();
};

const autoDisappear = () => {
  setTimeout(() => {
    saving.value = null;
  }, 1500);
};
</script>
