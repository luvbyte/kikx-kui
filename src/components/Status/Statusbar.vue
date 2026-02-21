<script setup lang="ts">
  import { ref, watch } from "vue";
  import Clock from "./Clock.vue";
  import BatteryPercentage from "./BatteryPercentage.vue";
  import NetworkStatus from "./NetworkStatus.vue";

  import AppAlertIcons from "./AppAlertIcons.vue";
  import AppAlertsPanel from "./AppAlertsPanel.vue";

  import { useUIConfig } from "@/stores/kikx";

  const uiConfig = useUIConfig();

  defineProps(["onStatusbarSwipe", "isSudoApp"]);

  const showAlertsPanel = ref(false);

  watch(
    () => uiConfig.alerts.length,
    () => {
      // show panel
      if (
        uiConfig.state.canToast &&
        uiConfig.pendingToastAlerts.length > 0
      ) {
        showAlertsPanel.value = true;
      }
    }
  );
</script>

<template>
  <div
    class="min-h-8 overflow-hidden bg-black/60 w-full text-xs text-white"
    v-swipe="onStatusbarSwipe"
  >
    <div class="relative h-full w-full">
      <Transition name="slide-down" mode="out-in">
        <AppAlertsPanel
          v-if="showAlertsPanel"
          key="alerts-panel"
          :close="() => (showAlertsPanel = false)"
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
            <Transition name="fade">
              <div v-if="isSudoApp">ᥫ᭡</div>
            </Transition>
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
