import { defineStore } from "pinia";
import { ref } from "vue";
import { initializeStore } from "./initialize";
import { noteFrequencies } from "@/constants/NoteFrequencies.js";

export const droneStore = defineStore("droneStore", () => {
    const init = initializeStore();

    const currentNote = ref(null);
    const oscillator = ref(null);
    const isPlaying = ref(false);

    const findFrequency = (note) => {
        const found = noteFrequencies.find((n) => n.note === note);
        return found ? found.frequency : null;
    };

    const playDrone = async (note) => {
        stopDrone();

        if (!init.audioContext || init.audioContext.state !== "running") {
            const success = await init.initializeAudio();
            if (!success) return;
        }

        const frequency = findFrequency(note);
        if (!frequency) {
            console.warn(`Note ${note} not found.`);
            return;
        }

        const osc = init.audioContext.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequency;

        osc.connect(init.outputGainNode);
        osc.start();

        oscillator.value = osc;
        currentNote.value = note;
        isPlaying.value = true;
    };

    const stopDrone = () => {
        if (oscillator.value) {
            oscillator.value.stop();
            oscillator.value.disconnect();
            oscillator.value = null;
        }
        currentNote.value = null;
        isPlaying.value = false;
    };

    return {
        currentNote,
        isPlaying,
        playDrone,
        stopDrone,
    };
});
