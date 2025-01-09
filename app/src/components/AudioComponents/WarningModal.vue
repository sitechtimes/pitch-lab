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
import { audioFiles } from "@/stores/audioFiles";

const store = audioFiles();
const killIt = () => {
  if (store.deleteFunc === "single") {
    deleteRecent();
  } else {
    store.recentlyDeleted = [];
  }
};

const deleteRecent = () => {
  let index = audioStore.recentlyDeleted.findIndex(
    (file) => file.id === audioStore.currentAudio.id,
  );
  console.log("found it", index);
  audioStore.recentlyDeleted.splice(index, 1);
  audioStore.currentAudio = null;
  audioStore.warning = false;
};
</script>
``
