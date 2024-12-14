<template>
  <div class="flex justify-between">
    <div>
      <h1 class="text-white text-3xl">Recorder</h1>
      <div class="mt-6">
        <label for="note-selection" class="text-gray-400 mr-4">History</label>
        <select
          class="bg-gray-700 text-white p-2 rounded"
          v-model="currentAudio"
          @click="checkAudio"
        >
          History
          <option
            v-for="file in store.pastAudio"
            :key="file.id"
            :value="{ audio: file.audio, id: file.id }"
          >
            {{ file.name }} recorded on {{ file.date }}
          </option>
        </select>
      </div>
    </div>
    <div class="flex flex-col">
      <!-- Timer display -->
      <div class="text-black bg-white my-4 p-2 rounded">
        Timer: {{ formatTime(timer) }}
      </div>
    </div>
    <div class="flex w-[30%] flex-col my-2">
      <button
        class="bg-[#36C4E4] rounded-full"
        @click="startRecording"
        v-if="!isRecording && !viewingHistory"
      >
        Start Recording
      </button>
      <button
        class="bg-[#A3D10A] rounded-full"
        @click="stopRecording"
        v-if="isRecording && !viewingHistory"
      >
        Stop Recording
      </button>
    </div>

    <!-- Display recorded audio playback and download link -->
    <div v-if="currentAudio && !isRecording">
      <h3>Recorded Audio:</h3>
      <audio
        :src="'data:audio/wav;base64,' + currentAudio.audio"
        controls
      ></audio>
      <a
        :href="'data:audio/wav;base64,' + currentAudio.audio"
        download="recorded-audio.wav"
      >
        <button>Download Recording</button>
      </a>
      <input type="text" v-model="fileName" />
      <button @click="saveAudio" v-if="viewingHistory">Rename File</button>
      <button
        @click="
          () => {
            viewingHistory = false;
            currentAudio = null;
          }
        "
        v-if="viewingHistory"
      >
        Exit History
      </button>
      <button @click="saveAudio" v-if="!viewingHistory">Save To History</button>
      <button @click="deleteAudio">Delete</button>
    </div>
  </div>
  <!-- Timer section -->
</template>

<script setup>
import { ref } from "vue";
import { settingsStore } from "@/stores/settings";
const store = settingsStore();

const fileName = ref(null);
const currentAudio = ref(null);
const isRecording = ref(false);
const timer = ref(0);
const viewingHistory = ref(false);
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
        currentAudio.value = { audio: base64Audio, id: store.assignedID }; // Store the base64 string with id
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

const checkAudio = () => {
  if (currentAudio.value) {
    viewingHistory.value = true;
  }
};

const saveAudio = () => {
  let index;
  if (
    (index = store.pastAudio.findIndex(
      (file) => file.audio === currentAudio.value,
    )) !== -1
  ) {
    console.log("found dupe maybe");
    if (fileName.value.trim() !== null && undefined) {
      store.pastAudio[index].name = fileName.value;
    }
  } else {
    console.log("creating smth new");
    let date = new Date();

    if (fileName.value !== null) {
    } else {
      fileName.value = `Untitled Recording ${store.assignedID}`;
    }

    store.pastAudio.push({
      id: store.assignedID,
      name: fileName.value.trim(),
      audio: currentAudio.value.audio,
      date: date.toLocaleDateString(),
    });
    store.assignedID = store.assignedID + 1;
  }
  fileName.value = null;
};

const deleteAudio = () => {
  let index;
  console.log(currentAudio.value.id);
  if (
    currentAudio.value.id ||
    (currentAudio.value.id === 0 && currentAudio.value.id < store.assignedID)
  ) {
    console.log("found it");
    index = store.pastAudio.findIndex((file) => file.id === currentAudio.id);
    store.recentlyDeleted.push(store.pastAudio[index]);
    store.pastAudio.splice(index, 1);
  } else {
    console.log("deleting smth new");
    let date = new Date();
    store.recentlyDeleted.push({
      id: store.assignedID,
      name: fileName.value,
      audio: currentAudio.value,
      date: date.toLocaleDateString(),
    });
  }
  currentAudio.value = null;
  viewingHistory.value = false;
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
