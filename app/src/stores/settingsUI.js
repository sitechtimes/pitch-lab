import { ref } from "vue";
import { defineStore } from "pinia";


export const settingsUIStore = defineStore(
    "settingsUIStore", () => {
        const showSettingsModal = ref(false);
        return {
            showSettingsModal
        }
    }
)