import { ref } from "vue";
import { defineStore } from "pinia";

export const audioFilesStore = defineStore(
  "audioFilesStore",
  () => {
    const fileName = ref(null);
    const currentRecording = ref(null);

    const showHistoryModal = ref(false);
    const showDeletedModal = ref(false);

    const warning = ref(false);
    const deleteFunc = ref(null);

    const assignedID = ref(1);
    const audioHistory = ref([]);
    const recentlyDeleted = ref([]);
    return {
      deleteFunc,
      fileName,
      currentRecording,
      showHistoryModal,
      showDeletedModal,
      warning,
      assignedID,
      audioHistory,
      recentlyDeleted,
    };
  },

  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: [
            "assignedID",
            "audioHistory",
            "recentlyDeleted",
          ],
        },
      ],
    },
  },
);
