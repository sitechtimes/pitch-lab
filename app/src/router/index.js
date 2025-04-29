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
      meta: { requiresInit: true }
    },
    {
      path: "/tuner",
      name: "tuner",
      component: TunerView,
      meta: { requiresInit: true }
    },
    {
      path: "/landing",
      name: "landing",
      component: LandingView,
      meta: { requiresInit: false }

    },
    {
      path: "/initialize",
      name: "initialize",
      component: InitializeApp,
      meta: { requiresInit: false }

    },
  ],
});
router.beforeEach((to, from, next) => {
  const initialize = initializeStore();
  console.log("isInitialized:", initialize.isInitialized, "Route:", to.path);

  if (to.name === "initialize" && initialize.isInitialized) {
    console.log("Redirecting from /initialize to / because already initialized");
    next({ name: "home" });
  }
  else if (to.meta.requiresInit && !initialize.isInitialized) {
    console.log("Redirecting to /initialize because initialization is required");
    next({ name: "initialize" });
  }
  else {
    console.log("Proceeding to:", to.path);
    next();
  }
});

export default router;