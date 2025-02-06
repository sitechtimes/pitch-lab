<template>
<div class="flex flex-row justify-between">
  <div>
    <!-- Timer display -->  
    <button
    type="button"
    class="text-white text-center bg-gold font-medium rounded-lg text-sm"
    @click="(audioStore.viewingHistory = true), (saving = null)"
  >
    View History Here:
  </button>
    <div class="text-black bg-white text-center p-2 rounded">
      Timer: {{ formatTime(timer) }}
    </div>

    <button
      class="bg-[#36C4E4] rounded-full p-2"
      @click="startRecording"
      v-if="!isRecording" 
    >
      Start Recording
    </button>
    <button
      class="bg-[#A3D10A] rounded-full p-2"
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
      Download
    </a>
    <input
      id="name"
      type="text"
      class="text-black"
      v-model="audioStore.fileName"
      placeholder="Name File"
    />
    <button @click="saveAudio">Save To History</button>
    <button @click="deleteAudio">Delete</button>      

  </div>

  <!-- Placeholder message when there is no recording -->
  <div v-else class="w-[60%]">
    <p class="text-lg">No recorded audio available. Please start recording to see playback and download options.</p>
  </div>
  <div v-if="saving">
    <button @click="saving = null">x</button>
    <p v-if="saving === 'delete'">Successfully Deleted!</p>
    <p v-if="saving === 'save'">Successfully Saved!</p>
  </div>
</div>
</template>

<script setup>
import { ref } from "vue";
import { audioFiles } from "@/stores/audioFiles";
import { persistedSettings } from "@/stores/persistedStore";
const audioStore = audioFiles();
const persistedStore = persistedSettings();

const saving = ref(null);
const isRecording = ref(false);
const timer = ref(0);
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;

const startRecording = async () => {
  saving.value = null;
  try {
    // Get access to the microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceID: persistedStore.selectedMicrophone },
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
const triggerFadeOut = () => {
  isFading = true;
  setTimeout(() => {
    isFading = false;
    saving.value = null;
  }, 500);
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
  audioStore.currentAudio = null;
  audioStore.fileName = null;
  saving.value = "save";
  timer.value = 0;
  autoDisappear();
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
  saving.value = "delete";
  timer.value = 0;
  autoDisappear();
};

const autoDisappear = () => {
  setTimeout(() => {
    saving.value = null;
  }, 3000);
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


.close-button {
  background: none;
  border: none;
  font-size: 20px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.fade-out {
  opacity: 0;
}


</style>