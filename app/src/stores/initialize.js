import { ref } from "vue";
import { defineStore } from "pinia";
import { persistedSettings } from "./persistedVars";
import { devices } from "./devices";

export const initializeStore = defineStore(
  "initializeStore",
  () => {
    // Initialize the devices store
    const devicesStore = devices();
    const persistedStore = persistedSettings();

    // Reactive refs for audio-related state
    const audioContext = ref(null);
    const analyser = ref(null);
    const inputGainNode = ref(null);
    const outputGainNode = ref(null);
    const mediaStreamDestination = ref(null);
    const stream = ref(null);
    const isInitialized = ref(false);

    const initializeAudio = async () => {
      try {
        // Clean up any existing audio resources
        cleanupAudio();

        // Ensure devices are fetched before proceeding
        // This ensures `microphones` and `speakers` are populated
        if (devicesStore.microphones.length === 0) {
          await devicesStore.getDevices();
        }

        // Check if a selected microphone exists in persisted settings
        let deviceId = persistedStore.selectedMicrophone;
        if (!deviceId && devicesStore.microphones.length > 0) {
          // Default to the first available microphone if none is selected
          deviceId = devicesStore.microphones[0].deviceId;
          persistedStore.selectedMicrophone = deviceId; // Persist the default selection
        }

        // Create audio context
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext created");

        if (audioContext.value.state === "suspended") {
          await audioContext.value.resume();
        }

        // Request audio stream with the selected device
        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: false,
            autoGainControl: false,
            deviceId: deviceId ? { exact: deviceId } : undefined,
          },
        });

        if (!audioContext.value) {
          console.error("AudioContext is not initialized.");
          return false;
        }

        // Create nodes
        analyser.value = audioContext.value.createAnalyser();
        analyser.value.fftSize = 2048;

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

        // Register audio context and input gain node in devices store
        devicesStore.registerAudioContext(audioContext.value);
        devicesStore.registerInputGainNode(inputGainNode.value);

        isInitialized.value = true;
        return true;
      } catch (error) {
        console.error("Audio initialization failed:", error);
        cleanupAudio();
        return false;
      }
    };

    const cleanupAudio = () => {
      if (stream.value) {
        stream.value.getTracks().forEach((track) => track.stop());
        stream.value = null;
      }

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
      mediaStreamDestination.value = null;
      isInitialized.value = false;
      console.log("Audio resources cleaned");
    };

    return {
      audioContext,
      inputGainNode,
      outputGainNode,
      mediaStreamDestination,
      stream,
      analyser,
      initializeAudio,
      cleanupAudio,
      isInitialized,
    };
  },
  {
    persist: false, // Don't persist this store
  }
);