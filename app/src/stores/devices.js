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
                console.log("Devices:", devices);

                // Filter microphones and speakers
                microphones.value = devices.filter((d) => d.kind === "audioinput" && d.deviceId);
                speakers.value = devices.filter((d) => d.kind === "audiooutput" && d.deviceId);

                console.log("Microphones:", microphones.value);
                console.log("Speakers:", speakers.value);

                // Select the default microphone and speaker, or the first available device
                selectedMicrophone.value = microphones.value.find((d) => d.deviceId === "default") || microphones.value[0] || null;
                selectedSpeaker.value = speakers.value.find((d) => d.deviceId === "default") || speakers.value[0] || null;

                // Handle case when no devices are found
                if (microphones.value.length === 0) selectedMicrophone.value = null;
                if (speakers.value.length === 0) selectedSpeaker.value = null;

                console.log("Selected Microphone:", selectedMicrophone.value);
                console.log("Selected Speaker:", selectedSpeaker.value);
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

                    initialize.audioContext.destination.disconnect();

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


        const registerAudioContext = (context) => {
            console.log("Registering AudioContext", context);
            initialize.audioContext = context;
        };

        const registerInputGainNode = (node) => {
            console.log("Registering Input Gain Node", node);
            initialize.inputGainNode = node;
        };
        const registerOutputGainNode = (node) => {
            console.log("Registering Output Gain Node:", node);
            initialize.outputGainNode = node;
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
            cleanupAudio,
            registerAudioContext,
            registerInputGainNode,
            registerOutputGainNode
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