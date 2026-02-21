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

  import AppsMenu from "@/components/AppsMenu.vue";
  import Statusbar from "@/components/Status/Statusbar.vue";

  import ControlCenter from "@/components/ControlCenter.vue";

  import App from "@/components/App.vue";
  import Bg from "@/components/Bg.vue";

  import WallpaperChanger from "@/components/modules/WallpaperChanger.vue";
  import Settings from "@/components/modules/Settings.vue";
  import Loading from "@/components/Loading.vue";

  import Navbar from "@/components/Navbar.vue";
  import RightStick from "@/components/RightStick.vue";

  import { client, devLogin } from "@/kikx";
  import { getUrl } from "@/kikx/config";

  import { useUIConfig } from "@/stores/kikx";
  import { muiConfig } from "@/kikx";

  import { playSound } from "@/kikx/sound";

  const loading = ref(true);
  const connected = ref(false);

  // This MUI config
  const uiConfig = useUIConfig();

  const showAppsMenu = ref(false);
  const showAppsPanel = ref(false);

  const currentModule = ref(null);

  const showTopFrame = ref(false);

  const showBottomFrame = ref(false);

  const runningApps = ref<any[]>([]);
  const activeAppIndex = ref<number>(-1);

  function showModule(name) {
    showAppsMenu.value = false;
    showTopFrame.value = false;

    showBottomFrame.value = false;

    currentModule.value = name;
  }

  function hideModule() {
    currentModule.value = false;
  }

  function scrollTabToApp(index: number) {
    if (index < 0) return;
    if (!showBottomFrame.value) return;
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

  watch(activeAppIndex, async indexNew => {
    await nextTick();
    scrollTabToApp(indexNew);
  });

  watch(showBottomFrame, async newValue => {
    await nextTick();
    if (newValue) scrollTabToApp(activeAppIndex.value);
  });

  /* ----------------------------------------------------------
   Swipe handlers
  ---------------------------------------------------------- */
  function onHomeSwipe(direction: string) {
    if (direction === "up") {
      showAppsMenu.value = true;
    } else if (direction === "left") {
      showTopFrame.value = true;
      showAppsMenu.value = false;
    } else if (direction === "right") {
      showAppsMenu.value = false;
      showBottomFrame.value = true;
    }
  }

  function onBottomFrameSwipe(direction: string) {
    if (direction === "up") {
      minimizeApp(true);
    } else if (activeApp.value) {
      if (direction === "left") {
        swithAppLeft();
      } else if (direction === "right") {
        swithAppRight();
      }
    }
  }

  function onStatusbarSwipe(direction: string) {
    showAppsMenu.value = false;
    if (direction === "right") {
      showAppsPanel.value = true;
      showBottomFrame.value = true;
    } else if (direction === "left") {
      showTopFrame.value = true;
    } else if (direction === "down") {
      showTopFrame.value = true;
    }
  }

  function onStickBarSwipe(direction) {
    if (direction === "up") {
      showTopFrame.value = false;
      showAppsMenu.value = false;

      showAppsPanel.value = true;
      showBottomFrame.value = true;
    } else if (direction === "down") {
      showAppsPanel.value = false;
      showBottomFrame.value = false;
      showTopFrame.value = false;
    }
  }
  function onRightBubbleClick() {
    showTopFrame.value = false;
    showAppsMenu.value = false;

    showBottomFrame.value = !showBottomFrame.value;
    showAppsPanel.value = showBottomFrame.value;
  }

  // 0 - home, 1 - recents, 2 close
  function onNavbarClick(btnIndex) {
    if (btnIndex === 0) {
      onStickBarSwipe("down");
    } else if (btnIndex === 1) {
      onStickBarSwipe("up");
    } else if (btnIndex === 2) {
      closeActiveApp();

      // if not apps show home
      if (runningApps.value.length <= 0) {
        onStickBarSwipe("down");
      }
    }
  }

  /* ----------------------------------------------------------
   Utility functions
  ---------------------------------------------------------- */
  const activeApp = computed(() => {
    return runningApps.value[activeAppIndex.value];
  });

  const isSudoApp = computed(() => {
    return activeApp.value && activeApp.value.isSudo && showAppsPanel.value;
  });

  function closeBottomFrame() {
    showBottomFrame.value = false;
    if (activeAppIndex.value < 0) {
      showAppsPanel.value = false;
    }
  }

  function setActiveApp(index: number) {
    showAppsPanel.value = true;
    activeAppIndex.value = index;
  }

  function closeActiveApp() {
    if (!activeApp.value) return;
    closeApp(activeAppIndex.value);
  }

  // Minimize app and show appsMenu if true
  function minimizeApp(showMenu = false) {
    showAppsPanel.value = false;
    showBottomFrame.value = false;

    showAppsMenu.value = showMenu;
  }

  // Switch to left app
  function swithAppLeft() {
    activeAppIndex.value = moveIndex(
      runningApps.value,
      activeAppIndex.value,
      true
    );
  }

  // Switch to right app
  function swithAppRight() {
    activeAppIndex.value = moveIndex(
      runningApps.value,
      activeAppIndex.value,
      false
    );
  }

  function onBottomFrameLB() {
    showBottomFrame.value = false;
    showTopFrame.value = true;
  }

  function moveIndex(arr: any[], index: number, next: boolean) {
    const last = arr.length - 1;
    if (last <= 0) return 0;

    return next
      ? index === last
        ? 0
        : index + 1
      : index === 0
        ? last
        : index - 1;
  }

  async function openApp(name: string, sudo: boolean = false) {
    showAppsMenu.value = false;

    try {
      const res = await fetch(getUrl("/open-app"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          client_id: client.clientID,
          sudo
        })
      });

      const data = await res.json();

      runningApps.value.push(data);
      activeAppIndex.value = runningApps.value.length - 1;

      showAppsPanel.value = true;
    } catch (err) {
      console.error("Open app failed:", err);
    }
  }

  async function closeApp(index: number) {
    const app = runningApps.value[index];
    if (!app) return;

    runningApps.value.splice(index, 1);

    try {
      await fetch(getUrl("/close-app"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: app.id, client_id: client.clientID })
      });
      // remove alerts
      uiConfig.removeAppAlerts(app.id);
    } catch (err) {
      console.error("Close app failed:", err);
    }

    // Fix active index
    if (runningApps.value.length === 0) {
      activeAppIndex.value = -1;
    } else {
      activeAppIndex.value = Math.min(
        activeAppIndex.value,
        runningApps.value.length - 1
      );
    }
  }

  function appNotify(payload) {
    console.log(payload);
  }

  function appAlert(payload) {
    console.log(activeApp.value);
    console.log(payload);

    if (!uiConfig.state.isSilent) {
      playSound("alert");
    }

    uiConfig.addAppAlert(payload);
  }

  function onAlertClick(appID) {
    showTopFrame.value = false;

    const index = runningApps.value.findIndex(app => app.id === appID);

    if (index !== -1) {
      setActiveApp(index);
    } else {
      // TODO: DO something later :)
      uiConfig.removeAppAlerts(appID);
    }
  }

  async function loadConfigAndWatch() {
    await muiConfig.load();
    watchDebounced(
      () => uiConfig.state,
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

  onBeforeMount(async () => {
    // Dev
    await devLogin("kikx");

    // Event bindings
    client.on("ws:onclose", e => {
      if (e.code === 1008) {
        // unauthorized reload or show login screen
        location.reload();
      }
      loading.value = true;
    });

    // Client reconnect
    client.on("reconnected", () => {
      loading.value = false;
    });

    // App closing by itself
    client.on("app:close", app => {
      try {
        if (activeApp && activeApp.id === app.id) {
          closeActiveApp();
        }
      } catch (e) {}
    });

    // notify event (old)
    client.on("app:notify", payload => {});

    // app alert event
    client.on("app:alert", payload => appAlert(payload));

    client.run(async data => {
      await loadConfigAndWatch();

      console.log("Client Event:", data);

      connected.value = true;
      loading.value = false;
    });

    // event bindings
  });

  onMounted(async () => {});
</script>

<template>
  <div
    data-theme="light"
    class="h-dvh w-full flex flex-col overflow-hidden bg-transparent"
  >
    <!-- Loading -->
    <Transition name="fade">
      <div v-if="loading" class="fixed z-[999] inset-0 fscreen bg-black/60">
        <Loading class="text-white" label="Loading" />
      </div>
    </Transition>

    <Bg v-if="connected" />

    <!-- Top statusbar -->
    <Transition name="statusbar-slide">
      <Statusbar
        v-if="!showBottomFrame && !uiConfig.state.iScreen && !currentModule"
        :isSudoApp
        :onStatusbarSwipe
      />
    </Transition>

    <!-- Main interactive frame -->
    <div v-swipe="onHomeSwipe" class="flex-1 relative">
      <!-- Apps menu overlay -->
      <Transition name="fade-scale">
        <div
          v-if="showAppsMenu"
          @click="showAppsMenu = false"
          class="absolute w-full h-full bg-black/60 top-0 left-0 overflow-y-auto z-30 pt-4"
        >
          <AppsMenu :openApp="openApp" />
        </div>
      </Transition>

      <!-- Running Apps Stack -->
      <div
        v-show="(showAppsPanel || showBottomFrame) && !showTopFrame"
        class="absolute w-full h-full bg-black/60 top-0 left-0 z-20 flex flex-col items-center"
      >
        <div
          class="w-full transition duration-300"
          :class="[showBottomFrame ? 'h-[85%]' : 'h-full']"
        >
          <App
            v-for="(app, index) in runningApps"
            :key="app.id"
            class="w-full h-full overflow-hidden"
            v-show="activeAppIndex === index && activeAppIndex !== -1"
            :app="app"
            :closeApp="() => closeApp(index)"
          />
        </div>
      </div>
    </div>

    <!-- Top / Control Center Frame -->
    <Transition name="slide">
      <ControlCenter
        v-if="showTopFrame"
        :close="() => (showTopFrame = false)"
        :showModule
        :onAlertClick
      />
    </Transition>

    <!-- Bottom Frame -->
    <Transition name="slide-up">
      <!-- Fullscreen frame -->
      <div
        v-if="showBottomFrame"
        @click="closeBottomFrame"
        class="fixed z-30 fscreen inset-0 flex flex-col items-center justify-end pb-5"
      >
        <!-- Background swipe layer / control panel depends -->
        <div
          class="absolute inset-0 h-[80%]"
          v-swipe="onBottomFrameSwipe"
        ></div>

        <!-- App Title -->
        <div
          v-if="activeApp"
          class="w-64 bg-white/10 rounded-t-lg text-white border-t truncate flex items-center justify-center opacity-80"
          :class="isSudoApp ? 'border-error' : 'border-white'"
        >
          {{ activeApp.manifest.title }}
        </div>
        <!-- App switcher -->
        <div @click.stop class="px-2 w-full flex items-center">
          <button
            @click="onBottomFrameLB"
            class="w-16 h-full rounded-l-full bg-info glass"
          ></button>
          <div
            @click.stop
            class="flex-1 h-16 border border-white/20 bg-white/20 px-2 gap-1 flex items-center whitespace-nowrap overflow-x-auto scrollbar-hide"
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
              @click="setActiveApp(index)"
              class="min-w-12 min-h-12 max-h-12 max-w-12 rounded-full border-3 overflow-hidden transition duration-300 scroll-smooth"
              :class="
                activeAppIndex === index ? 'border-white' : 'border-white/10'
              "
            >
              <img :src="getUrl(app.manifest.icon)" />
            </div>
          </div>
          <button
            @click="closeActiveApp"
            class="w-16 h-full rounded-r-full bg-error glass flex items-center justify-center"
          ></button>
        </div>
      </div>
    </Transition>

    <!-- Navigation Bar -->
    <Transition name="nav-slide">
      <Navbar
        v-if="
          uiConfig.state.navbar &&
          !showBottomFrame &&
          !showTopFrame &&
          !currentModule &&
          !showAppsMenu
        "
        :onNavbarClick
      />
    </Transition>

    <!-- Bottom bubble Triggers -->
    <div
      v-if="
        uiConfig.state.iScreen &&
        !uiConfig.state.stickBar &&
        !uiConfig.state.navbar
      "
      class="absolute bottom-0 right-0 z-[150] bg-white/10 w-12 h-12 rounded-tl-full"
      @click="onRightBubbleClick"
    ></div>

    <!-- swipe bubble stick -->
    <Transition name="slide-left">
      <RightStick v-if="uiConfig.state.stickBar" :onStickBarSwipe />
    </Transition>

    <!-- Modules -->
    <div v-if="currentModule">
      <WallpaperChanger
        v-if="currentModule === 'WallpaperChanger'"
        :close="hideModule"
      />
      <Settings v-else-if="currentModule === 'Settings'" :close="hideModule" />
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
</style>
