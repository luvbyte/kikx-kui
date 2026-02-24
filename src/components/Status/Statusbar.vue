<script setup lang="ts">
  import { ref, computed, watch } from "vue";

  import { getAppTheme } from "@/kikx/style";

  import Clock from "./Clock.vue";
  import BatteryPercentage from "./BatteryPercentage.vue";
  import NetworkStatus from "./NetworkStatus.vue";

  import AppAlertIcons from "./AppAlertIcons.vue";
  import AppAlertsPanel from "./AppAlertsPanel.vue";

  import { useUIConfig } from "@/stores/kikx";

  const uiConfig = useUIConfig();

  defineProps(["isSudoApp", "theme"]);

  //const showAlertsPanel = ref(false);
  const showAlertsPanel = computed(() => {
    return uiConfig.state.canToast && uiConfig.pendingToastAlerts.length > 0;
  });

  // complete all alerts
  function onClose() {
    uiConfig.pendingToastAlerts.forEach(alert => {
      uiConfig.toastComplete(alert.uid);
    });
  }
</script>

<template>
  <div
    class="min-h-8 overflow-hidden w-full text-xs"
    :class="getAppTheme(theme)"
  >
    <div class="relative h-full w-full">
      <Transition name="slide-down" mode="out-in">
        <AppAlertsPanel
          v-if="showAlertsPanel"
          key="alerts-panel"
          :close="onClose"
        />
        <!-- Icons -->
        <div
          v-else
          key="icons-panel"
          class="fscreen px-2 flex justify-between items-center"
        >
          <!-- left notify panel -->
          <div class="flex items-center gap-1">
            <Clock />
            <AppAlertIcons />
          </div>
          <!-- right icons panel -->
          <div class="flex items-center gap-1">
            <!-- If Sudo app -->
            <div v-if="isSudoApp" class="animate__animated animate__fadeIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
            </div>
            <!-- If Silent -->
            <Transition name="fade">
              <div v-if="uiConfig.state.isSilent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="m89.752 59.582l251.583 251.584l5.433 5.432l49.473 49.473v-.001l30.861 30.861h-.001l25.318 25.318l-30.17 30.17l-187.833-187.834l.001 164.103l-110.73-85.458h-81.02V172.563h80.896l10.537-8.293l-74.518-74.518zm314.213 28.015c67.74 75.639 82.5 181.38 44.28 270.136l-32.95-32.95c23.87-71.003 8.999-151.972-44.615-210.559zm-84.385 67.509c28.626 31.924 41.556 72.77 38.788 112.752l-49.236-49.236c-4.823-12.914-12.148-25.12-21.976-35.884l-.9-.973zm-85.163-69.772l-.001 58.574l-32.78-32.78z"
                  />
                </svg>
              </div>
            </Transition>
            <!-- If toast off -->
            <Transition name="fade">
              <div v-if="!uiConfig.state.canToast">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5h9M3 10h7m8 0h1M5 15h5m4 0h1m4 0h2M3 20h9m4 0h3M3 3l18 18"
                  />
                </svg>
              </div>
            </Transition>
            <NetworkStatus />
            <BatteryPercentage />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.25s ease;
  }

  .slide-down-enter-from {
    transform: translateY(-100%);
    opacity: 0;
  }

  .slide-down-enter-to {
    transform: translateY(0);
    opacity: 1;
  }

  .slide-down-leave-from {
    transform: translateY(0);
    opacity: 1;
  }

  .slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
  }

  /* Optional smoother fade */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
