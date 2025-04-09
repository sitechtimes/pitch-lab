import { ref } from "vue";
import { defineStore } from "pinia";
import { devicesStore } from "./devices";

export const initializeStore = defineStore(
  "initializeStore",
  () => {
    const devices = devicesStore();

    const audioContext = ref(null);
    const analyser = ref(null);
    const stream = ref(null);
    const source = ref(null);
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

        if (
          !devices.microphonesWithDeviceId &&
          !devices.microphonesNoDeviceId
        ) {
          console.log("microphones" + devices.microphonesWithDeviceId, devices.microphonesNoDeviceId)
          await devices.getDevices();
        }


        if (!devices.selectedMicrophone) {
          console.warn("No microphone available");
          noMicrophones.value = true;
          return false;
        }

        if (!devices.selectedSpeaker) {
          console.warn("No speaker available");
          noSpeakers.value = true;
        }

        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
        if (!audioContext.value) {
          console.error("AudioContext creation failed.");
          return false;
        }

        if (audioContext.value.state === "suspended") {
          await audioContext.value.resume();
        }

        const audioConstraints =
          devices.selectedMicrophone?.deviceId && devices.selectedMicrophone.deviceId !== ""
            ? {
              deviceId: { exact: devices.selectedMicrophone.deviceId },
              noiseSuppression: false,
              autoGainControl: false,
            }
            : {
              noiseSuppression: false,
              autoGainControl: false,
            };

        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });
        registerStream(stream.value);

        if (!audioContext.value) {
          console.error("AudioContext is not initialized.");
          return false;
        }

        analyser.value = audioContext.value.createAnalyser();
        analyser.value.fftSize = fftSize.value;

        inputGainNode.value = audioContext.value.createGain();
        inputGainNode.value.gain.value = devices.inputVolume || 0.5;

        outputGainNode.value = audioContext.value.createGain();
        outputGainNode.value.gain.value = devices.outputVolume || 1.0;

        const sourceNode = audioContext.value.createMediaStreamSource(stream.value);
        registerSourceNode(sourceNode);

        const highPassFilter = audioContext.value.createBiquadFilter();
        highPassFilter.type = "highpass";
        highPassFilter.frequency.value = 50;

        source.value
          .connect(highPassFilter)
          .connect(inputGainNode.value)
          .connect(analyser.value)
          .connect(outputGainNode.value)
          .connect(audioContext.value.destination);

        console.log("Audio nodes initialized:", {
          analyser: analyser.value,
          context: audioContext.value.state,
        });

        registerAudioContext(audioContext.value);
        registerInputGainNode(inputGainNode.value);
        registerOutputGainNode(outputGainNode.value);

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

    const registerAudioContext = (context) => {
      console.log("Registering AudioContext", context);
      audioContext.value = context;
    };

    const registerInputGainNode = (node) => {
      console.log("Registering Input Gain Node", node);
      inputGainNode.value = node;
    };
    const registerOutputGainNode = (node) => {
      console.log("Registering Output Gain Node:", node);
      outputGainNode.value = node;
    };

    const registerStream = (mediaStream) => {
      console.log("Registering MediaStream:", mediaStream);
      stream.value = mediaStream;
    };

    const registerSourceNode = (sourceNode) => {
      console.log("Registering Source Node:", sourceNode);
      source.value = sourceNode;
    };

    return {
      audioContext,
      inputGainNode,
      outputGainNode,
      stream,
      source,
      analyser,
      initializeAudio,
      isInitialized,
      fftSize,
      cannotInitialize,
      noMicrophones,
      noSpeakers,
      registerAudioContext,
      registerInputGainNode,
      registerOutputGainNode,
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