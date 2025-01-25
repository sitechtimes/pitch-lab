<template>
  <div>
    <div>
      <!-- <label for="note-selection" class="text-gray-400 mr-4">History</label> -->
      <select
        class="bg-gray-700 text-white p-2 rounded w-[90%]"
        v-model="audioStore.currentAudio"
      >
        History:
        <option
          v-for="file in persistedStore.pastAudio"
          :key="file.id"
          :value="{ audio: file.audio, id: file.id }"
        >
          {{ file.name }} recorded on {{ file.date }}
        </option>
      </select>
    </div>
    <div>
      <input
        type="text"
        class="text-black w-1/2 mt-3"
        v-model="audioStore.fileName"
      />

      <button @click="saveAudio">Rename File</button>
      <button @click="deleteAudio">Delete</button>
    </div>
  </div>
</template>

<script setup>
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";
const audioStore = audioFiles();
const persistedStore = persistedSettings();

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
    if (checkName === true) {
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
};
</script>
