import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { initializeStore } from "./initialize";
import { devicesStore } from "./devices";

export const droneStore = defineStore("droneStore", () => {
    const initialize = initializeStore();
    const devices = devicesStore();

    const isDronePlaying = ref(false);
    const selectedNote = ref("A4");
    const oscillator = ref(null);
    const gainNode = ref(null);

    const noteFrequencies = {
        C3: 130.81,
        D3: 146.83,
        E3: 164.81,
        F3: 174.61,
        G3: 196.0,
        A3: 220.0,
        B3: 246.94,
        C4: 261.63,
        D4: 293.66,
        E4: 329.63,
        F4: 349.23,
        G4: 392.0,
        A4: 440.0,
        B4: 493.88,
        C5: 523.25,
    };

    const playDrone = () => {
        if (!initialize.audioContext || initialize.audioContext.value.state === "closed") {
            console.warn("AudioContext is not initialized.");
            return;
        }

        stopDrone();

        const freq = noteFrequencies[selectedNote.value];
        const ctx = initialize.audioContext.value;

        oscillator.value = ctx.createOscillator();
        gainNode.value = ctx.createGain();

        oscillator.value.type = "sine";
        oscillator.value.frequency.setValueAtTime(freq, ctx.currentTime);

        gainNode.value.gain.value = devices.outputVolume;

        oscillator.value.connect(gainNode.value).connect(ctx.destination);
        oscillator.value.start();
        isDronePlaying.value = true;
    };

    const stopDrone = () => {
        if (oscillator.value) {
            oscillator.value.stop();
            oscillator.value.disconnect();
            oscillator.value = null;
        }
        if (gainNode.value) {
            gainNode.value.disconnect();
            gainNode.value = null;
        }
        isDronePlaying.value = false;
    };

    watch(
        () => devices.outputVolume,
        (newVolume) => {
            if (gainNode.value) {
                gainNode.value.gain.value = newVolume;
            }
        }
    );

    return {
        selectedNote,
        isDronePlaying,
        playDrone,
        stopDrone,
        noteFrequencies,
    };
});
