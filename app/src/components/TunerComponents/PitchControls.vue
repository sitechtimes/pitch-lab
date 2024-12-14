<template>
  <button
    @click="startPitchDetection"
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
  >
    Start Pitch Detection
  </button>
</template>

<script setup>
import { useTuningStore } from "../stores/tuning";
import Pitchfinder from "pitchfinder";

const tuningStore = useTuningStore();
const startPitchDetection = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 8192;
    source.connect(analyser);

    const pitchFinder = Pitchfinder.YIN({
      sampleRate: audioContext.sampleRate,
    });
    const dataArray = new Float32Array(analyser.fftSize);

    const detect = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const detectedPitch = pitchFinder(dataArray);

      if (detectedPitch && detectedPitch > 50 && detectedPitch < 2000) {
        const normalizedPitch = normalizeToBaseOctave(detectedPitch);
        const targetFrequency = tuningStore.currentFrequency;
        const detune = 1200 * Math.log2(normalizedPitch / targetFrequency);

        console.log(
          `Detected pitch: ${detectedPitch.toFixed(2)} Hz, Target: ${tuningStore.currentNote} (${targetFrequency} Hz), Detune: ${detune.toFixed(2)} cents`,
        );
      }

      requestAnimationFrame(detect);
    };

    detect();
  } catch (err) {
    console.error("Error accessing microphone:", err);
  }
};

const normalizeToBaseOctave = (frequency) => {
  while (frequency > 523.25) {
    frequency /= 2;
  }
  while (frequency < 261.63) {
    frequency *= 2;
  }
  return frequency;
};
</script>
