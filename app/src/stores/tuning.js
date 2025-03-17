import { ref } from "vue";
import { defineStore } from "pinia";

export const tuningStore = defineStore(
    "tuningStore",
    () => {
        const selectedNote = ref({ name: "C", frequency: 261.63 });
        const fftSize = ref(2048);

        return {
            selectedNote,
            fftSize
        }
    },
    {
        persist: {
            enabled: true,
            strategies: [
                {
                    storage: localStorage,
                    paths: [
                        "selectedNote",
                        "fftSize"
                    ]
                }]
        }
    }
)