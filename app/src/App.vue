<template>
  <div class="w-screen bg-entire-bg text-white min-h-screen">
    <header class="flex items-center justify-between px-6 py-4 bg-entire-bg">
      <HeaderTitle />
      <div class="flex items-center gap-4">
        <router-link to="/" class="text-xl hover:underline">Home</router-link>
        <router-link to="/tuner" class="text-xl hover:underline"
          >Tuner</router-link
        >
        <SettingsIcon />
      </div>
    </header>

    <DeviceSelector
      v-if="settings.showSettingsModal"
      name="Settings"
      class="absolute inset-0 bg-black/30 p-4 z-10"
    />

    <div class="mt-8">
          <!-- Main Control Panel -->
    <div class="flex justify-center mt-8">
  
      <div
        class="w-[95%] bg-controllers-bg rounded-3xl p-6 "
      >    
      <div class="flex flex-row text-center w-full text-3xl font-semibold mb-2">      
        <h1 class="w-[40%]">Recorder</h1>    
        <h1 class="w-[30%]">Metronome</h1>       
        <h1 class="w-[30%]">Tuner</h1>
      </div>
      <div class="flex items-center justify-center
">
        <!-- Recorder -->
      <div class=" flex w-[35%] flex-col">
        <AudioRecorder />
    
        <div
          v-if="audioStore.viewingHistory"
          class="absolute inset-0 bg-black/30 p-4"
        >
          <HistoryModal />
        </div>  
      </div>
        
        <!-- Metronome -->
        <div class="w-[35%] items-center flex justify-center">
          <MetronomeController />
        </div>
        <!-- Tuner -->
        <div class="w-[20%] flex justify-center ">
          <TunerController />
        </div>
      </div>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { settingsStore } from "./stores/settings.js";
import HeaderTitle from "./components/HeaderComponents/HeaderTitle.vue";
import SettingsIcon from "./components/HeaderComponents/SettingsIcon.vue";
import DeviceSelector from "./components/HeaderComponents/AdjusterSettings/DeviceSelector.vue";

const settings = settingsStore();
</script>
