import { ref } from "vue";
import { defineStore } from "pinia";


export const settingsUI = defineStore(
    "settingsUI", () => {
        const showSettingsModal = ref(false);
        return {
            showSettingsModal
        }
    }
)