import { ref } from "vue";
import { defineStore } from "pinia";

export const tuningStore = defineStore(
    "tuningStore",
    () => {
        const selectedNote = ref({ name: "C", frequency: 261.63 });

        return {
            selectedNote,
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
                    ]
                }]
        }
    }
)