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
    const audioElement = ref(null);
    const analyser = ref(null);
    const initializeAudio = async () => {
      try {
        cleanupAudio();

        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext created");

        if (audioContext.value.state === "suspended") {
          await audioContext.value.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: false,
            echoCancellation: false,
            autoGainControl: false,
            deviceId: persistedStore.selectedMicrophone ?
              { exact: persistedStore.selectedMicrophone } : undefined
          }
        });
        if (!audioContext.value) {
          console.error("AudioContext is not initialized.");
          return false;
        }
        analyser.value = audioContext.value.createAnalyser();
        console.log("Analyser node created:", !!analyser.value);
        console.log("Analyser node details:", {
          fftSize: analyser.value.fftSize,
          frequencyBinCount: analyser.value.frequencyBinCount,
          contextState: audioContext.value?.state,
          analyserNode: analyser.value
        });
        analyser.value.fftSize = 2048; // Reduced for better compatibility (can be made adjustable by user later)
        inputGainNode.value = audioContext.value.createGain();
        outputGainNode.value = audioContext.value.createGain();

        // Create processing chain
        const source = audioContext.value.createMediaStreamSource(stream);
        const highPassFilter = audioContext.value.createBiquadFilter();
        highPassFilter.type = "highpass";
        highPassFilter.frequency.value = 50;

        // Connect nodes
        source
          .connect(highPassFilter)
          .connect(inputGainNode.value)
          .connect(analyser.value)
          .connect(outputGainNode.value)
          .connect(audioContext.value.destination);

        console.log("Audio nodes initialized:", {
          analyser: !!analyser.value,
          context: audioContext.value.state
        });

        return true;
      } catch (error) {
        console.error("Audio initialization failed:", error);
        cleanupAudio();
        if (audioContext.value || analyser.value) {
          console.error("Cleanup failed to reset AudioContext or Analyser.");
          return false;
        }
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

    const updateOutputDevice = async (deviceId) => {
      try {
        if (!audioElement.value) {
          audioElement.value = new Audio();
        }

        // Feature detection
        if (typeof audioElement.value.setSinkId === 'function') {
          await audioElement.value.setSinkId(deviceId);
          persistedStore.selectedSpeaker = deviceId;
        } else {
          console.warn('setSinkId not supported, using default speaker');
          persistedStore.selectedSpeaker = 'default';
        }
      } catch (error) {
        console.error("Error setting output device:", error);
      }
    };

    const updateInputDevice = async (deviceId) => {
      try {
        if (audioContext.value) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: deviceId } }
          });

          // Create new source and connect to gain node
          const mediaStreamSource = audioContext.value.createMediaStreamSource(stream);
          mediaStreamSource.connect(inputGainNode.value);

          persistedStore.selectedMicrophone = deviceId;
        }
      } catch (error) {
        console.error("Error setting input device:", error);
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
          stream.getTracks().forEach(track => track.stop());
        }

        const devices = await navigator.mediaDevices.enumerateDevices();

        // Firefox workaround for speaker labels
        if (navigator.userAgent.includes('Firefox')) {
          microphones.value = devices.filter(d => d.kind === 'audioinput');
          speakers.value = [{ deviceId: 'default', label: 'Default Speaker' }];
        } else {
          microphones.value = devices.filter(d => d.kind === 'audioinput');
          speakers.value = devices.filter(d => d.kind === 'audiooutput');
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
      initializeAudio,
      showSettingsModal,
      selectedNote,
      updateOutputDevice,
      updateInputDevice,
      setInputVolume,
      setOutputVolume,
      cleanupAudio,
      getDevices,
      analyser // Add analyser to the returned state
    };
  },
  {
    persist: {
      paths: ['inputVolume', 'outputVolume']
    }
  },
);