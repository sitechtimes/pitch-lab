<template>
  <div>
    <div>
      <label for="note-selection" class="text-gray-400 mr-4">History</label>
      <select
        class="bg-gray-700 text-white p-2 rounded"
        v-model="audioStore.currentAudio"
      >
        History:
        <option
          v-for="file in audioStore.pastAudio"
          :key="file.id"
          :value="{ audio: file.audio, id: file.id }"
        >
          {{ file.name }} recorded on {{ file.date }}
        </option>
      </select>
    </div>
    <div>
      <input type="text" v-model="audioStore.fileName" />

      <button @click="saveAudio">Rename File</button>
      <button @click="deleteAudio">Delete</button>
    </div>
  </div>
</template>

<script setup>
import { audioFiles } from "@/stores/audioFiles";
const audioStore = audioFiles();

const checkName = () => {
  if (audioStore.fileName !== null) {
    return true;
  } else {
    audioStore.fileName = `Untitled Recording ${audioStore.assignedID}`;
  }
};

const saveAudio = () => {
  let index = audioStore.pastAudio.findIndex(
    (file) => file.id === audioStore.currentAudio.id,
  );
  console.log(index);
  console.log(audioStore.pastAudio);
  if (index === Number || index === 0) {
    console.log("found dupe maybe");
    if (checkName === true) {
      audioStore.pastAudio[index].name = audioStore.fileName.trim();
      console.log(audioStore.pastAudio[index].name);
    }
  } else {
    console.log(
      "what the hell??? how'd you manage that? please report this. whatever, creating smth new",
    );
    let date = new Date();
    checkName();
    audioStore.pastAudio.push({
      id: audioStore.assignedID,
      name: audioStore.fileName.trim(),
      audio: audioStore.currentAudio.audio,
      date: date.toLocaleDateString(),
    });
    audioStore.assignedID++;
  }
  audioStore.fileName = null;
};

const deleteAudio = () => {
  let index = audioStore.pastAudio.findIndex(
    (file) => file.id === audioStore.currentAudio.id,
  );
  let date = new Date();
  console.log(audioStore.currentAudio.id);
  if (index === Number || index === 0) {
    console.log("found it");
    let obj = Object.defineProperty(
      audioStore.pastAudio[index],
      "dateDeleted",
      {
        value: date.toLocaleDateString(),
        writable: true,
        enumerable: true,
        configurable: true,
      },
    );
    console.log(obj);
    audioStore.recentlyDeleted.push(obj);
    audioStore.pastAudio.splice(index, 1);
  } else {
    console.log(
      "what the hell? how did you manage that? please report this issue. whatever. deleting smth new",
    );
    checkName();
    audioStore.recentlyDeleted.push({
      id: audioStore.assignedID,
      name: audioStore.fileName,
      audio: audioStore.currentAudio.audio,
      date: date.toLocaleDateString(),
      deletedDate: date.toLocaleDateString(),
    });
    audioStore.assignedID++;
  }
  audioStore.currentAudio = null;
  audioStore.fileName = null;
};
</script>
