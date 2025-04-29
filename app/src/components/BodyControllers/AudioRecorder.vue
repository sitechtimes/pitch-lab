<template>     
    <div class="flex flex-row">
      <div class="flex flex-col items-center w-[30%]">
   
  
     
      <div class="">
        <button
        class="bg-skyblue hover:bg-[#6A0DAD] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
  
          @click="startRecording"
          v-if="!isRecording"
        >
        <img src="@/assets/buttons/microphone.webp" alt="Microphone" class="h-6 w-6" />
    <span
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-[#000000] rounded opacity-0 group-hover:opacity-100 transition-opacity"
    >
      Start Recording
    </span>
        </button>
        <button
        class="bg-[#008000] hover:bg-[#4CAF50] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
        @click="stopRecording"
          v-if="isRecording"
        >
          <img src="@/assets/buttons/microphone-disabled.webp" alt="Disabled Microphone" class="h-6 w-6 mr-2" />
          Stop Recording
        </button>
        <!-- Timer Display -->
        <div class="text-white bg-[#424242] text-center py-2 px-4 my-2 rounded-lg text-lg font-mono">
    Timer: {{ formatTime(timer) }}
        </div>
      </div>
        <button
          type="button"
          class="text-white text-center font-medium rounded-full text-sm bg-[#7210E3] p-2 w-full"
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
                class="text-[#000000] w-[full]"
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
  
            </div>
          </div>
          <div class="flex flex-col w-[50%] p-2 rounded-3xl gap-1">
  <a
    class="bg-[#4B0082] hover:bg-[#2564da] hover:scale-[1.065] hover:translate-y-[-7px] hover:rounded-[23px] hover:rounded-bl-none hover:rounded-br-none px-6 py-2 rounded-2xl rounded-bl-lg rounded-br-lg transition-all text-center text-[#d8e5f9] hover:text-[#a8c1f0] font-medium cursor-pointer"
    @click="saveAudio"
    >Download
  </a>
  <a
    class="bg-[#5350c6] hover:bg-secondary-600 hover:scale-[1.065] hover:translate-y-[7px] hover:rounded-[23px] hover:rounded-tl-none hover:rounded-tr-none px-6 py-2 rounded-2xl rounded-tl-lg rounded-tr-lg transition-all text-center text-[#d8e5f9] hover:text-[#b3aaee] font-medium cursor-pointer"
    @click="deleteAudio"
  >
  <!-- <img src="@/assets/buttons/trash-2.webp" alt="Microphone" class="mr-3" /> -->

   Delete
  </a>
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
      <div v-if="saving" class="fixed inset-0 flex justify-center mt-4 z-50">
      <div
        class="h-[5%] w-[60%] text-lg flex items-center justify-center bg-opacity-60"
        :class="{
          'bg-red': saving === 'delete',
          'bg-green': saving === 'save',
        }"
      >
        <p v-if="saving === 'delete'">Successfully Deleted!</p>
        <p v-if="saving === 'save'">Successfully Saved!</p>
      </div>
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
const selectedChannel = ref(1); // Default to stereo
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;

const startRecording = async () => {
  saving.value = null;
  try {
    // Get access to the microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: devices.selectedMicrophone?.deviceId,
        channelCount: 2, // Uses Stereo on default
        noiseSuppression: true,
        echoCancellation: true,
      },
    });

     // Create an audio context for processing
     const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    // Create a stereo panner for spatial effects
    const stereoPanner = audioContext.createStereoPanner();

       // Simulate immersive sound by panning between left and right channels
       let panValue = -1; // Start panning from the left
    setInterval(() => {
      panValue = panValue === -1 ? 1 : -1; // Alternate between left and right
      stereoPanner.pan.value = panValue;
    }, 500); // Adjust panning every half a second

    // Connect the source to the panner
    source.connect(stereoPanner);

    // Connect the panner to the destination
    const destination = audioContext.createMediaStreamDestination();
    stereoPanner.connect(destination);

    // Use the processed stream for recording
    mediaRecorder = new MediaRecorder(destination.stream);
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result.split(",")[1];
        audioStore.currentRecording = {
          audio: base64Audio,
          id: audioStore.assignedID,
        };
      };
      reader.readAsDataURL(audioBlob);
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
  }, 1500);
};
</script>

<style scoped>


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