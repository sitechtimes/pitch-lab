import { ref } from "vue";
import { defineStore } from "pinia";

export const audioStore = defineStore(
  "audioFiles",
  () => {
    //how we remember what ids we assign to new stuff and where we store audio
    const assignedID = ref(1);
    const pastAudio = ref([]);
    const recentlyDeleted = ref([]);

    //how we select stuff to delete or view and renaming maybeeee
    const fileName = ref(null);
    const currentAudio = ref(null);

    //toggles to show history / recently deleted menus/modals
    const viewingDeleted = ref(false);
    const viewingHistory = ref(false);

    //warning modal and actually specifies how to delete stuff
    const warning = ref(false);
    const deleteFunc = ref(null);

    return {
      assignedID,
      pastAudio,
      recentlyDeleted,
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
      enabled: true, // Enable persistence for this store
      strategies: [
        {
          storage: localStorage, // Use localStorage to persist the state
          paths: ["assignedID", "recentlyDeleted", "pastAudio"], // Specify which state to persist
        },
      ],
    },
  },
);
