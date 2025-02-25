import { ref } from "vue";
import { defineStore } from "pinia";
import { persistedSettings } from "./persistedStore";

export const settingsStore = defineStore(
  "settings",
  () => {
    const persistedStore = persistedSettings();

    const microphones = ref([]);
    const speakers = ref([]);

    const inputVolume = ref(persistedStore.inputVolume || 0.5);
    const outputVolume = ref(persistedStore.outputVolume || 1.0);

    const showSettingsModal = ref(false);
    const selectedNote = ref(persistedStore.defaultNote);

    const audioContext = ref(null);
    const inputGainNode = ref(null);
    const outputGainNode = ref(null);
    const mediaStreamDestination = ref(null);
    const stream = ref(null);
    const audioElement = ref(null);
    const analyser = ref(null);
    const initializeAudio = async () => {
      try {
        cleanupAudio(); // Clean up any existing audio resources
        audioContext.value = new (window.AudioContext ||
          window.webkitAudioContext)();
        console.log("AudioContext created");

        if (audioContext.value.state === "suspended") {
          await audioContext.value.resume();
        }

        // Use the persisted microphone device ID
        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: false,
            echoCancellation: true,
            autoGainControl: false,
            deviceId: persistedStore.selectedMicrophone,
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
        outputGainNode.value = audioContext.value.createGain();
        outputGainNode.value.gain.value = persistedStore.outputVolume || 1.0;

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

    const updateInputDevice = async () => {
      try {
        if (audioContext.value) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: persistedStore.selectedMicrophone },
          });

          // Disconnect the old source if it exists
          if (inputGainNode.value) {
            inputGainNode.value.disconnect();
          }

          // Create a new source and connect it to the gain node
          const mediaStreamSource =
            audioContext.value.createMediaStreamSource(stream);
          mediaStreamSource.connect(inputGainNode.value);

          console.log(
            `Input device updated to: ${persistedStore.selectedMicrophone}`,
          );
        }
      } catch (error) {
        console.error("Error setting input device:", error);
        throw error;
      }
    };

    // Volume controls
    const setInputVolume = (volume) => {
      inputVolume.value = Number(volume);
      persistedStore.inputVolume = Number(volume);
      if (inputGainNode.value) {
        inputGainNode.value.gain.value = Number(volume);
      } else {
        console.warn("Input gain node is not initialized.");
      }
    };

    const setOutputVolume = (volume) => {
      outputVolume.value = Number(volume);
      persistedStore.outputVolume = Number(volume);
      if (outputGainNode.value) {
        outputGainNode.value.gain.value = Number(volume);
      } else {
        console.warn("Output gain node is not initialized.");
      }
    };

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

    return {
      audioContext,
      inputGainNode,
      outputGainNode,
      mediaStreamDestination,
      audioElement,
      microphones,
      speakers,
      inputVolume,
      outputVolume,
      stream,
      initializeAudio,
      showSettingsModal,
      selectedNote,
      updateInputDevice,
      setInputVolume,
      setOutputVolume,
      cleanupAudio,
      getDevices,
      analyser,
    };
  },
  {
    persist: false, // Don't persist this store
  },
);
