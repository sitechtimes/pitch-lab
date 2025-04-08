<template>

      <div class="fixed inset-0 z-10 flex justify-center ">
        <div
          class="flex w-full items-center justify-center text-center sm:p-0"
        >
          <div
            class="flex flex-col px-6 py-4 sm:flex transform overflow-hidden rounded-lg items-center bg-[#0E021C] text-left shadow-xl transition-all sm:my-8 sm:w-[80%] sm:max-w-lg"
          >
            <div class="bg-purple rounded-lg text-center px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            
        <h2 class="text-4xl">Warning!</h2>
        <p class="text-lg my-1">Selecting delete will cause these files to be lost forever.</p>
        <p>Do you want to proceed?</p>            
          </div>    
          <div class="flex justify-center space-x-4 mt-4">
             <button @click="killIt" class="bg-purple rounded-lg text-xl px-2">Yes</button>
             <button class="text-xl" @click="
            (audioStore.warning = false);">Cancel</button>
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
