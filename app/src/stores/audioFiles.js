import { ref } from "vue";
import { defineStore } from "pinia";

export const audioFiles = defineStore(
  "audioFiles",
  () => {
    //how we select stuff to delete or view and renaming maybeeee
    const fileName = ref(null);
    const currentAudio = ref(null);

    //toggles to show history / recently deleted menus/modals
    const viewingHistory = ref(false);
    const viewingDeleted = ref(false);

    //warning modal and actually specifies how to delete stuff
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
    persist: {
      enabled: false, // dont persist this store
    },
  },
);
