<template>
    <div
      class="relative z-10"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      ></div>
      <div class="fixed inset-0 z-10 flex justify-center">
        <div
          class="flex w-full items-center justify-center p-4 text-center sm:p-0"
        >
          <div
            class="flex flex-col px-6 py-4 sm:flex transform overflow-hidden rounded-lg items-center justify-center bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          >
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            
    <h2>Warning!</h2>
    <p>Selecting delete will cause these files to be lost forever.</p>
    <p>Do you want to proceed?</p>
    <button @click="
    (audioStore.warning = false);">Cancel</button>
    <button @click="killIt">Yes</button>
            </div>
          </div>
        </div>
      </div>
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
