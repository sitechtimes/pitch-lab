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
    const cannotInitialize = ref(false)
    const noMicrophones = ref(false);
    const noSpeakers = ref(false);
    const fftSize = ref(4096);
    const initializeAudio = async () => {
      try {
        devices.cleanupAudio();
        console.log("list of stuff" + devices.microphones, devices.microphonesNoDeviceId, devices.speakers, devices.speakersNoDeviceId);

        if (!devices.microphones && !devices.microphonesNoDeviceId) {
          await devices.getDevices();
        }

        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();

        if (!audioContext.value) {
          console.error("AudioContext creation failed.");
          return false;
        }

        if (audioContext.value.state === "suspended") {
          await audioContext.value.resume();
        }

        if (!devices.selectedMicrophone) {
          devices.selectedMicrophone =
            devices.microphones[0]?.deviceId ||
            devices.microphonesNoDeviceId[0] ||
            null;
        }

        const audioConstraints =
          typeof devices.selectedMicrophone === "string"
            ? { deviceId: { exact: devices.selectedMicrophone }, noiseSuppression: false, autoGainControl: false }
            : { noiseSuppression: false, autoGainControl: false };

        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });

        if (!audioContext.value) {
          console.error("AudioContext is not initialized.");
          return false;
        }

        // Set up nodes
        analyser.value = audioContext.value.createAnalyser();
        analyser.value.fftSize = fftSize.value;

        inputGainNode.value = audioContext.value.createGain();
        inputGainNode.value.gain.value = devices.inputVolume || 0.5;

        outputGainNode.value = audioContext.value.createGain();
        outputGainNode.value.gain.value = devices.outputVolume || 1.0;

        const source = audioContext.value.createMediaStreamSource(stream.value);
        const highPassFilter = audioContext.value.createBiquadFilter();
        highPassFilter.type = "highpass";
        highPassFilter.frequency.value = 50;

        source
          .connect(highPassFilter)
          .connect(inputGainNode.value)
          .connect(analyser.value)
          .connect(outputGainNode.value)
          .connect(audioContext.value.destination);

        console.log("Audio nodes initialized:", {
          analyser: !!analyser.value,
          context: audioContext.value.state,
        });

        // Register components
        devices.registerAudioContext(audioContext.value);
        devices.registerInputGainNode(inputGainNode.value);
        devices.registerOutputGainNode(outputGainNode.value);

        isInitialized.value = true;
        console.log("Audio initialized successfully");
        return true;
      } catch (error) {
        console.error("Audio initialization failed:", error);
        cannotInitialize.value = true;
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
      cannotInitialize,
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