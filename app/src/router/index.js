import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import TunerView from "../views/TunerView.vue";
import LandingView from "@/views/LandingView.vue";

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
  ],
});

export default router;