<template>
  <div class="flex flex-col lg:flex-row gap-6 p-4">
    <!-- Left panel -->
    <div
      class="flex flex-col items-center lg:items-start w-full lg:w-1/3 space-y-4 min-w-0"
    >
      <!-- Start/Stop -->
      <button
        v-if="!isRecording"
        @click="startRecording"
        class="w-full md:w-48 px-4 py-2 bg-[#36C4E4] rounded-full flex items-center justify-center text-xl font-mono"
      >
        <img src="@/assets/buttons/microphone.webp" class="h-5 w-5 mr-2" />
        Start Recording
      </button>
      <button
        v-else
        @click="stopRecording"
        class="w-full md:w-48 px-4 py-2 bg-[#A3D10A] rounded-full flex items-center justify-center text-xl font-mono"
      >
        <img
          src="@/assets/buttons/microphone-disabled.webp"
          class="h-5 w-5 mr-2"
        />
        Stop Recording
      </button>

      <!-- Timer -->
      <div
        class="w-full md:w-48 text-center bg-[#424242] py-2 px-4 rounded-lg font-mono text-lg md:text-xl flex items-center justify-center"
      >
        Timer: {{ formatTime(timer) }}
      </div>

      <!-- Saved recordings -->
      <button
        @click="
          (audioStore.showHistoryModal = true),
            (saving = null),
            (audioStore.showDeletedModal = false)
        "
        class="w-full md:w-48 px-4 py-2 bg-purple rounded-full text-white text-base md:text-xl font-mono"
      >
        Saved Recordings
      </button>
    </div>

    <!-- Right panel -->

    <div class="flex flex-col lg:flex-row flex-wrap gap-6 p-4">
      <!-- Playback & controls -->
      <div
        v-if="audioStore.currentRecording && !isRecording"
        class="flex flex-col md:flex-row gap-6"
      >
        <!-- Audio + download -->
        <div class="flex-1 min-w-0 flex flex-col space-y-3">
          <h3 class="text-xl md:text-2xl font-semibold">Recorded Audio:</h3>

          <audio
            ref="audioElement"
            controls
            :src="`data:audio/mp4;base64,${audioStore.currentRecording.audio}`"
            class="w-full"
          ></audio>

          <div class="flex flex-col sm:flex-row gap-2 items-center">
            <input
              id="name"
              type="text"
              v-model="audioStore.fileName"
              placeholder="Name File"
              class="flex-1 min-w-0 p-2 rounded text-black text-base"
            />
            <a
              :href="`data:audio/mp4;base64,${audioStore.currentRecording.audio}`"
              :download="
                audioStore.fileName
                  ? `${audioStore.fileName}.mp4`
                  : 'recorded-audio.mp4'
              "
              class="text-blue-400 underline text-base md:text-lg"
            >
              Download
            </a>
          </div>
        </div>

        <!-- Save/Delete buttons -->
        <div class="flex flex-col space-y-3 w-full sm:w-auto">
          <button
            @click="saveAudio"
            class="w-full px-4 py-2 bg-[#2A4296] text-[#A3D10A] rounded-full flex items-center justify-center text-base md:text-lg"
          >
            <img src="@/assets/buttons/save.webp" class="h-5 w-5 mr-2" />
            Save to history
          </button>
          <button
            @click="deleteAudio"
            class="w-full px-4 py-2 bg-[#2A4296] text-[#A3D10A] rounded-full flex items-center justify-center text-base md:text-lg"
          >
            <img src="@/assets/buttons/trash-2.webp" class="h-5 w-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <!-- Placeholder when empty -->
      <div v-else class="flex-1 flex items-center justify-center">
        <p class="text-center text-base md:text-lg px-4">
          No recorded audio available. Please start recording to see playback
          and download options.
        </p>
      </div>

      <!-- Save/Delete notifications -->
      <div
        v-if="saving"
        class="text-center text-base md:text-lg text-green-400"
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
