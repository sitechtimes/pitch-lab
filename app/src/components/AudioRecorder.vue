<template>
  <div>
    <h1>Audio Recorder</h1>

    <button @click="startRecording" :disabled="isRecording">
      Start Recording
    </button>
    <button @click="stopRecording" :disabled="!isRecording">
      Stop Recording
    </button>

    <!-- Display recorded audio playback and download link -->
    <div v-if="audioUrl">
      <h3>Recorded Audio:</h3>
      <audio :src="audioUrl" controls></audio>
      <a :href="audioUrl" download="recorded-audio.wav">
        <button>Download Recording</button>
      </a>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "AudioRecorder",
  setup() {
    const isRecording = ref(false); // Track if we're recording
    const audioUrl = ref(null); // Store the audio URL for playback
    let mediaRecorder = null; // The MediaRecorder instance
    let audioChunks = []; // Array to store audio data chunks

    // Start recording function
    const startRecording = async () => {
      try {
        // Get access to the microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Initialize the MediaRecorder
        mediaRecorder = new MediaRecorder(stream);

        // Collect audio data chunks as they become available
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        // Once recording stops, create a Blob from the audio chunks
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          audioUrl.value = URL.createObjectURL(audioBlob); // Create audio URL for playback
        };

        // Start recording
        mediaRecorder.start();
        isRecording.value = true; // Update state to reflect recording
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Could not access microphone. Please check permissions.");
      }
    };

    // Stop recording function
    const stopRecording = () => {
      if (mediaRecorder) {
        mediaRecorder.stop(); // Stop recording
        isRecording.value = false; // Update state to reflect recording stopped
      }
    };

    // Expose the functions and reactive state to the template
    return {
      isRecording,
      audioUrl,
      startRecording,
      stopRecording,
    };
  },
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

a {
  margin-top: 10px;
  display: inline-block;
}
</style>
