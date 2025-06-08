import { ref, computed, onMounted, onUnmounted } from "vue";
import { noteFrequencies } from "@/constants/NoteFrequencies";
import { devicesStore } from "@/stores/devices";

export function useTuner() {
  const devices = devicesStore();

  const localAudioContext = ref(null);
  const localStream = ref(null);
  const localSource = ref(null);
  const localGain = ref(null);
  const localAnalyser = ref(null);

  const frequency = ref(null);
  const lastValidFrequency = ref(null);
  const isTuning = ref(false);
  const closestNote = ref(null);
  const detuneValue = ref(0);
  const isFlat = ref(false);
  const isSharp = ref(false);
  const isInTune = ref(false);
  const ambientRms = ref(0);
  const silenceThreshold = ref(0);

  const fftSize = 4096;
  const MAX_FREQUENCY = 4186;
  const MIN_FREQUENCY = 27.5;

  const createLocalAudioGraph = async () => {
    try {
      const audioConstraints =
        devices.selectedMicrophone?.deviceId &&
          devices.selectedMicrophone.deviceId !== ""
          ? {
            deviceId: { exact: devices.selectedMicrophone.deviceId },
            channelCount: { ideal: 1 },
            noiseSuppression: true,
            autoGainControl: false,
          }
          : {
            channelCount: { ideal: 1 },
            noiseSuppression: true,
            autoGainControl: false,
          };

      localStream.value = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      localAudioContext.value = new (window.AudioContext ||
        window.webkitAudioContext)();

      const streamSource = localAudioContext.value.createMediaStreamSource(
        localStream.value,
      );
      localSource.value = streamSource;

      const splitter = localAudioContext.value.createChannelSplitter(2);
      const merger = localAudioContext.value.createChannelMerger(1);
      streamSource.connect(splitter);
      splitter.connect(merger, 0, 0);
      localSource.value = merger;

      const gainNode = localAudioContext.value.createGain();
      gainNode.gain.value = devices.inputVolume * 0.5;
      localGain.value = gainNode;

      const analyserNode = localAudioContext.value.createAnalyser();
      analyserNode.fftSize = fftSize;
      localAnalyser.value = analyserNode;

      merger.connect(gainNode).connect(analyserNode);
      console.log("🔊 Local AudioContext initialized in tuner composable");
    } catch (err) {
      console.error("Failed to create local audio graph:", err);
    }
  };

  const cleanupLocalAudio = () => {
    localStream.value?.getTracks().forEach((track) => track.stop());
    if (
      localAudioContext.value &&
      typeof localAudioContext.value.close === "function"
    ) {
      localAudioContext.value.close();
    }
    localAudioContext.value = null;
    localStream.value = null;
    localSource.value = null;
    localGain.value = null;
    localAnalyser.value = null;
    console.log("🧼 Local audio cleaned up");
  };

  const indicatorPosition = computed(() => {
    const maxRange = 50;
    let detune = Math.max(Math.min(detuneValue.value, maxRange), -maxRange);
    let percentageOffset = (detune / maxRange) * 50;
    return `calc(50% + ${percentageOffset}%)`;
  });

  function findClosestNote(freq) {
    let left = 0;
    let right = noteFrequencies.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const noteFreq = noteFrequencies[mid].frequency;
      if (noteFreq === freq) {
        return noteFrequencies[mid];
      } else if (noteFreq < freq) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    const lowerNote = noteFrequencies[right >= 0 ? right : 0];
    const upperNote =
      noteFrequencies[
      left < noteFrequencies.length ? left : noteFrequencies.length - 1
      ];
    return Math.abs(lowerNote.frequency - freq) <
      Math.abs(upperNote.frequency - freq)
      ? lowerNote
      : upperNote;
  }

  function calculateDetune(detectedFreq, targetFreq) {
    return 1200 * Math.log2(detectedFreq / targetFreq);
  }

  function updateTuning() {
    isFlat.value = detuneValue.value < -10;
    isSharp.value = detuneValue.value > 10;
    isInTune.value = Math.abs(detuneValue.value) <= 10;
  }

  async function startTuning() {
    try {
      if (!localAudioContext.value) await createLocalAudioGraph();

      if (localAudioContext.value?.state === "suspended") {
        await localAudioContext.value.resume();
      }

      isTuning.value = true;
      trackFrequency();
    } catch (error) {
      console.error("Error starting tuning:", error);
      stopTuning();
    }
  }

  function stopTuning() {
    isTuning.value = false;
    frequency.value = null;
    closestNote.value = null;
    detuneValue.value = null;
  }

  function toggleTuning() {
    isTuning.value ? stopTuning() : startTuning();
  }
  function getRMS(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  async function calibrateSilence(durationMs = 1500) {
    const analyser = localAnalyser.value;
    const buffer = new Float32Array(analyser.fftSize);
    const start = performance.now();

    while (performance.now() - start < durationMs) {
      analyser.getFloatTimeDomainData(buffer);
      const rms = getRMS(buffer);
      ambientRms.value = Math.min(ambientRms.value, rms);
      // small pause so we sample a few different buffers
      await new Promise((r) => setTimeout(r, 50));
    }

    silenceThreshold.value = ambientRms.value * 3;
    // console.log(
    //   "Calibrated minRms:", ambientRms.value.toFixed(6),
    //   "→ silenceThreshold:", silenceThreshold.value.toFixed(6)
    // );
  }
  function trackFrequency() {
    const analyser = localAnalyser.value;
    const bufferLength = analyser.fftSize;
    const timeData = new Float32Array(bufferLength);
    const smoothedFrequency = ref(null);
    const smoothingAlpha = 0.1;

    // For detecting when to *switch* streams
    const conflictFreqs = [];
    const conflictThreshold = 3;      // must see new stream this many times
    const frequencyTolerance = 2;     // Hz tolerance to consider “same” stream
    const silenceThreshold = 0.01;
    function update() {
      if (!isTuning.value || !analyser) return;

      analyser.getFloatTimeDomainData(timeData);
      const rms = getRMS(timeData);
      console.log("RMS:", rms.toFixed(4));

      if (rms < silenceThreshold.value) {
        frequency.value = lastValidFrequency.value || 0;
        return requestAnimationFrame(update);
      }
      const sampleRate = localAudioContext.value.sampleRate;
      const detectedFreq = yinDetector(timeData, sampleRate);

      if (
        detectedFreq !== -1 &&
        detectedFreq >= MIN_FREQUENCY &&
        detectedFreq <= MAX_FREQUENCY
      ) {
        // 1) If we’ve *never* set a stream, seed immediately:
        if (lastValidFrequency.value == null) {
          lastValidFrequency.value = detectedFreq;
          smoothedFrequency.value = detectedFreq;

        } else {
          const delta = Math.abs(detectedFreq - lastValidFrequency.value);

          // 2) If this detection is “within” your current stream → accept & reset conflicts
          if (delta <= frequencyTolerance) {
            conflictFreqs.length = 0;
            smoothedFrequency.value =
              smoothingAlpha * detectedFreq +
              (1 - smoothingAlpha) * smoothedFrequency.value;

            // 3) If it’s *far* from your stream → accumulate as a candidate
          } else {
            conflictFreqs.push(detectedFreq);
            if (conflictFreqs.length >= conflictThreshold) {
              // finally switch to the new steady stream:
              lastValidFrequency.value = detectedFreq;
              smoothedFrequency.value = detectedFreq;
              conflictFreqs.length = 0;
            } else {
              // not stable enough to switch—skip updating UI
              requestAnimationFrame(update);
              return;
            }
          }
        }

        // 4) Publish your smoothed value & compute note/detune
        frequency.value = smoothedFrequency.value;
        const note = findClosestNote(frequency.value);
        closestNote.value = note;
        detuneValue.value = calculateDetune(frequency.value, note.frequency);
        updateTuning();

      } else {
        // if nothing valid, keep showing lastKnown
        frequency.value = lastValidFrequency.value || 0;
      }

      requestAnimationFrame(update);
    }

    update();
  }


  function yinDetector(buffer, sampleRate) {
    const threshold = 0.1;
    const probabilityThreshold = 0.1;
    const yinBufferLength = Math.floor(buffer.length / 2);
    const yinBuffer = new Float32Array(yinBufferLength);

    for (let tau = 0; tau < yinBufferLength; tau++) {
      let sum = 0;
      for (let i = 0; i < yinBufferLength; i++) {
        const delta = buffer[i] - buffer[i + tau];
        sum += delta * delta;
      }
      yinBuffer[tau] = sum;
    }

    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < yinBufferLength; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / runningSum;
    }

    let tauEstimate = -1;
    for (let tau = 2; tau < yinBufferLength; tau++) {
      if (yinBuffer[tau] < threshold) {
        while (
          tau + 1 < yinBufferLength &&
          yinBuffer[tau + 1] < yinBuffer[tau]
        ) {
          tau++;
        }
        tauEstimate = tau;
        break;
      }
    }

    if (tauEstimate === -1) return -1;

    const betterTau =
      tauEstimate > 0 && tauEstimate < yinBufferLength - 1
        ? tauEstimate +
        (yinBuffer[tauEstimate + 1] - yinBuffer[tauEstimate - 1]) /
        (2 *
          (2 * yinBuffer[tauEstimate] -
            yinBuffer[tauEstimate - 1] -
            yinBuffer[tauEstimate + 1]))
        : tauEstimate;
    const confidence = 1 - yinBuffer[tauEstimate];

    if (confidence < probabilityThreshold) {
      return -1;
    }
    if (confidence < 0.3) return -1;
    return sampleRate / betterTau;
  }

  onMounted(async () => {
    await createLocalAudioGraph();
    await calibrateSilence();
    toggleTuning();
  });

  onUnmounted(() => {
    stopTuning();
    cleanupLocalAudio();
  });

  return {
    isTuning,
    isFlat,
    isSharp,
    isInTune,
    closestNote,
    detuneValue,
    indicatorPosition,
    toggleTuning,
  };
}
