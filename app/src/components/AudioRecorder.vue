<template>
  <div>
    <h1>Audio Recorder</h1>

    <button @click="startRecording" :disabled="isRecording">
      Start Recording
    </button>
    <button @click="stopRecording" :disabled="!isRecording">
      Stop Recording
    </button>

    <!-- Display recorded audio playback and download link -->
    <div v-if="audioUrl">
      <h3>Recorded Audio:</h3>
      <audio :src="audioUrl" controls></audio>
      <a :href="audioUrl" download="recorded-audio.wav">
        <button>Download Recording</button>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { settingsStore } from "@/stores/settings";

const settings = settingsStore();
const isRecording = ref(false);
const audioUrl = ref(null);
const inputVolume = ref(settings.inputVolume);
const outputVolume = ref(settings.outputVolume);

let mediaRecorder = null;
let audioChunks = [];
let audioContext = null;
let inputGainNode = null;
let outputGainNode = null;
let microphoneSource = null;

watch(inputVolume, (newVolume) => {
  if (inputGainNode) {
    inputGainNode.gain.value = newVolume;
  }
});

watch(outputVolume, (newVolume) => {
  if (outputGainNode) {
    outputGainNode.gain.value = newVolume;
  }
});

const startRecording = async () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();

      inputGainNode = audioContext.createGain();
      outputGainNode = audioContext.createGain();

      inputGainNode.gain.value = settings.inputVolume;
      outputGainNode.gain.value = settings.outputVolume;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    microphoneSource = audioContext.createMediaStreamSource(stream);
    microphoneSource.connect(inputGainNode);
    inputGainNode.connect(audioContext.destination);

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      audioUrl.value = URL.createObjectURL(audioBlob);
      settings.pastAudio.push(audioUrl.value);
    };

    mediaRecorder.start();
    isRecording.value = true;
  } catch (err) {
    console.error("Error accessing microphone:", err);
    alert("Could not access microphone. Please check permissions.");
  }
};

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    isRecording.value = false;
  }

  if (microphoneSource) {
    microphoneSource.disconnect();
  }
};
</script>

<style scoped>
button {
  margin: 10px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

audio {
  margin-top: 10px;
  display: block;
}

a {
  margin-top: 10px;
  display: inline-block;
}
</style>
