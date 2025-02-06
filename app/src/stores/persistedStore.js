import { ref } from "vue";
import { defineStore } from "pinia";

export const persistedSettings = defineStore(
  "persistedSettings",
  () => {
    //how we remember what ids we assign to new stuff and where we store audio
    const assignedID = ref(1);
    const pastAudio = ref([]);
    const recentlyDeleted = ref([]);
    const defaultNote = ref({ name: "C", frequency: 261.63 });

    const selectedMicrophone = ref(null);
    const selectedSpeaker = ref(null);
    const inputVolume = ref(0.5);
    const outputVolume = ref(1.0);
    return {
      // Audio settings
      selectedMicrophone,
      selectedSpeaker,
      inputVolume,
      outputVolume,
      // App state
      assignedID,
      pastAudio,
      recentlyDeleted,
      defaultNote
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: [
            'selectedMicrophone',
            'selectedSpeaker',
            'inputVolume',
            'outputVolume',
            'assignedID',
            'pastAudio',
            'recentlyDeleted',
            'defaultNote'
          ]
        },
      ],
    },
  },
);
