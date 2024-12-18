// stores/selectedNote.js
import { defineStore } from 'pinia';

export const useSelectedNoteStore = defineStore('selectedNote', {
    state: () => ({
        selectedNote: { name: 'A', frequency: 440 }, // Default note
    }),
    actions: {
        setSelectedNote(note) {
            this.selectedNote = note;
        },
    },
});
