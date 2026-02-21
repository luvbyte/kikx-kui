<script setup>
  import { computed, ref } from "vue";
  import { useUIConfig } from "@/stores/kikx";

  import { getUrl } from "@/kikx/config";

  defineProps(["onAlertClick"]);

  const uiConfig = useUIConfig();

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
</script>

<template>
  <div
    @click.stop
    class="flex-1 flex flex-col rounded-2xl border-2 border-white/40 bg-white/20 shadow-2xl overflow-hidden"
  >
    <!-- Header -->
    <div
      class="px-4 py-3 border-b border-white/20 bg-pink-400/80 flex justify-between items-center shadow-lg"
    >
      <h1 class="text-white font-semibold tracking-wide">Alerts</h1>
      <button @click="uiConfig.alerts.length = 0" class="btn btn-xs opacity-80">
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
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
      <div
        v-for="appAlert in sortedAlerts"
        :key="appAlert.uid"
        class="flex items-center gap-2 p-3 bg-white/60 border-white/40 rounded-xl border-2 shadow-lg transition-all duration-200"
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

        <!-- Content -->
        <div class="flex-1 gap-2 min-w-0">
          <!-- Header -->
          <div class="flex items-start justify-between gap-2">
            <h1 class="font-semibold leading-tight truncate">
              {{ appAlert.title || "Notification" }}
            </h1>

            <span
              v-if="appAlert.priority === 'high'"
              class="text-xs px-2 py-1 rounded-full bg-black/20 whitespace-nowrap"
            >
              HIGH
            </span>
          </div>

          <!-- Message -->
          <div class="relative text-sm">
            <div
              :class="[
                'whitespace-pre-line',
                !expandedAlerts.has(appAlert.uid) ? 'line-clamp-2' : ''
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
              class="absolute bottom-0 right-0 text-xs bg-white/80 px-2 py-0.5 rounded-md shadow"
            >
              <svg
                v-if="expandedAlerts.has(appAlert.uid)"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 32 32"
              >
                <path
                  fill="currentColor"
                  d="M23.963 20.834L17.5 9.64c-.825-1.43-2.175-1.43-3 0L8.037 20.834c-.825 1.43-.15 2.598 1.5 2.598h12.926c1.65 0 2.325-1.17 1.5-2.598"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 32 32"
              >
                <path
                  fill="currentColor"
                  d="M8.037 11.166L14.5 22.36c.825 1.43 2.175 1.43 3 0l6.463-11.195c.826-1.43.15-2.598-1.5-2.598H9.537c-1.65 0-2.326 1.17-1.5 2.6z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="p-4 border-t border-white/20 text-xs text-white/60 text-center"
    ></div>
  </div>
</template>
