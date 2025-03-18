<template>
  <div>
    <h2>Warning!</h2>
    <p>Selecting delete will cause these files to be lost forever.</p>
    <p>Do you want to proceed?</p>
    <button @click="audioStore.warning = false">Cancel</button>
    <button @click="killIt">Yes</button>
  </div>
</template>

<script setup>
import { audioFilesStore } from "@/stores/audioFiles";

const audioStore = audioFilesStore();

const killIt = () => {
  if (audioStore.deleteFunc === "single") {
    deleteRecent();
  } else {
    audioStore.recentlyDeleted = [];
    audioStore.currentRecording = null;
    audioStore.warning = false;
  }
};

const deleteRecent = () => {
  let index = audioStore.recentlyDeleted.findIndex(
    (file) => file.id === audioStore.currentRecording.id,
  );
  console.log("found it", index);
  audioStore.recentlyDeleted.splice(index, 1);
  audioStore.currentRecording = null;
  audioStore.warning = false;
};
</script>
``
