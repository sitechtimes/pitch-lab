<template>
  <div class="tuner">
    <h2>Tuning System</h2>
    <div id="note">Note: {{ note }}</div>
    <div id="status" :style="{ color: statusColor }">
      Status: {{ statusMessage }}
    </div>
    <div class="scale">
      <span>A</span>
      <span>B♭</span>
      <span>C</span>
      <span>E♭</span>
      <span>F</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { PitchDetector } from "pitchy";

const note = ref("-");
const statusMessage = ref("-");
const statusColor = ref("black");

const targetNotes = {
  A: 440.0,
  "B♭": 466.16,
  C: 261.63,
  "E♭": 311.13,
  F: 349.23,
};

const getNoteFromFrequency = (frequency) => {
  let closestNote = null;
  let smallestDifference = Infinity;

  for (const note in targetNotes) {
    const targetFrequency = targetNotes[note];
    const difference = Math.abs(frequency - targetFrequency);

    if (difference < smallestDifference) {
      closestNote = note;
      smallestDifference = difference;
    }
  }

  return closestNote;
};

const updateUI = (detectedNote, frequency) => {
  note.value = detectedNote;

  const targetFrequency = targetNotes[detectedNote];
  if (targetFrequency) {
    const difference = frequency - targetFrequency;
    if (Math.abs(difference) < 1) {
      statusMessage.value = "In Tune";
      statusColor.value = "green";
    } else if (difference > 0) {
      statusMessage.value = "Sharp";
      statusColor.value = "blue";
    } else {
      statusMessage.value = "Flat";
      statusColor.value = "red";
    }
  }
};

onMounted(() => {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32768;
      source.connect(analyser);

      const pitchDetector = PitchDetector.forFloat32Array(
        audioContext.sampleRate,
      );
      const buffer = new Float32Array(analyser.fftSize);

      const detectPitch = () => {
        analyser.getFloatTimeDomainData(buffer);
        const [frequency] = pitchDetector.findPitch(
          buffer,
          audioContext.sampleRate,
        );

        if (frequency) {
          const detectedNote = getNoteFromFrequency(frequency);
          updateUI(detectedNote, frequency);
        }
        requestAnimationFrame(detectPitch);
      };

      detectPitch();
    })
    .catch((err) => {
      console.error("Error accessing microphone:", err);
    });
});
</script>

<style>
.tuner {
  text-align: center;
  margin-top: 50px;
}
#note {
  font-size: 2em;
  margin: 20px;
}
#status {
  font-size: 1.5em;
  margin-bottom: 20px;
}
.scale {
  font-size: 1.2em;
  display: flex;
  justify-content: space-around;
  margin: 20px;
}
.scale span {
  padding: 10px;
  border-radius: 5px;
  background: #f0f0f0;
}
</style>
