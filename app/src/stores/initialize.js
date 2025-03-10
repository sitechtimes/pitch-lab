import { ref } from "vue";
import { defineStore } from "pinia";
import { persistedSettings } from "./persistedStore";
import { devices } from "./devices";
export const initialize = defineStore(
  "initialize",
  () => {
    const devicesStore = devices();
    const audioContext = ref(null);
    const analyser = ref(null);
    const persistedStore = persistedSettings();
    const inputGainNode = ref(null);
    const outputGainNode = ref(null);
    const mediaStreamDestination = ref(null);
    const stream = ref(null);
    const isInitialized = ref(false)

    const initializeAudio = async () => {
      try {
        cleanupAudio(); // Clean up any existing audio resources
        getDevices()
        audioContext.value = new (window.AudioContext ||
          window.webkitAudioContext)();
        console.log("AudioContext created");

        if (audioContext.value.state === "suspended") {
          await audioContext.value.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: false,
            autoGainControl: false,
            deviceId: { ideal: persistedSettings().selectedMicrophone },
          },
        });

        if (!audioContext.value) {
          console.error("AudioContext is not initialized.");
          return false;
        }

        // Create nodes
        analyser.value = audioContext.value.createAnalyser();
        analyser.value.fftSize = 2048; // Reduced for better compatibility

        inputGainNode.value = audioContext.value.createGain();
        inputGainNode.value.gain.value = persistedStore.inputVolume || 0.5;

        // Create processing chain
        const source = audioContext.value.createMediaStreamSource(stream.value);
        const highPassFilter = audioContext.value.createBiquadFilter();
        highPassFilter.type = "highpass";
        highPassFilter.frequency.value = 50;

        // Connect nodes
        source
          .connect(highPassFilter)
          .connect(inputGainNode.value)
          .connect(analyser.value);
        console.log("Audio nodes initialized:", {
          analyser: !!analyser.value,
          context: audioContext.value.state,
        });

        return true;
      } catch (error) {
        console.error("Audio initialization failed:", error);
        cleanupAudio();
        return false;
      }
    };

    const cleanupAudio = () => {
      if (audioContext.value) {
        try {
          // Disconnect all nodes first
          inputGainNode.value?.disconnect();
          outputGainNode.value?.disconnect();
          analyser.value?.disconnect();

          // Close context properly
          if (typeof audioContext.value.close === "function") {
            audioContext.value.close();
          }
        } catch (e) {
          console.warn("Cleanup error:", e);
        }
        audioContext.value = null;
      }
      analyser.value = null;
      inputGainNode.value = null;
      outputGainNode.value = null;
      console.log("Audio resources cleaned");
    };







    return {
      audioContext,
      inputGainNode,
      outputGainNode,
      mediaStreamDestination,
      stream,
      initializeAudio,

      cleanupAudio,
      analyser,
    };
  },
  {
    persist: false, // Don't persist this store
  },
);
