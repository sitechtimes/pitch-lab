import { ref } from "vue";
import { defineStore } from "pinia";

export const settingsStore = defineStore("settings", () => {
  const microphones = ref([]);
  const speakers = ref([]);
  const selectedMicrophone = ref(null);
  const selectedSpeaker = ref(null);
  const showModal = ref(false);

  const inputVolume = ref(0.5); // Microphone volume
  const outputVolume = ref(0.5); // Speaker volume

  let audioContext = null;
  let micStream = null;
  let inputGainNode = null;
  let outputGainNode = null;
  let audioElement = null;
  let sourceNode = null;

  // Fetch devices
  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    microphones.value = devices.filter(
      (device) => device.kind === "audioinput",
    );
    speakers.value = devices.filter((device) => device.kind === "audiooutput");
  };

  // Initialize audio context and gain nodes
  const initializeAudio = async () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Set up input (microphone)
      if (selectedMicrophone.value) {
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
      outputGainNode = audioContext.createGain();
      sourceNode.connect(outputGainNode).connect(audioContext.destination);
      outputGainNode.gain.value = outputVolume.value;
    }
  };

  // Update input (microphone) volume
  const setInputVolume = (volume) => {
    inputVolume.value = volume;
    if (inputGainNode) {
      inputGainNode.gain.value = volume;
    }
  };

  // Update output (speaker) volume
  const setOutputVolume = (volume) => {
    outputVolume.value = volume;
    if (outputGainNode) {
      outputGainNode.gain.value = volume;
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
    selectedMicrophone,
    selectedSpeaker,
    showModal,
    inputVolume,
    outputVolume,
    getDevices,
    setInputVolume,
    setOutputVolume,
    initializeAudio,
    playAudio,
    pauseAudio,
  };
});
