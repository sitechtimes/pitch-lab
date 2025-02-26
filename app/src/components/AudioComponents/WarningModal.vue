<template>
  <div>
    <h2>Warning!</h2>
    <p>Selecting delete will cause these files to be lost forever.</p>
    <p>Do you want to proceed?</p>
    <button @click="(audioStore.warning = false), (showAlert = false)">Cancel</button>
    <button @click="killIt">Yes</button>
  </div>
</template>

<script setup>
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";

const audioStore = audioFiles();
const persistedStore = persistedSettings();

const killIt = () => {
  if (audioStore.deleteFunc === "single") {
    deleteRecent();
  } else {
    persistedStore.recentlyDeleted = [];
    audioStore.currentAudio = null;
    audioStore.warning = false;
  }
};

const deleteRecent = () => {
  let index = persistedStore.recentlyDeleted.findIndex(
    (file) => file.id === audioStore.currentAudio.id,
  );
  console.log("found it", index);
  persistedStore.recentlyDeleted.splice(index, 1);
  audioStore.currentAudio = null;
  audioStore.warning = false;
};
</script>
