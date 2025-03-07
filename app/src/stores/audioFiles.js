import { ref } from "vue";
import { defineStore } from "pinia";

export const audioFiles = defineStore(
  "audioFiles",
  () => {
    const fileName = ref(null);
    const currentAudio = ref(null);

    const viewingHistory = ref(false);
    const viewingDeleted = ref(false);

    const warning = ref(false);
    const deleteFunc = ref(null);

    return {
      deleteFunc,
      fileName,
      currentAudio,
      viewingDeleted,
      viewingHistory,
      warning,
    };
  },

  {
    persist: false,
  },
);
