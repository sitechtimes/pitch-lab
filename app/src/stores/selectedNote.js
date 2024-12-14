import { defineStore } from "pinia";

export const useTuningStore = defineStore("tuning", {
    state: () => ({
        currentNote: "A", // Default tuning note
        noteFrequencies: {
            A: 440,
            "B♭": 466.16,
            C: 261.63,
            "E♭": 311.13,
            F: 349.23,
        },
    }),
    getters: {
        currentFrequency(state) {
            return state.noteFrequencies[state.currentNote];
        },
    },
    actions: {
        setNote(note) {
            this.currentNote = note;
        },
    },
});
