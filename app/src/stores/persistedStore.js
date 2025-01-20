import { ref } from "vue";
import { defineStore } from "pinia";

export const persistedSettings = defineStore(
  "persistedSettings",
  () => {
    //how we remember what ids we assign to new stuff and where we store audio
    const assignedID = ref(1);
    const pastAudio = ref([]);
    const recentlyDeleted = ref([]);

    //settings ig
    const selectedMicrophone = ref(null);
    const selectedSpeaker = ref(null);
    const defaultNote = ref("A");

    return {
      assignedID,
      pastAudio,
      recentlyDeleted,
      selectedMicrophone,
      selectedSpeaker,
      defaultNote,
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage, // Use localStorage to persist the state
        },
      ],
    },
  },
);
