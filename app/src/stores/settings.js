import { ref } from "vue";
import { defineStore } from "pinia";

export const settingsStore = defineStore("settings", () => {
  const microphones = ref([]);
  const speakers = ref([]);
  const selectedMicrophone = ref(null);
  const selectedSpeaker = ref(null);
  const showModal = ref(false);

  // Fetch available devices
  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    microphones.value = devices.filter(
      (device) => device.kind === "audioinput",
    );
    speakers.value = devices.filter((device) => device.kind === "audiooutput");
  };

  // Method to update microphone
  const updateMicrophone = (deviceId) => {
    selectedMicrophone.value = deviceId;
  };

  // Method to update speaker
  const updateSpeaker = (deviceId) => {
    selectedSpeaker.value = deviceId;
  };

  // Method to show or hide modal
  const toggleModal = () => {
    showModal.value = !showModal.value;
  };

  return {
    microphones,
    speakers,
    selectedMicrophone,
    selectedSpeaker,
    showModal,
    getDevices,
    updateMicrophone,
    updateSpeaker,
    toggleModal,
  };
});
