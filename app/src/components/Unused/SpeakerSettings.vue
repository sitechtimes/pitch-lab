<template>
  <!-- Speaker Selection -->
  <div class="mb-6">
    <h1 for="speaker" class="block text-white text-3xl mb-2">Speaker:</h1>

    <button
      v-if="!isTesting"
      @click="testSpeaker"
      class="bg-[#36C4E4] text-black w-[20%] rounded-lg mr-4"
    >
      Test Speaker
    </button>
    <button
      v-if="isTesting"
      @click="stopTesting"
      class="bg-[#A3D10A] text-black w-[20%] rounded-lg"
    >
      Stop Testing
    </button>

    <select
      id="speaker"
      v-model="devices.selectedSpeaker"
      class="select select-bordered w-full bg-tuner-bg text-white border-purple focus:ring-purple"
      @change="
        () => {
          stopTesting();
          devices.updateDevice();
        }
      "
    >
      <!-- Speakers with deviceId -->
      <option
        v-for="device in devices.speakersWithDeviceId"
        :key="device.deviceId"
        :value="device"
      >
        {{
          device.label ||
          (device.deviceId
            ? `Speaker ${shortId(device.deviceId)}`
            : "System Default")
        }}
      </option>

      <!-- Speakers without deviceId -->
      <option
        v-for="device in devices.speakersNoDeviceId"
        :key="device.kind + '-' + device.label"
        :value="device"
      >
        {{ device.label || "Default Speaker (no ID)" }}
      </option>

      <option
        v-if="!devices.speakersWithDeviceId && !devices.speakersNoDeviceId"
        value=""
        disabled
      >
        No speakers found
      </option>
    </select>
    <canvas
      ref="visualizerCanvas"
      class="w-full h-[100px] mt-4 border border-purple rounded"
    ></canvas>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { initializeStore } from "@/stores/initialize";
import { devicesStore } from "@/stores/devices";
const devices = devicesStore();
const initialize = initializeStore();
const visualizerCanvas = ref(null);

const errorMessage = ref("");
const animationFrameId = ref(null);
const isTesting = ref(false);
const loop = ref(null);

// Visualization setup
let analyser = null;
let bufferLength = null;
let dataArray = null;

const drawVisualizer = () => {
  if (!visualizerCanvas.value || !analyser) return;

  const canvas = visualizerCanvas.value;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "#120E1D";
  ctx.fillRect(0, 0, width, height);

  // Draw purple bars
  const barWidth = (width / bufferLength) * 2.5;
  let x = 0;

  ctx.fillStyle = "#7210E3";
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * height;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }

  animationFrameId.value = requestAnimationFrame(drawVisualizer);
};

const shortId = (id) => id.slice(0, 5);

const testSpeaker = async () => {
  if (!devices.selectedSpeaker || !devices.selectedSpeaker.deviceId) return;

  isTesting.value = true;
  const audio = new Audio();
  audio.src = "/quack.mp3";

  try {
    // Only works in Chrome-based browsers
    await audio.setSinkId(devices.selectedSpeaker.deviceId);
  } catch (err) {
    console.warn("setSinkId not supported or failed:", err);
    errorMessage.value =
      "Your browser doesn't support selecting output devices.";
  }

  audio.onended = () => {
    if (isTesting.value) {
      audio.play();
    }
  };
  audio.play();
};

const stopTesting = () => {
  isTesting.value = false;
  clearInterval(loop.value);
};
</script>
