import { ref } from "vue";
import { defineStore } from "pinia";
import { persistedSettings } from "./persistedStore";

export const devices = defineStore(
    "devices",
    () => {
        const persistedStore = persistedSettings();

        const microphones = ref([]);
        const speakers = ref([]);
        const getDevices = async () => {
            try {
                // Only request mic permission if needed
                if (!persistedStore.selectedMicrophone) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            autoGainControl: false,
                            noiseSuppression: false,
                            echoCancellation: false,
                        },
                    });
                    stream.getTracks().forEach((track) => track.stop());
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


        return {
            microphones,
            speakers,
            getDevices,
        }
    },
    {
        persist: true,
    })