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
    const inputGainNode = ref(null)
    const outputGainNode = ref(null)
    const mediaStreamDestination = ref(null)
    const audioElement = ref(null)


    // stores/settings.js
    // settings.js - Update initializeAudio
    const initializeAudio = async () => {
      if (!audioContext.value) {
        try {
          // Create context after user interaction
          audioContext.value = new (window.AudioContext || window.webkitAudioContext)();

          // Resume if suspended (iOS/Safari fix)
          if (audioContext.value.state === 'suspended') {
            await audioContext.value.resume();
          }

          // Initialize nodes
          mediaStreamDestination.value = audioContext.value.createMediaStreamDestination();
          audioElement.value = new Audio();

          // Create proper audio routing
          const mediaElementSource = audioContext.value.createMediaElementSource(audioElement.value);
          inputGainNode.value = audioContext.value.createGain();
          outputGainNode.value = audioContext.value.createGain();

          // Connect nodes: Source → Input Gain → Output Gain → Destination
          mediaElementSource.connect(inputGainNode.value);
          inputGainNode.value.connect(outputGainNode.value);
          outputGainNode.value.connect(mediaStreamDestination.value);

          return true;
        } catch (error) {
          console.error("AudioContext creation failed:", error);
          audioContext.value = null;
          return false;
        }
      }
      return true;
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
      }
    };

    const setOutputVolume = (volume) => {
      outputVolume.value = Number(volume);
      persistedStore.outputVolume = Number(volume);
      if (outputGainNode.value) {
        outputGainNode.value.gain.value = Number(volume);
      }
    };

    // Cleanup
    const cleanupAudio = () => {
      if (audioContext.value) {
        audioContext.value.close();
        audioContext.value = null;
      }
      mediaStreamDestination.value = null;
      audioElement.value = null;
    };

    const getDevices = async () => {
      try {
        // Only request mic permission if needed
        if (!persistedStore.selectedMicrophone) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      getDevices
    };
  },
  {
    persist: {
      paths: ['inputVolume', 'outputVolume']
    }
  },
);
