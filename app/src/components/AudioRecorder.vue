<template>
  <div class="p-8 px-24 border-white border-2 rounded-[25px]">
    <h1 class="text-white">Audio Recorder</h1>

    <button
      class="m-[10px] p-[10px] text-[16px] cursor-pointer border-2 border-white rounded-[25px] bg-white text-black align-middle"
      @click="startRecording"
      :disabled="isRecording"
    >
      Start Recording
    </button>
    <button
      class="m-[10px] p-[10px] text-[16px] cursor-pointer border-2 border-white rounded-[25px] bg-white text-black align-middle"
      @click="stopRecording"
      :disabled="!isRecording"
    >
      Stop Recording
    </button>

    <!-- Display recorded audio playback and download link -->
    <div v-if="audioUrl">
      <h3>Recorded Audio:</h3>
      <audio :src="audioUrl" controls></audio>
      <a
        class="m-[10px] p-[10px] text-[16px] cursor-pointer border-2 border-white rounded-[25px] bg-white text-black align-middle"
        :href="audioUrl"
        download="recorded-audio.wav"
      >
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
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

audio {
  margin-top: 10px;
  display: block;
}
</style>
