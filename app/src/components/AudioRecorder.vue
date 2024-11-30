<template>
  <div class="flex justify-between">
    <div>
      <h1 class="text-white text-3xl">Recorder</h1>
      <div class="mt-6">
        <label for="note-selection" class="text-gray-400 mr-4">Tune to:</label>
        <select class="bg-gray-700 text-white p-2 rounded">
          History
        </select>
      </div>
    </div>
    <div class="flex w-[30%] flex-col my-2">
      <button
        class="bg-[#36C4E4] rounded-full"
        @click="startRecording"
        :disabled="isRecording"
      >
        Start Recording
      </button>
      <button
        class="bg-[#A3D10A] rounded-full"
        @click="stopRecording"
        :disabled="!isRecording"
      >
        Stop Recording
      </button>
    </div>

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
import { ref } from "vue";

const isRecording = ref(false);
const audioUrl = ref(null);
let mediaRecorder = null;
let audioChunks = [];

const pastHistory = {};

const startRecording = async () => {
  try {
    // Get access to the microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      audioUrl.value = URL.createObjectURL(audioBlob); // Create audio URL for playback
    };

    // Start recording
    mediaRecorder.start();
    isRecording.value = true;
  } catch (err) {
    console.error("Error accessing microphone:", err);
    alert("Could not access microphone. Please check permissions.");
  }
};

// Stop recording function
const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    isRecording.value = false;
  }
};
</script>

<style scoped>
button {
  margin: 10px;
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
