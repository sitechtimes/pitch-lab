import { ref } from "vue";
import { defineStore } from "pinia";
import { persistedSettings } from "./persistedVars";
import { initializeStore } from "./initialize";

export const devicesStore = defineStore(
    "devicesStore",
    () => {
        const persistedStore = persistedSettings();
        const initialize = initializeStore()
        const microphones = ref([]);
        const speakers = ref([]);
        const inputVolume = ref(persistedStore.inputVolume || 0.5);
        const outputVolume = ref(persistedStore.outputVolume || 0.5);
        const audioContext = ref(null);
        const inputGainNode = ref(null);
        const getDevices = async () => {
            try {
                // Only request mic permission if needed
                if (!persistedStore.selectedMicrophone) {

                    initialize.stream.getTracks().forEach((track) => track.stop());
                }

                const devices = await navigator.mediaDevices.enumerateDevices();

                // Firefox workaround for speaker labels
                if (navigator.userAgent.includes("Firefox")) {
                    microphones.value = devices.filter((d) => d.kind === "audioinput");
                    speakers.value = [{ deviceId: "default", label: "Default Speaker" }];
                } else {
                    microphones.value = devices.filter((d) => d.kind === "audioinput");
                    speakers.value = devices.filter((d) => d.kind === "audiooutput");
                }
            } catch (error) {
                console.error("Error getting devices:", error);
            }
        };

        // Unnecessary getUserMedia Call:
        // The getUserMedia call is only needed to prompt for microphone permission if enumerateDevices() requires it(e.g., in some browsers like Chrome).However:
        // Modern browsers(Chrome 71 +, Firefox 63 +) allow enumerateDevices() without prior permission if no device IDs are requested.

        // The check if (!persistedStore.selectedMicrophone) assumes initialization hasn’t occurred, but if persistedStore is pre - populated, this might be redundant.

        //             Improvement: Remove the getUserMedia call unless you confirm it’s necessary for your target browsers.Test without it to see if enumerateDevices() works standalone.
        const updateInputDevice = async () => {
            try {
                if (!audioContext.value) return;

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: persistedStore.selectedMicrophone },
                });

                if (inputGainNode.value) {
                    inputGainNode.value.disconnect();
                }

                const source = audioContext.value.createMediaStreamSource(stream);
                source.connect(inputGainNode.value);
                console.log(`Input device updated to: ${persistedStore.selectedMicrophone}`);
            } catch (error) {
                console.error("Error updating input device:", error);
            }
        };

        const setInputVolume = (volume) => {
            inputVolume.value = volume;
            if (inputGainNode.value) {
                inputGainNode.value.gain.value = volume;
            }
            persistedStore.inputVolume = volume;
        };
        const setOutputVolume = (volume) => {
            outputVolume.value = volume;
            // Add output volume logic here later
        };

        const registerAudioContext = (ctx) => {
            audioContext.value = ctx;
        };

        const registerInputGainNode = (node) => {
            inputGainNode.value = node;
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
            registerAudioContext,
            registerInputGainNode,
        }
    },
    {
        persist: true, //but only persist input and output volume
    })