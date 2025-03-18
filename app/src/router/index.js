import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import TunerView from "../views/TunerView.vue";
import LandingView from "@/views/LandingView.vue";
import InitializeApp from "@/views/InitializeApp.vue";
import { initializeStore } from "@/stores/initialize";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/tuner",
      name: "tuner",
      component: TunerView,
    },
    {
      path: "/landing",
      name: "landing",
      component: LandingView,
    },
    {
      path: "/initialize",
      name: "initialize",
      component: InitializeApp,
    },
  ],
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const initialize = initializeStore()
  if (to.meta.requiresInit && !initialize.isInitialized) {
    next({ name: "initialize" });
  } else {
    next();
  }
});

export default router;