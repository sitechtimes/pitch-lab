import { ref } from "vue";
import { defineStore } from "pinia";
import { persistedSettings } from "./persistedStore";

export const settingsStore = defineStore(
  "settings",
  () => {
    const persistedStore = persistedSettings();

    const microphones = ref([]);
    const speakers = ref([]);
    const showSettingsModal = ref(false);
    const selectedNote = ref(persistedStore.defaultNote);
    const inputVolume = ref(0.5); // Microphone volume

    let audioContext = null;
    let micStream = null;
    let inputGainNode = null;
    let audioElement = null;
    let sourceNode = null;

    // Initialize audio context and gain nodes
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
            audio: { deviceId: persistedStore.selectedMicrophone },
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
      showSettingsModal,
      selectedNote,
      inputVolume,
      getDevices,
      setInputVolume,
      initializeAudio,
      playAudio,
      pauseAudio,
    };
  },
  {
    persist: false,
  },
);
