import { ref } from "vue";
import { defineStore } from "pinia";
import { persistedSettings } from "./persistedStore";

export const tuning = defineStore(
    "tuning",
    () => {
        const persistedStore = persistedSettings();

        const selectedNote = ref(persistedStore.defaultNote);
    })

