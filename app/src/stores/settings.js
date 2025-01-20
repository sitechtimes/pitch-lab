import { ref } from "vue";
import { defineStore } from "pinia";
import { persistedSettings } from "./persistedStore";

export const settingsStore = defineStore(
  "settings",
  () => {
    const persistedStore = persistedSettings();

    const microphones = ref([]);
    const speakers = ref([]);
    const showModal = ref(false);

    const inputVolume = ref(0.5); // Microphone volume

    let audioContext = null;
    let micStream = null;
    let inputGainNode = null;
    let audioElement = null;
    let sourceNode = null;

    // Fetch devices
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      microphones.value = devices.filter(
        (device) => device.kind === "audioinput",
      );
      speakers.value = devices.filter(
        (device) => device.kind === "audiooutput",
      );
    };

    // Initialize audio context and gain nodes
    const initializeAudio = async () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Set up input (microphone)
        if (persistedStore.selectedMicrophone) {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: selectedMicrophone.value },
          });
          const micSource = audioContext.createMediaStreamSource(micStream);
          inputGainNode = audioContext.createGain();
          micSource.connect(inputGainNode).connect(audioContext.destination);
          inputGainNode.gain.value = inputVolume.value;
        }

        // Set up output (speaker)
        audioElement = new Audio("your-audio-file.mp3");
        sourceNode = audioContext.createMediaElementSource(audioElement);
      }
    };

    // Update input (microphone) volume
    const setInputVolume = (volume) => {
      inputVolume.value = Number(volume);
      if (inputGainNode) {
        inputGainNode.gain.value = Number(volume);
      }
    };

    const playAudio = () => {
      if (audioElement) {
        audioContext.resume();
        audioElement.play();
      }
    };

    const pauseAudio = () => {
      if (audioElement) {
        audioElement.pause();
      }
    };

    return {
      microphones,
      speakers,
      showModal,
      inputVolume,
      getDevices,
      setInputVolume,
      initializeAudio,
      playAudio,
      pauseAudio,
    };
  },
  {
    persist: {
      enabled: false, // dont persist this store
    },
  },
);
