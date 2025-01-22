<template>
  <div>
    <h2>Warning!</h2>
    <p>Selecting delete will cause these files to be lost forever.</p>
    <p>Do you want to proceed?</p>
    <button @click="store.warning = false">Cancel</button>
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
  let index = store.recentlyDeleted.findIndex(
    (file) => file.id === store.currentAudio.id,
  );
  console.log("found it", index);
  store.recentlyDeleted.splice(index, 1);
  store.currentAudio = null;
  store.warning = false;
};
</script>
