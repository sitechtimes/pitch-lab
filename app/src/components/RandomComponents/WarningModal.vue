<template>
  <div>
    <h2>Warning!</h2>
    <p>Selecting delete will cause these files to be lost forever.</p>
    <p>Do you want to proceed?</p>
    <button @click="$emit('keep')">Cancel</button>
    <button @click="$emit('kill')">Yes</button>
  </div>
</template>

<script setup>
import { settingsStore } from "@/stores/settings";
const store = settingsStore();
</script>
``
