import { ref } from "vue";
import { defineStore } from "pinia";

export const persistedSettings = defineStore(
  "persistedSettings",
  () => {
    //how we remember what ids we assign to new stuff and where we store audio
    const assignedID = ref(1);
    const pastAudio = ref([]);
    const recentlyDeleted = ref([]);
    //setttings
    const defaultNote = ref({ name: "C", frequency: 261.63 });
    const selectedMicrophone = ref(null);
    const selectedSpeaker = ref(null);
    const inputVolume = ref(0.5);
    const outputVolume = ref(1.0);
    //metronome
    const timeSignature = ref("4");
    const timeSignatureDenominator = ref("4");
    const selectedSound = ref("quack");
    const bpm = ref(120);
    return {
      selectedMicrophone,
      selectedSpeaker,
      inputVolume,
      outputVolume,
      assignedID,
      pastAudio,
      recentlyDeleted,
      defaultNote,
      timeSignature,
      timeSignatureDenominator,
      selectedSound,
      bpm,
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: [
            "selectedMicrophone",
            "selectedSpeaker",
            "inputVolume",
            "outputVolume",
            "assignedID",
            "pastAudio",
            "recentlyDeleted",
            "defaultNote",
            "timeSignature",
            "timeSignatureDenominator",
            "selectedSound",
            "bpm",
          ],
        },
      ],
    },
  },
);
