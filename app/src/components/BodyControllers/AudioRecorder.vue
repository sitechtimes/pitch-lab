<template>
  <div class="flex flex-row">
    <div class="flex flex-col items-center w-[30%]">
      <!-- Channel Selection -->
      <div class="mb-4">
        <label for="channel" class="block text-white text-sm mb-2">Channel:</label>
        <select
          id="channel"
          v-model="selectedChannel"
          class="select select-bordered w-full bg-tuner-bg text-white border-purple focus:ring-purple"
        >
          <option value="1">Mono</option>
          <option value="2">Stereo</option>
        </select>
      </div>

      <!-- Timer display -->
    <div class="">
      <button
      class="bg-skyblue :bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"

        @click="startRecording"
        v-if="!isRecording"
      >
      <img src="@/assets/buttons/microphone.webp" alt="Microphone" class="h-6 w-6" />
  <span
    class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity"
  >
    Start Recording
  </span>
      </button>
      <button
      class="bg-green hover:bg-#4CAF50] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
      @click="stopRecording"
        v-if="isRecording"
      >
        <img src="@/assets/buttons/microphone-disabled.webp" alt="Disabled Microphone" class="h-6 w-6 mr-2" />
        Stop Recording
      </button>

      <div class="text-white bg-[#424242] text-center py-2 px-4 rounded-lg text-lg font-mono">
  Timer: {{ formatTime(timer) }}
      </div>
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
    <div v-if="audioStore.currentRecording && !isRecording" class="w-full flex items-center justify-center">
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
              :src="'data:audio/mp4;base64,' + audioStore.currentRecording.audio"
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
                :href="'data:audio/mp4;base64,' + audioStore.currentRecording.audio"
                :download="audioStore.fileName ? audioStore.fileName + '.mp4' : 'recorded-audio.mp4'"
              >
                Download
              </a>
            </div>
            <!-- <button
  type="submit"
  class="flex justify-center gap-2 items-center mx-auto shadow-xl text-lg bg-gray-50 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
>
  Explore
  <svg
    class="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
    viewBox="0 0 16 19"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
      class="fill-gray-800 group-hover:fill-gray-800"
    ></path>
  </svg>
</button> -->
          </div>
        </div>

        <div class="flex flex-col justify-between">
          <button
            class="bg-[#2A4296] rounded-full p-2 text-[#A3D10A] w-full flex items-center justify-center"
            @click="saveAudio"
          >
            <img src="@/assets/buttons/save.webp" alt="Microphone" class="mr-1" />
            Save to history
          </button>
          <button
            class="bg-[#2A4296] rounded-full p-2 text-[#A3D10A] w-full flex items-center justify-center"
            @click="deleteAudio"
          >
            <img src="@/assets/buttons/trash-2.webp" alt="Microphone" class="mr-3" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Placeholder message when there is no recording -->
    <div v-else class="w-full flex items-center justify-center">
      <div class="w-[70%]">
        <p class="text-xl text-center w-full">
          No recorded audio available. Please start recording to see playback and
          download options.
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
const selectedChannel = ref(1); // Default to mono
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;

const startRecording = async () => {
  saving.value = null;
  try {
    // Get access to the microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceID: devices.selectedMicrophone,
        channelCount: selectedChannel.value, // Use selected channel count
      },
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