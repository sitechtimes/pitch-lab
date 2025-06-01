<template>
  <div class="flex flex-row">
    <div class="flex flex-col items-center w-[30%]">
      <!-- Timer display -->
      <button
        class="bg-[#36C4E4] rounded-full p-2 w-full flex items-center justify-center"
        @click="startRecording"
        v-if="!isRecording"
      >
        <img
          src="@/assets/buttons/microphone.webp"
          alt="Microphone"
          class="h-6 w-6 mr-2"
        />
        Start Recording
      </button>
      <button
        class="bg-[#A3D10A] rounded-full p-2 w-full flex items-center justify-center"
        @click="stopRecording"
        v-if="isRecording"
      >
        <img
          src="@/assets/buttons/microphone-disabled.webp"
          alt="Disabled Microphone"
          class="h-6 w-6 mr-2"
        />
        Stop Recording
      </button>

      <div class="text-black bg-white text-center p-2 rounded-full w-full">
        Timer: {{ formatTime(timer) }}
      </div>
      <button
        type="button"
        class="text-white text-center bg-gold font-medium rounded-full text-sm bg-purple p-2 w-full"
        @click="
          (audioStore.showHistoryModal = true),
            (saving = null),
            (audioStore.showDeletedModal = false)
        "
      >
        Saved Recordings
      </button>
    </div>

    <!-- Display recorded audio playback and download link -->
    <div
      v-if="audioStore.currentRecording && !isRecording"
      class="w-full flex items-center justify-center"
    >
      <div class="flex flex-row justify-between w-[85%]">
        <div>
          <div>
            <h3>Recorded Audio:</h3>
          </div>

          <div :key="audioStore.currentRecording.id">
            <audio
              ref="audioElement"
              id="audio"
              controls
              :src="
                'data:audio/mp4;base64,' + audioStore.currentRecording.audio
              "
            ></audio>
          </div>
          <div class="w-[90%] mt-2 flex flex-row justify-between">
            <input
              id="name"
              type="text"
              class="text-black w-[full]"
              v-model="audioStore.fileName"
              placeholder="Name File"
            />

            <div>
              <a
                :href="
                  'data:audio/mp4;base64,' + audioStore.currentRecording.audio
                "
                :download="
                  audioStore.fileName
                    ? audioStore.fileName + '.mp4'
                    : 'recorded-audio.mp4'
                "
              >
                Download
              </a>
            </div>
          </div>
        </div>

        <div class="flex flex-col justify-between">
          <button
            class="bg-[#2A4296] rounded-full p-2 text-[#A3D10A] w-full flex items-center justify-center"
            @click="saveAudio"
          >
            <img
              src="@/assets/buttons/save.webp"
              alt="Microphone"
              class="mr-1"
            />
            Save to history
          </button>
          <button
            class="bg-[#2A4296] rounded-full p-2 text-[#A3D10A] w-full flex items-center justify-center"
            @click="deleteAudio"
          >
            <img
              src="@/assets/buttons/trash-2.webp"
              alt="Microphone"
              class="mr-3"
            />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Placeholder message when there is no recording -->
    <div v-else class="w-full flex items-center justify-center">
      <div class="w-[70%]">
        <p class="text-xl text-center w-full">
          No recorded audio available. Please start recording to see playback
          and download options.
        </p>
      </div>
    </div>
    <div v-if="saving" class="w-full">
      <button @click="saving = null">x</button>
      <p v-if="saving === 'delete'">Successfully Deleted!</p>
      <p v-if="saving === 'save'">Successfully Saved!</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { audioFilesStore } from "@/stores/audioFiles";
import { devicesStore } from "@/stores/devices";
const audioStore = audioFilesStore();
const devices = devicesStore();

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
      audio: { deviceID: devices.selectedMicrophone },
    });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result.split(",")[1]; // Extract base64 part
        audioStore.currentRecording = {
          audio: base64Audio,
          id: audioStore.assignedID,
        }; // Store base64 string with id
      };
      reader.readAsDataURL(audioBlob); // Convert Blob to Base64
    };

    // Start recording
    mediaRecorder.start();
    isRecording.value = true;
    startTimer();
    audioChunks = [];
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
  if (audioStore.fileName === null || audioStore.fileName.trim() === "") {
    audioStore.fileName = `Untitled Recording ${audioStore.assignedID}`;
  }
};

const saveAudio = () => {
  let index = audioStore.audioHistory.findIndex(
    (file) => file.audio === audioStore.currentRecording.audio,
  );
  if (index !== -1) {
    console.log("Duplicate audio found, not saving.");
  } else {
    console.log("Saving new audio");
    let date = new Date();
    checkName();
    audioStore.audioHistory.push({
      id: audioStore.assignedID,
      name: audioStore.fileName.trim(),
      audio: audioStore.currentRecording.audio,
      date: date.toLocaleDateString(),
    });
    audioStore.assignedID++;
  }
  audioStore.currentRecording = null;
  audioStore.fileName = null;
  saving.value = "save";
  timer.value = 0;
  autoDisappear();
};

const deleteAudio = () => {
  audioStore.currentRecording = null;
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
