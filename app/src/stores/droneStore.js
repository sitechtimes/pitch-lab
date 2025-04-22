import { ref, watch, reactive } from "vue";
import { defineStore } from "pinia";
import { initializeStore } from "./initialize";
import { devicesStore } from "./devices";

export const droneStore = defineStore("droneStore", () => {
    const initialize = initializeStore();
    const devices = devicesStore();

    // Reactive state
    const isDronePlaying = ref(false);
    const selectedNote = ref("A4");
    const oscillator = ref(null);
    const gainNode = ref(null);

    // Make noteFrequencies reactive to support dynamic updates
    const noteFrequencies = reactive({
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
    });

    const playDrone = async () => {
        // Ensure AudioContext exists and is running
        if (!initialize.audioContext) {
            console.warn("AudioContext is not initialized.");
            return;
        }

        const ctx = initialize.audioContext.value || initialize.audioContext; // Support both ref and non-ref
        if (ctx.state === "suspended") {
            try {
                await ctx.resume();
            } catch (error) {
                console.error("Failed to resume AudioContext:", error);
                return;
            }
        }
        if (ctx.state === "closed") {
            console.warn("AudioContext is closed.");
            return;
        }

        // Stop any existing drone
        stopDrone();

        // Get frequency for the selected note
        const freq = noteFrequencies[selectedNote.value];
        if (!freq) {
            console.warn(`No frequency found for note: ${selectedNote.value}`);
            return;
        }

        // Create and configure oscillator and gain
        oscillator.value = ctx.createOscillator();
        gainNode.value = ctx.createGain();

        oscillator.value.type = "sine";
        oscillator.value.frequency.setValueAtTime(freq, ctx.currentTime);
        gainNode.value.gain.setValueAtTime(devices.outputVolume || 0.5, ctx.currentTime); // Fallback volume

        oscillator.value.connect(gainNode.value).connect(ctx.destination);
        oscillator.value.start();
        isDronePlaying.value = true;
    };

    const stopDrone = () => {
        if (oscillator.value) {
            try {
                oscillator.value.stop();
                oscillator.value.disconnect();
            } catch (error) {
                console.warn("Error stopping oscillator:", error);
            }
            oscillator.value = null;
        }
        if (gainNode.value) {
            try {
                gainNode.value.disconnect();
            } catch (error) {
                console.warn("Error disconnecting gain node:", error);
            }
            gainNode.value = null;
        }
        isDronePlaying.value = false;
    };

    // Watch for volume changes
    watch(
        () => devices.outputVolume,
        (newVolume) => {
            if (gainNode.value && typeof newVolume === "number") {
                gainNode.value.gain.setValueAtTime(newVolume, initialize.audioContext?.value?.currentTime || 0);
            }
        }
    );

    // Update noteFrequencies dynamically
    const updateNoteFrequencies = (newFrequencies) => {
        // Clear existing frequencies
        Object.keys(noteFrequencies).forEach((key) => {
            delete noteFrequencies[key];
        });
        // Assign new frequencies
        Object.assign(noteFrequencies, newFrequencies);
    };

    // // Cleanup on store destruction
    // onUnmounted(() => {
    //     stopDrone();
    // });

    return {
        selectedNote,
        isDronePlaying,
        playDrone,
        stopDrone,
        noteFrequencies,
        updateNoteFrequencies,
    };
});