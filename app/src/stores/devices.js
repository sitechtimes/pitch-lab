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
                if (!initialize.audioContext) {
                    return;
                } else if (initialize.inputGainNode) {
                    initialize.inputGainNode.disconnect();
                }

                const source = initialize.audioContext.createMediaStreamSource(initialize.stream);
                source.connect(initialize.inputGainNode);
                console.log(`Input device updated to: ${selectedMicrophone.value}`);
            } catch (error) {
                console.error("Error updating input device:", error);
            }
        };

        const cleanupAudio = () => {
            if (initialize.stream) {
                initialize.stream.getTracks().forEach((track) => track.stop());
                initialize.stream = null;
            }

            if (initialize.audioContext) {
                try {
                    initialize.inputGainNode?.disconnect();
                    initialize.outputGainNode?.disconnect();
                    initialize.analyser?.disconnect();

                    if (typeof initialize.audioContext.close === "function") {
                        initialize.audioContext.close();
                    }
                } catch (e) {
                    console.warn("Cleanup error:", e);
                }
                initialize.audioContext = null;
            }

            initialize.analyser = null;
            initialize.inputGainNode = null;
            initialize.outputGainNode = null;
            initialize.mediaStreamDestination = null;
            initialize.isInitialized = false;
            console.log("Audio resources cleaned");
        };

        const setInputVolume = (volume) => {
            inputVolume.value = Math.max(0, Math.min(1, volume));
            if (initialize.inputGainNode) {
                initialize.inputGainNode.gain.value = inputVolume.value;
            }
        };
        const setOutputVolume = (volume) => {
            outputVolume.value = Math.max(0, Math.min(1, volume));
            if (initialize.outputGainNode) {
                initialize.outputGainNode.gain.value = outputVolume.value;
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
            cleanupAudio
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