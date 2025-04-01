import { ref } from "vue";
import { defineStore } from "pinia";
import { devicesStore } from "./devices";

export const initializeStore = defineStore(
  "initializeStore",
  () => {
    const devices = devicesStore();
    const audioContext = ref(null);
    const analyser = ref(null);
    const mediaStreamDestination = ref(null);
    const stream = ref(null);

    const inputGainNode = ref(null);
    const outputGainNode = ref(null);

    const isInitialized = ref(false);
    const cannotInitailize = ref(false)
    const noMicrophones = ref(false);
    const noSpeakers = ref(false);
    const fftSize = ref(4096);
    const initializeAudio = async () => {
      try {
        devices.cleanupAudio();
        if (devices.microphones.length === 0) {
          await devices.getDevices();
        }

        let deviceId = devices.selectedMicrophone?.deviceId || devices.microphones[0]?.deviceId;
        devices.selectedMicrophone = deviceId;

        // Initialize audio context
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();

        if (!audioContext.value) {
          console.error("AudioContext creation failed.");
          return false;
        }

        if (audioContext.value.state === "suspended") {
          await audioContext.value.resume();
        }

        // Request audio stream with the selected device
        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: false,
            autoGainControl: false,
            deviceId: devices.selectedMicrophone ? { exact: devices.selectedMicrophone } : undefined,
          },
        });

        // Check for audioContext initialization
        if (!audioContext.value) {
          console.error("AudioContext is not initialized.");
          return false;
        }

        // Create nodes
        analyser.value = audioContext.value.createAnalyser();
        analyser.value.fftSize = fftSize.value;

        inputGainNode.value = audioContext.value.createGain();
        inputGainNode.value.gain.value = devices.inputVolume || 0.5;

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
        devices.registerAudioContext(audioContext.value);
        devices.registerInputGainNode(inputGainNode.value);

        isInitialized.value = true;
        console.log("Audio initialized successfully");
        return true;
      } catch (error) {
        console.error("Audio initialization failed:", error);
        cannotInitailize.value = true;
        devices.cleanupAudio();
        return false;
      }
    };

    return {
      audioContext,
      inputGainNode,
      outputGainNode,
      mediaStreamDestination,
      stream,
      analyser,
      initializeAudio,
      isInitialized,
      fftSize,
      cannotInitailize,
      noMicrophones,
      noSpeakers
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: [
            "fftSize",
          ],
        },
      ],
    },
  }
);