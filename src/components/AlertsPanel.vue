<script setup>
  import { computed, ref } from "vue";
  import { useUIConfig } from "@/stores/kikx";

  import { getUrl } from "@/kikx/config";
  import TimeStampRelative from "@/components/utils/TimeStampRelative.vue";

  const props = defineProps(["onAlertClick", "close", "closePanel"]);

  const uiConfig = useUIConfig();

  const swiping = ref(null); // uid being swiped
  const offsetX = ref(0);
  const startX = ref(0);
  const isDragging = ref(false);

  const expandedAlerts = ref(new Set());

  const toggleExpand = uid => {
    if (expandedAlerts.value.has(uid)) {
      expandedAlerts.value.delete(uid);
    } else {
      expandedAlerts.value.add(uid);
    }
  };

  const sortedAlerts = computed(() => {
    const priorityOrder = {
      high: 0,
      normal: 1,
      less: 2
    };

    return [...uiConfig.alerts].sort((a, b) => {
      // Sort by priority
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // If same priority → newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  });

  function closeAlert(appAlert) {
    uiConfig.removeAppAlert(appAlert.uid);
  }

  function onTouchStart(e, uid) {
    swiping.value = uid;
    startX.value = e.touches[0].clientX;
    isDragging.value = true;
  }

  function onTouchMove(e) {
    if (!isDragging.value) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const diffX = currentX - startX.value;

    // Only react if horizontal swipe
    if (Math.abs(diffX) > 5) {
      offsetX.value = Math.min(0, diffX);
    }
  }

  function onTouchEnd(appAlert) {
    if (!isDragging.value) return;

    const threshold = -120; // swipe distance to dismiss

    if (offsetX.value < threshold) {
      // animate out
      offsetX.value = -500;

      setTimeout(() => {
        closeAlert(appAlert);
        resetSwipe();
      }, 200);
    } else {
      // snap back
      resetSwipe();
    }
  }

  function resetSwipe() {
    offsetX.value = 0;
    isDragging.value = false;
    swiping.value = null;
  }

  function closeAllAlerts() {
    uiConfig.clearAlerts();
  }
</script>

<template>
  <div
    @click.stop
    class="flex-1 flex flex-col rounded-2xl border-2 border-white/40 bg-white/20 shadow-2xl overflow-hidden"
  >
    <!-- Header -->
    <div
      class="px-4 py-1 border-b border-white/20 bg-pink-400/80 flex justify-between items-center shadow-lg"
    >
      <div class="flex gap-2 items-center justify-center p-2">
        <h1 class="text-white font-semibold tracking-wide">Alerts</h1>
        <h1
          v-if="uiConfig.alerts.length > 0"
          class="badge badge-sm opacity-80 shadow-lg font-semibold"
        >
          {{ uiConfig.alerts.length }}
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <button @click="closeAllAlerts" class="btn btn-xs opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M4 17q-.425 0-.712-.288T3 16t.288-.712T4 15h12q.425 0 .713.288T17 16t-.288.713T16 17zm2-4q-.425 0-.712-.288T5 12t.288-.712T6 11h12q.425 0 .713.288T19 12t-.288.713T18 13zm2-4q-.425 0-.712-.288T7 8t.288-.712T8 7h12q.425 0 .713.288T21 8t-.288.713T20 9z"
            />
          </svg>
        </button>
        <button @click="closePanel" class="btn btn-xs opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Scrollable Content -->
    <TransitionGroup
      name="alert"
      tag="div"
      class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide scroll-smooth"
    >
      <div
        v-for="appAlert in sortedAlerts"
        :key="appAlert.uid"
        class="relative flex items-start gap-2 p-3 bg-white/80 border-white/40 rounded-xl border-2 shadow-lg transition-all duration-200"
        :style="
          swiping === appAlert.uid
            ? {
                transform: `translateX(${offsetX}px)`,
                opacity: 1 + offsetX / 300
              }
            : {}
        "
        @touchstart="e => onTouchStart(e, appAlert.uid)"
        @touchmove="onTouchMove"
        @touchend="() => onTouchEnd(appAlert)"
        @click="onAlertClick(appAlert.id)"
      >
        <!-- Icon Image -->
        <div v-if="appAlert.icon" class="flex-shrink-0">
          <img
            :src="getUrl(appAlert.icon)"
            alt="alert icon"
            class="h-12 rounded-lg object-cover aspect-square border-2 border-white/40 bg-white/20"
          />
        </div>
        <!-- Timestamp -->
        <div class="absolute top-2 right-2 badge badge-sm opacity-80">
          <TimeStampRelative :timestamp="appAlert.createdAt" />
        </div>

        <!-- Content -->
        <div class="flex-1 flex flex-col gap-1 min-w-0">
          <!-- Header -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex gap-1 items-center">
              <h1 class="font-semibold leading-tight truncate">
                {{ appAlert.title || "Notification" }}
              </h1>
              <div class="flex items-center justify-center">
                <!-- Success icon -->
                <svg
                  v-if="appAlert.type === 'success'"
                  class="text-success"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 48 48"
                >
                  <defs>
                    <mask id="SVG4IxzvcIZ">
                      <g
                        fill="none"
                        stroke="#fff"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                      >
                        <path
                          fill="#555555"
                          d="m24 4l5.253 3.832l6.503-.012l1.997 6.188l5.268 3.812L41 24l2.021 6.18l-5.268 3.812l-1.997 6.188l-6.503-.012L24 44l-5.253-3.832l-6.503.012l-1.997-6.188l-5.268-3.812L7 24l-2.021-6.18l5.268-3.812l1.997-6.188l6.503.012z"
                        />
                        <path d="m17 24l5 5l10-10" />
                      </g>
                    </mask>
                  </defs>
                  <path
                    fill="currentColor"
                    d="M0 0h48v48H0z"
                    mask="url(#SVG4IxzvcIZ)"
                  />
                </svg>
                <!-- Warning icon -->
                <svg
                  v-else-if="appAlert.type === 'warning'"
                  class="text-warning"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M4.47 19h15.06L12 5.99zM13 18h-2v-2h2zm0-4h-2v-4h2z"
                    opacity="0.3"
                  />
                  <path
                    fill="currentColor"
                    d="M1 21h22L12 2zm3.47-2L12 5.99L19.53 19zM11 16h2v2h-2zm0-6h2v4h-2z"
                  />
                </svg>
                <svg
                  v-else-if="appAlert.type === 'error'"
                  class="text-error"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8m1 13h-2v-2h2zm0-4h-2V7h2z"
                    opacity="0.3"
                  />
                  <path
                    fill="currentColor"
                    d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m-1-5h2v2h-2zm0-8h2v6h-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Message -->
          <div class="relative text-sm transition-all duration-600">
            <div
              :class="[
                'whitespace-pre-line w-[85%] font-medium',
                !expandedAlerts.has(appAlert.uid) ? 'line-clamp-1' : ''
              ]"
            >
              <template v-if="Array.isArray(appAlert.msg)">
                {{ appAlert.msg.join(" ") }}
              </template>
              <template v-else>
                {{ appAlert.msg }}
              </template>
            </div>

            <!-- Expand Button -->
            <button
              v-if="
                (Array.isArray(appAlert.msg)
                  ? appAlert.msg.join(' ').length
                  : appAlert.msg?.length) > 120
              "
              @click.stop="toggleExpand(appAlert.uid)"
              class="absolute -bottom-2 -right-1 text-xs text-secondary bg-white/80 px-2 py-0.5 rounded-md shadow"
            >
              <svg
                v-if="expandedAlerts.has(appAlert.uid)"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m17 14l-5-5m0 0l-5 5"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m7 10l5 5m0 0l5-5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Footer -->
    <div class="p-4 border-t border-white/20 bg-pink-400/80"></div>
  </div>
</template>

<style scoped>
  .alert-enter-active,
  .alert-leave-active {
    transition: all 0.3s ease;
  }

  .alert-move {
    transition: transform 0.3s ease;
  }

  .alert-leave-to {
    opacity: 0;
    transform: translateX(-80px) scale(0.95);
  }
</style>
