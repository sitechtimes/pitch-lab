<template>
  <div class="flex flex-row items-center">
    <div class="flex flex-col items-center w-[30%]">
      <div class="flex flex-row items-center justify-between w-full">
        <button
          class="bg-skyblue text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
          @click="startRecording"
          v-if="!isRecording"
        >
          <img
            src="@/assets/buttons/microphone.webp"
            alt="Microphone"
            class="h-6 w-6"
          />
        </button>
        <button
          class="bg-green text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
          @click="stopRecording"
          v-if="isRecording"
        >
          <img
            src="@/assets/buttons/microphone-disabled.webp"
            alt="Disabled Microphone"
            class="h-6 w-6"
          />
        </button>
        <!-- Timer Display -->
        <div
          class="text-black bg-white w-[60%] text-center py-2 px-4 my-2 rounded-lg text-lg font-mono"
        >
          {{ formatTime(timer) }}
        </div>
      </div>

      <button
        class="overflow-hidden relative w-full p-2 text-center bg-purple text-white border-none rounded-md text-xl font-bold cursor-pointer z-10 group"
        @click="
          (audioStore.showHistoryModal = true),
            (saving = null),
            (audioStore.showDeletedModal = false)
        "
      >
        Recordings
        <span
          class="absolute w-36 h-32 -top-8 -left-2 bg-white rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"
        ></span>
        <span
          class="absolute w-36 h-32 -top-8 -left-2 bg-darl-blue rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"
        ></span>
        <span
          class="absolute w-36 h-32 -top-8 -left-2 bg-green rotate-12 transform scale-x-0 group-hover:scale-x-50 transition-transform group-hover:duration-1000 duration-500 origin-left"
        ></span>
        <span
          class="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute top-2.5 left-6 z-10"
          >View Recordings</span
        >
      </button>
    </div>

    <!-- Display recorded audio playback and download link -->
    <div
      v-if="audioStore.currentRecording && !isRecording"
      class="w-full flex items-center justify-center"
    >
      <div class="flex flex-row w-[85%]">
        <div>
          <div :key="audioStore.currentRecording.id">
            <audio
              ref="audioElement"
              id="audio"
              controls
              :src="
                'data:audio/mp4;base64,' + audioStore.currentRecording.audio
              "
              class="mt-2 block"
            ></audio>
          </div>
          <div class="w-full mt-2 flex flex-row justify-between">
            <input
              id="name"
              type="text"
              class="relative bg-[#F8F8F8] ring-0 outline-none border border-[#808080] text-[#1A1A1A] placeholder-[#8A2BE2] text-sm rounded-lg focus:ring-[#8A2BE2] focus:border-[#8A2BE2] block w-[60%] p-2"
              placeholder="Name File..."
            />
            <div
              class="bg-purple text-white font-bold py-2 px-5 rounded-lg shadow-md transition disabled:opacity-50"
            >
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
        <div class="flex flex-col w-[50%] p-2 rounded-3xl gap-2 ml-3">
          <button
            class="flex items-center justify-center gap-2 bg-purple mt-2 px-6 py-2 rounded-2xl rounded-bl-lg rounded-br-lg text-center text-white font-medium cursor-pointer"
            @click="saveAudio"
            type="button"
          >
            <img src="@/assets/buttons/save.webp" alt="Save" class="w-6 h-6" />
            <span class="hidden sm:inline">Save</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-darl-blue mt-2 px-6 py-2 rounded-2xl rounded-tl-lg rounded-tr-lg text-center text-white font-medium cursor-pointer"
            @click="deleteAudio"
            type="button"
          >
            <img
              src="@/assets/buttons/trash-2.webp"
              alt="Delete"
              class="w-6 h-6 sm:rounded-full md:rounded-none"
            />
    <span class="sm:hidden md:inline">Delete</span>
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
    }, 1000); // Adjust panning every second

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

// Automatically hide the saving message after 1.5 seconds
const autoDisappear = () => {
  setTimeout(() => {
    saving.value = null;
  }, 1500);
};
</script>
