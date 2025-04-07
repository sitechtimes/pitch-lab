import { ref } from "vue";
import { defineStore } from "pinia";
import { initializeStore } from "./initialize";
export const devicesStore = defineStore(
    "devicesStore",
    () => {
        const initialize = initializeStore();
        const microphones = ref([]);
        const speakers = ref([]);
        const microphonesNoDeviceId = ref([]);
        const speakersNoDeviceId = ref([]);
        const microphonesWithDeviceId = ref([]);
        const speakersWithDeviceId = ref([]);

        const selectedMicrophone = ref(null);
        const selectedSpeaker = ref(null);
        const inputVolume = ref(0.5);
        const outputVolume = ref(1.0);

        const getDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                console.log("Devices:", devices);

                // Split by kind
                microphones.value = devices.filter((d) => d.kind === "audioinput");
                speakers.value = devices.filter((d) => d.kind === "audiooutput");

                microphonesWithDeviceId.value = microphones.value.filter((d) => d.deviceId);
                speakersWithDeviceId.value = speakers.value.filter((d) => d.deviceId);

                microphonesNoDeviceId.value = microphones.value.filter((d) => !d.deviceId);
                speakersNoDeviceId.value = speakers.value.filter((d) => !d.deviceId);

                console.log("Microphones with deviceId:", microphonesWithDeviceId.value);
                console.log("Speakers with deviceId:", speakersWithDeviceId.value);
                console.log("Microphones without deviceId:", microphonesNoDeviceId.value);
                console.log("Speakers without deviceId:", speakersNoDeviceId.value);

                if (microphonesWithDeviceId.value.length > 0) {
                    selectedMicrophone.value =
                        microphonesWithDeviceId.value.find((d) => d.deviceId === "default") ||
                        microphonesWithDeviceId.value[0];
                } else {
                    selectedMicrophone.value = null;
                }

                if (speakersWithDeviceId.value.length > 0) {
                    selectedSpeaker.value =
                        speakersWithDeviceId.value.find((d) => d.deviceId === "default") ||
                        speakersWithDeviceId.value[0];
                } else {
                    selectedSpeaker.value = null;
                }

                // Fallback to no-deviceId mic/speaker if needed
                if (!selectedMicrophone.value && microphonesNoDeviceId.value.length > 0) {
                    selectedMicrophone.value = microphonesNoDeviceId.value[0];
                }

                if (!selectedSpeaker.value && speakersNoDeviceId.value.length > 0) {
                    selectedSpeaker.value = speakersNoDeviceId.value[0];
                }

                console.log("Selected Microphone:", selectedMicrophone.value);
                console.log("Selected Speaker:", selectedSpeaker.value);
            } catch (error) {
                console.error("Error getting devices:", error);
            }
        };

        const updateDevice = async () => {
            cleanupAudio();
            await initialize.initializeAudio();
            console.log("Device updated:", selectedMicrophone.value);
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
            microphonesNoDeviceId,
            speakersNoDeviceId,
            microphonesWithDeviceId,
            speakersWithDeviceId,
            microphones,
            speakers,
            inputVolume,
            outputVolume,
            getDevices,
            updateDevice,
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