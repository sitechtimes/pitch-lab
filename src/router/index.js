import { createRouter, createWebHistory } from "vue-router";
import TunerView from "../views/TunerView.vue";
import HomeView from "../views/HomeView.vue";
import InitializeApp from "@/views/InitializeApp.vue";
import { initializeStore } from "@/stores/initialize";

function isElectron() {
  return typeof window !== 'undefined' &&
    window.electronEnv?.isElectron === true;
}
console.log("isElectron:", isElectron());

let LandingView, DownloadView;
if (!isElectron()) {
  LandingView = () => import("../views/LandingView.vue");
  DownloadView = () => import("../views/DownloadView.vue");
}

const routes = [
  {
    path: "/app",
    name: "app",
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
    path: "/initialize",
    name: "initialize",
    component: InitializeApp,
    meta: { requiresInit: false }
  }
];

if (!isElectron()) {
  routes.push({
    path: "/",
    redirect: "/app"
  });

} else {
  routes.push(
    {
      path: "/",
      name: "landing",
      component: LandingView,
      meta: { requiresInit: false }
    },
    {
      path: "/download",
      name: "download",
      component: DownloadView,
      meta: { requiresInit: false }
    }
  );
}


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const initialize = initializeStore();
  console.log("isInitialized:", initialize.isInitialized, "Route:", to.path);
  if (isElectron() && to.path === '/') {
    console.log("Redirecting Electron root '/' to '/app'");
    return next({ path: '/app' });
  }
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