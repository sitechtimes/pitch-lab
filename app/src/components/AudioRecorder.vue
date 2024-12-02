<template>
  <div class="flex justify-between">
    <div>
      <h1 class="text-white text-3xl">Recorder</h1>
      <div class="mt-6">
        <label for="note-selection" class="text-gray-400 mr-4">History</label>
        <select class="bg-gray-700 text-white p-2 rounded">
          History
        </select>
      </div>
    </div>
    <div class="flex flex-col">
      <!-- Timer display -->
      <div class="text-black bg-white my-4 p-2 rounded">
        Timer: {{ formatTime(timer) }}
      </div>
      <div class="bg-[#120E1D] rounded-full text-white flex justify-between">
        <p>HIIII</p>
        <p>HIIII</p>
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
  <!-- Timer section -->
</template>

<script setup>
import { ref } from "vue";

const isRecording = ref(false);
const audioUrl = ref(null);
const timer = ref(0);
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;

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
    startTimer();
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
    stopTimer();
  }
};

const startTimer = () => {
  timer.value = 0;
  timerInterval = setInterval(() => {
    timer.value++;
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerInterval);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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
}

.text-black {
  color: black;
}

.bg-white {
  background-color: white;
}
</style>
