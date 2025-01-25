<template>
  <div class="flex justify-between">
    <h1 class="text-white text-3xl">Recorder</h1>
  </div>

  <button
    type="button"
    class="text-white bg-gold font-medium rounded-lg text-sm px-10 py-4 mb-5"
    @click="audioStore.viewingHistory = true"
  >
    View History Here:
  </button>

  <div class="flex flex-col">
    <!-- Timer display -->
    <div class="text-black bg-white my-4 p-2 rounded">
      Timer: {{ formatTime(timer) }}
    </div>
  </div>
  <div class="flex w-1/6 flex-col my-2">
    <button
      class="bg-[#36C4E4] rounded-full"
      @click="startRecording"
      v-if="!isRecording"
    >
      Start Recording
    </button>
    <button
      class="bg-[#A3D10A] rounded-full"
      @click="stopRecording"
      v-if="isRecording"
    >
      Stop Recording
    </button>
  </div>

  <!-- Display recorded audio playback and download link -->
  <div v-if="audioStore.currentAudio && !isRecording">
    <h3>Recorded Audio:</h3>
    <audio
      :src="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
      controls
    ></audio>
    <a
      :href="'data:audio/wav;base64,' + audioStore.currentAudio.audio"
      download="recorded-audio.mp4"
    >
      <button class="btn btn-ghost">
        <img :src="url" class="download-icon" />
      </button>
    </a>
    <input type="text" class="text-black" v-model="audioStore.fileName" />
    <button @click="saveAudio">Rename File</button>
    <button @click="saveAudio">Save To History</button>
    <button @click="deleteAudio">Delete</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import url from "../../../public/download-button.png";
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";
const audioStore = audioFiles();
const persistedStore = persistedSettings();

const isRecording = ref(false);
const timer = ref(0);
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result.split(",")[1]; // Extract the base64 part
        audioStore.currentAudio = {
          audio: base64Audio,
          id: persistedStore.assignedID,
        }; // Store the base64 string with id
      };
      reader.readAsDataURL(audioBlob); // Convert Blob to Base64 string
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

const checkName = () => {
  if (audioStore.fileName === null) {
    audioStore.fileName = `Untitled Recording ${persistedStore.assignedID}`;
  }
};

const saveAudio = () => {
  let index = persistedStore.pastAudio.findIndex(
    (file) => file.audio === audioStore.currentAudio.audio,
  );
  if (index === Number || index === 0) {
    console.log("how the heck?? please report this. found dupe maybe");
  } else {
    console.log("creating smth new");
    let date = new Date();
    checkName();
    persistedStore.pastAudio.push({
      id: persistedStore.assignedID,
      name: audioStore.fileName.trim(),
      audio: audioStore.currentAudio.audio,
      date: date.toLocaleDateString(),
    });
    persistedStore.assignedID++;
  }
  audioStore.fileName = null;
};

const deleteAudio = () => {
  let date = new Date();
  if (
    audioStore.currentAudio.id &&
    audioStore.currentAudio.id < persistedStore.assignedID
  ) {
    console.log("how the heck?? please report this. found dupe");
  } else {
    console.log("deleting smth new");
    checkName();
    persistedStore.recentlyDeleted.push({
      id: persistedStore.assignedID,
      name: audioStore.fileName.value,
      audio: audioStore.currentAudio.audio,
      date: date.toLocaleDateString(),
      deletedDate: date.toLocaleDateString(),
    });
    persistedStore.assignedID++;
  }
  audioStore.currentAudio = null;
  audioStore.fileName = null;
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

.download-icon {
  @apply w-6 h-6; /* Use Tailwind's utility classes to set the width and height */
  object-fit: contain; /* Ensure the image maintains its aspect ratio */
}
</style>
