<script setup lang="ts">
  import {
    ref,
    onMounted,
    watch,
    nextTick,
    computed,
    onBeforeMount
  } from "vue";
  import { watchDebounced } from "@vueuse/core";

  import { getAppTheme } from "@/kikx/style";

  import Bg from "@/components/Bg.vue";
  import App from "@/components/App.vue";
  import Navbar from "@/components/Navbar.vue";
  import Loading from "@/components/Loading.vue";
  import RightStick from "@/components/RightStick.vue";
  import ControlCenter from "@/components/ControlCenter.vue";

  import Statusbar from "@/components/Status/Statusbar.vue";

  import HomeScreen from "@/components/HomeScreen.vue";

  import Logout from "@/components/modules/Logout.vue";
  import Settings from "@/components/modules/Settings.vue";
  import WallpaperChanger from "@/components/modules/WallpaperChanger.vue";

  import { getUrl } from "@/kikx/config";
  import { useClient, devLogin, muiConfig } from "@/kikx";

  import { playSound } from "@/kikx/sound";

  import { useUIConfig } from "@/stores/kikx";
  import { useKeyboard } from "@/composables/useKeyboard";
  import { useRunningApps } from "@/composables/useRunningApps";

  // ------------------ STATE
  // Kikx Client
  const client = useClient();
  const uiConfig = useUIConfig();

  // Loading, connected state
  const connecting = ref(true);
  const connected = ref(false);

  // home, app, app-control, control
  const currentScreen = ref("home");
  const lastScreen = ref("home");

  const currentModule = ref(null);

  const {
    runningApps,
    activeAppIndex,
    activeApp,
    setActiveApp,
    switchAppLeft,
    switchAppRight,
    openApp,
    closeApp,
    closeAppById
  } = useRunningApps(client, uiConfig, changeScreen);
  const { isKeyboardOpen, closeKeyboard } = useKeyboard();

  // ------------------ Utils
  // Change active screen
  function changeScreen(name) {
    lastScreen.value = currentScreen.value;
    currentScreen.value = name;
  }

  // Show Module
  function showModule(name) {
    if (["control", "app-control"].includes(currentScreen.value)) {
      changeScreen("home");
    }

    currentModule.value = name;
  }

  function closeModule() {
    currentModule.value = false;
  }

  // Scroll Tab To App
  function scrollTabToApp(index: number) {
    if (index < 0) return;
    if (currentScreen.value !== "app-control") return;
    if (!runningApps.value[index]) return;

    const el = document.getElementById(
      "app_tab_" + runningApps.value[index].id
    );

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  }

  // hidden screens for navbar
  const appScreens = ["app-control", "app"];
  const navbarHiddenScreens = ["app-control", "control"];

  const canShowNavbar = computed(
    () =>
      uiConfig.state.navbar &&
      !currentModule.value &&
      (isKeyboardOpen.value ||
        !navbarHiddenScreens.includes(currentScreen.value))
  );

  const canShowFallbackTrigger = computed(
    () =>
      !uiConfig.state.navbar &&
      !uiConfig.state.stickBar &&
      !navbarHiddenScreens.includes(currentScreen.value)
  );

  // ------------------ Watchers
  // Auto switch app if activeAppIndex change
  watch(activeAppIndex, async indexNew => {
    await nextTick();
    scrollTabToApp(indexNew);
  });

  watch(currentScreen, async newValue => {
    await nextTick();
    if (newValue === "app-control") {
      scrollTabToApp(activeAppIndex.value);
    }
  });

  // ------------------ Event Handlers
  function onAppControlSwipe(direction) {
    if (direction === "up") {
      changeScreen("home");
    }
    if (direction === "down") {
      changeScreen("app");
    } else if (direction === "left") {
      switchAppLeft();
    } else if (direction === "right") {
      switchAppRight();
    }
  }

  function onAppControlClick() {
    if (runningApps.value.length > 0) {
      changeScreen("app");
    } else {
      changeScreen("home");
    }
  }

  function onAppScreenClick() {
    if (runningApps.value.length <= 0) {
      changeScreen("home");
    }
  }

  function onStickBarSwipe(direction) {
    if (direction === "up") {
      const screen =
        currentScreen.value === "app-control" ? "app" : "app-control";
      changeScreen(screen);
    } else if (direction === "down") {
      changeScreen("home");
    }
  }

  // On bottom fallback bubble click
  function onFallbackBubbleClick() {
    changeScreen("app-control");
  }

  function onControlCenterClose() {
    changeScreen(lastScreen.value);
  }

  function onAppControlBtnClick(btnIndex) {
    if (btnIndex === 1) {
      closeActiveApp();
    } else if (btnIndex === 0) {
      changeScreen("control");
    }
  }

  function onAppControlIconClick(index) {
    if (activeAppIndex.value === index) {
      changeScreen("app");
    } else {
      setActiveApp(index);
    }
  }

  // 0 - home, 1 - app-control, 2 close (depends)
  function onNavbarClick(btnIndex) {
    if (btnIndex === 0) {
      changeScreen("home");
    } else if (btnIndex === 1) {
      changeScreen("app-control");
    } else if (btnIndex === 2 && currentScreen.value !== "home") {
      closeActiveApp();
    }
  }

  // ------------------ App Functions
  // if activa app is sudo
  const isSudoApp = computed(() => {
    return activeApp.value && appScreens.includes(currentScreen.value)
      ? activeApp.value.isSudo
      : false;
  });

  // Active app theme
  const activeAppTheme = computed(() => {
    // only show when screen is control & app-control
    return activeApp.value && appScreens.includes(currentScreen.value)
      ? activeApp.value.manifest.theme
      : "default";
  });

  // close active app if found
  function closeActiveApp() {
    if (!activeApp.value) return;
    closeApp(activeAppIndex.value);
  }

  // On app alert
  function appAlert(payload) {
    if (!uiConfig.state.isSilent) {
      playSound("alert");
    }

    // Only toast alert if its active (backend checks already)
    const index = runningApps.value.findIndex(app => app.id === payload.id);
    if (index !== -1) {
      uiConfig.addAppAlert(payload);
    }
  }

  // On app alert click
  function onAlertClick(appAlert) {
    // Remove alert
    uiConfig.removeAppAlert(appAlert.uid);

    const index = runningApps.value.findIndex(app => app.id === appAlert.id);

    if (index !== -1) {
      setActiveApp(index);
      changeScreen("app");
      // Sending signal to app
      client.sendAppEvent("alert:click", appAlert.id, appAlert.uid);
    } else {
      changeScreen("home");
    }
  }

  // Load config state and watch for changes
  async function loadConfigAndWatch() {
    await muiConfig.load();

    watchDebounced(
      () => ({ ...uiConfig.state }),
      // () => uiConfig.state,
      async () => {
        await muiConfig.save();
      },
      {
        deep: true,
        debounce: 500, // wait 500ms after last change
        maxWait: 2000 // optional: force run after 2s max
      }
    );
  }

  // On before mount
  onBeforeMount(async () => {
    // Dev - test login wont work in prod
    await devLogin("kikx");

    // Event bindings
    client.on("ws:onclose", e => {
      if (e.code === 1008) {
        // unauthorized then reload
        location.reload();
      }
      connecting.value = true;
    });

    // Client reconnect
    client.on("reconnected", () => {
      connecting.value = false;
    });

    // App closing by itself
    client.on("app:close", app => {
      closeAppById(app.id);
    });

    // app alert event
    client.on("app:alert", payload => appAlert(payload));

    client.run(async data => {
      // load config and watch
      await loadConfigAndWatch();

      console.log("Client Event:", data);

      connected.value = true;
      connecting.value = false;
    });
  });
</script>

<template>
  <div
    data-theme="light"
    class="h-dvh w-full flex flex-col overflow-hidden bg-transparent"
  >
    <!-- Loading -->
    <Transition name="fade">
      <div v-if="connecting" class="fixed z-[999] inset-0 fscreen bg-black/60">
        <Loading class="text-white" label="Loading" />
      </div>
    </Transition>

    <!-- Background layer -->
    <Bg v-if="connected" />

    <!-- Top statusbar -->
    <Transition name="statusbar-slide">
      <Statusbar
        v-if="!uiConfig.state.iScreen && !currentModule"
        :isSudoApp
        :theme="activeAppTheme"
      />
    </Transition>

    <!-- Screens -->
    <div class="flex-1 relative">
      <!-- Apps menu overlay -->
      <HomeScreen v-if="currentScreen === 'home'" :openApp :changeScreen />

      <Transition name="fade">
        <ControlCenter
          v-if="currentScreen === 'control'"
          :close="onControlCenterClose"
          :showModule
          :onAlertClick
        />
      </Transition>

      <!-- Running Apps Stack -->
      <div
        v-show="currentScreen === 'app' || currentScreen === 'app-control'"
        class="absolute fscreen inset-0 z-20 flex flex-col gap-1 items-center"
        :class="getAppTheme(activeAppTheme)"
      >
        <div
          @click.self="onAppScreenClick"
          class="w-full flex-1 overflow-hidden transition-all duration-300"
        >
          <App
            v-for="(app, index) in runningApps"
            :key="app.id"
            class="fscreen overflow-hidden"
            v-show="activeAppIndex === index && activeAppIndex !== -1"
            :app="app"
          />
        </div>

        <!-- AppsControl -->
        <Transition name="app-control">
          <div
            v-show="currentScreen === 'app-control' && !isKeyboardOpen"
            class="w-full flex flex-col overflow-hidden"
          >
            <!-- Control Panel -->
            <div
              v-swipe="onAppControlSwipe"
              @click="onAppControlClick"
              class="h-10 flex items-center justify-center"
            >
              <!-- App title -->
              <div
                v-if="activeApp"
                class="flex justify-center items-center gap-1 bg-white/10 border-t border-white/40 p-2 w-1/2 rounded-t-lg"
              >
                <svg
                  v-if="isSudoApp"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="m16 7.58l-5.5-2.4L5 7.58v3.6c0 3.5 2.33 6.74 5.5 7.74c.25-.08.49-.2.73-.3c-.15-.51-.23-1.06-.23-1.62c0-2.97 2.16-5.43 5-5.91z"
                    opacity="0.3"
                  />
                  <path
                    fill="currentColor"
                    d="M17 13c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4m0 1.38c.62 0 1.12.51 1.12 1.12s-.51 1.12-1.12 1.12s-1.12-.51-1.12-1.12s.5-1.12 1.12-1.12m0 5.37c-.93 0-1.74-.46-2.24-1.17c.05-.72 1.51-1.08 2.24-1.08s2.19.36 2.24 1.08c-.5.71-1.31 1.17-2.24 1.17"
                    opacity="0.3"
                  />
                  <circle cx="17" cy="15.5" r="1.12" fill="currentColor" />
                  <path
                    fill="currentColor"
                    d="M18 11.09V6.27L10.5 3L3 6.27v4.91c0 4.54 3.2 8.79 7.5 9.82c.55-.13 1.08-.32 1.6-.55A5.97 5.97 0 0 0 17 23c3.31 0 6-2.69 6-6c0-2.97-2.16-5.43-5-5.91M11 17c0 .56.08 1.11.23 1.62c-.24.11-.48.22-.73.3c-3.17-1-5.5-4.24-5.5-7.74v-3.6l5.5-2.4l5.5 2.4v3.51c-2.84.48-5 2.94-5 5.91m6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4"
                  />
                  <path
                    fill="currentColor"
                    d="M17 17.5c-.73 0-2.19.36-2.24 1.08c.5.71 1.32 1.17 2.24 1.17s1.74-.46 2.24-1.17c-.05-.72-1.51-1.08-2.24-1.08"
                  />
                </svg>
                <h1 class="opacity-80">
                  {{ activeApp.manifest.title }}
                </h1>
              </div>
            </div>
            <!-- Apps Capsule -->
            <div class="px-2 pb-2 w-full flex items-center">
              <button
                @click="onAppControlBtnClick(0)"
                class="w-16 h-full rounded-l-full bg-info glass"
              ></button>
              <!-- Middle Panel -->
              <div
                class="flex-1 h-16 border border-white/20 bg-white/20 shadow-lg px-2 gap-1 flex items-center whitespace-nowrap overflow-x-auto scrollbar-hide"
              >
                <div
                  v-if="activeAppIndex < 0"
                  class="h-full w-full flex items-center justify-center text-white opacity-60"
                >
                  No active apps
                </div>
                <!-- Running apps list -->
                <div
                  v-for="(app, index) in runningApps"
                  :key="app.id"
                  :id="'app_tab_' + app.id"
                  @click.stop
                  @click="onAppControlIconClick(index)"
                  class="animate__animated shadow-lg min-w-12 min-h-12 max-h-12 max-w-12 rounded-full border-2 overflow-hidden transition duration-300 scroll-smooth"
                  :class="[
                    activeAppIndex === index
                      ? 'border-white'
                      : 'border-white/10',
                    {
                      '-translate-y-1 animate__jello':
                        activeAppIndex === index && runningApps.length > 1
                    }
                  ]"
                >
                  <img :src="getUrl(app.manifest.icon)" />
                </div>
              </div>
              <button
                @click="onAppControlBtnClick(1)"
                class="w-16 h-full rounded-r-full bg-error glass flex items-center justify-center"
              ></button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Navigation Bar -->
    <Transition name="nav-slide">
      <Navbar
        v-if="canShowNavbar"
        :onNavbarClick
        :isKeyboardOpen
        :closeKeyboard
        :theme="activeAppTheme"
      />
    </Transition>

    <!-- Bottom bubble Triggers (fallback) -->
    <div
      v-if="canShowFallbackTrigger"
      class="absolute bottom-0 right-0 z-[150] bg-white/10 w-12 h-12 rounded-tl-full"
      @click="onFallbackBubbleClick"
    ></div>

    <!-- swipe bubble stick -->
    <Transition name="slide-left">
      <RightStick v-if="uiConfig.state.stickBar" :onStickBarSwipe />
    </Transition>

    <!-- Modules -->
    <div v-if="currentModule" class="fixed fscreen inset-0 z-[99]">
      <WallpaperChanger
        v-if="currentModule === 'WallpaperChanger'"
        :close="closeModule"
      />
      <Settings v-else-if="currentModule === 'Settings'" :close="closeModule" />
      <Logout v-else-if="currentModule === 'Logout'" :close="closeModule" />
    </div>
  </div>
</template>

<style>
  /* ENTER — slide from right to left */
  .slide-enter-from {
    transform: translateX(100%);
    opacity: 0;
  }

  .slide-enter-to {
    transform: translateX(0);
    opacity: 1;
  }

  /* LEAVE — slide up */
  .slide-leave-from {
    transform: translateY(0);
    opacity: 1;
  }

  .slide-leave-to {
    transform: translateY(-100%);
    opacity: 0;
  }

  /* Active (shared timing) */
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
  }

  /* ENTER (slide down) */
  .statusbar-slide-enter-active {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }

  .statusbar-slide-enter-from {
    transform: translateY(-100%);
    opacity: 0;
  }

  .statusbar-slide-enter-to {
    transform: translateY(0);
    opacity: 1;
  }

  /* LEAVE (slide up) */
  .statusbar-slide-leave-active {
    transition: none;
  }

  .statusbar-slide-leave-from {
    transform: translateY(0);
    opacity: 1;
  }

  .statusbar-slide-leave-to {
    transform: translateY(-100%);
    opacity: 0;
  }

  /* ENTER (when becoming visible) */
  .nav-slide-enter-from {
    transform: translateY(100%);
    opacity: 0;
  }

  .nav-slide-enter-active {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }

  .nav-slide-enter-to {
    transform: translateY(0);
    opacity: 1;
  }

  /* LEAVE (when closing — no effect) */
  .nav-slide-leave-active {
    transition: none;
  }

  .nav-slide-leave-from,
  .nav-slide-leave-to {
    transform: translateY(0);
    opacity: 1;
  }

  .app-control-enter-active,
  .app-control-leave-active {
    transition:
      max-height 200ms linear,
      opacity 200ms ease;
    transform-origin: bottom;
  }

  .app-control-enter-from,
  .app-control-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .app-control-enter-to,
  .app-control-leave-from {
    max-height: 160px;
    opacity: 1;
  }
</style>
