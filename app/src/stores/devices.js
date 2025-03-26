import { ref } from "vue";
import { defineStore } from "pinia";
import { initializeStore } from "./initialize";
export const devicesStore = defineStore(
    "devicesStore",
    () => {
        const initialize = initializeStore()
        const microphones = ref([]);
        const speakers = ref([]);

        const selectedMicrophone = ref(null);
        const selectedSpeaker = ref(null);
        const inputVolume = ref(0.5);
        const outputVolume = ref(1.0);
        const getDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                microphones.value = devices.filter((d) => d.kind === "audioinput");
                speakers.value = navigator.userAgent.includes("Firefox")
                    ? [{ deviceId: "default", label: "Default Speaker" }]
                    : devices.filter((d) => d.kind === "audiooutput");
            } catch (error) {
                console.error("Error getting devices:", error);
            }
        };

        const updateInputDevice = async () => {
            try {
                if (!initialize.audioContext.value) return;

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: selectedMicrophone.value },
                });

                if (initialize.inputGainNode.value) {
                    inputGainNode.value.disconnect();
                }

                const source = initialize.audioContext.value.createMediaStreamSource(stream);
                source.connect(inputGainNode.value);
                console.log(`Input device updated to: ${selectedMicrophone.value}`);
            } catch (error) {
                console.error("Error updating input device:", error);
            }
        };

        const setInputVolume = (volume) => {
            inputVolume.value = Math.max(0, Math.min(1, volume));
            if (inputGainNode.value) {
                inputGainNode.value.gain.value = inputVolume.value;
            }
        };
        const setOutputVolume = (volume) => {
            outputVolume.value = Math.max(0, Math.min(1, volume));
            if (outputGainNode.value) {
                outputGainNode.value.gain.value = outputVolume.value;
            }
        };

        return {
            microphones,
            speakers,
            inputVolume,
            outputVolume,
            getDevices,
            updateInputDevice,
            setInputVolume,
            setOutputVolume,
            selectedMicrophone,
            selectedSpeaker,
        }
    },
    {
        persist: {
            enabled: true,
            strategies: [
                {
                    storage: localStorage,
                    paths: [
                        "selectedMicrophone",
                        "selectedSpeaker",
                        "inputVolume",
                        "outputVolume",

                    ],
                },
            ],
        },
    })