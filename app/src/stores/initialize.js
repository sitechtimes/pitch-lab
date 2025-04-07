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
          devices.selectedMicrophone =
            devices.microphonesWithDeviceId[0] ||
            devices.microphonesNoDeviceId[0] ||
            null;
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

        console.log("Audio constraints:", audioConstraints);
        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });

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

        source.value = audioContext.value.createMediaStreamSource(stream.value);
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

        devices.registerAudioContext(audioContext.value);
        devices.registerInputGainNode(inputGainNode.value);
        devices.registerOutputGainNode(outputGainNode.value);

        isInitialized.value = true;
        console.log("Audio initialized successfully");
        setTimeout(() => {
          console.log("AFTER INIT:", {
            context: audioContext.value,
            analyser: analyser.value,
            source: source.value,
          });
        }, 10000);

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
      source,
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