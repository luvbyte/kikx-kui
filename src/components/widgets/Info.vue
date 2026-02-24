<template>
  <Loading v-if="loading" class="text-white" />

  <div v-else class="flex-1 overflow-y-auto scrollbar-hide">
    <!-- User Info -->
    <div class="p-2 flex justify-between items-center bg-white/40">
      <h1 class="font-semibold">{{ info.user.name }}</h1>
      <div class="badge badge-sm badge-primary shadow-lg">
        {{ info.user.username }}
      </div>
    </div>

    <!-- Client Info -->
    <div class="flex flex-col">
      <div
        class="p-2 flex justify-center items-center bg-white/60 border-y border-white/40"
      >
        <h1 class="font-semibold">Session</h1>
      </div>
      <div class="p-2 flex justify-between items-center bg-white/40">
        <h1>ID</h1>
        <button
          @click="revealID = !revealID"
          class="badge badge-sm badge-soft shadow-lg"
        >
          {{ revealID ? info.id : "Click to reveal" }}
        </button>
      </div>
      <div class="p-2 flex justify-between items-center bg-white/40">
        <h1>Uptime</h1>
        <div class="badge badge-sm badge-soft shadow-lg">
          <TimeStampRelative :timestamp="info.created_at" />
        </div>
      </div>
      <div class="p-2 flex justify-between items-center bg-white/40">
        <h1>Access Token</h1>
        <button
          @click="revealAccessToken = !revealAccessToken"
          class="badge badge-sm badge-soft shadow-lg"
        >
          {{ revealAccessToken ? info.access_token : "Click to reveal" }}
        </button>
      </div>
    </div>
    <!-- Apps Info -->
    <div class="flex flex-col">
      <div
        class="p-2 flex justify-center items-center bg-white/60 border-y border-white/40"
      >
        <h1 class="font-semibold">Apps</h1>
      </div>

      <div v-for="app in info.apps" class="p-2">
        <div class="p-2 border-2 rounded-lg border-white/20 bg-white/40">
          <div class="flex items-center justify-between">
            <h1 class="text-lg font-bold">{{ app.title }}</h1>
            <div
              class="badge badge-sm"
              :class="app.sudo ? 'badge-secondary' : 'badge-primary'"
            >
              {{ app.name }}
            </div>
          </div>

          <div class="divider m-0"></div>

          <div
            class="px-2 flex items-center justify-center bg-white/40 p-0.5 rounded"
          >
            <button @click="toggleAppIDReveal(app.id)" class="text-sm">
              {{
                revealedAppNames.includes(app.id)
                  ? app.id
                  : "Click to reveal id"
              }}
            </button>
          </div>

          <div class="mt-2 flex justify-between items-center text-sm">
            <div class="flex items-center gap-1">
              <p>Started</p>
              <TimeStampRelative :timestamp="app.created_at" />
            </div>

            <div
              v-if="app.connection.connected"
              class="badge badge-sm badge-secondary"
            >
              WS Connected
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onBeforeMount, onUnmounted } from "vue";

  import { getSystem } from "@/kikx";

  import Loading from "@/components/Loading.vue";
  import TimeStampRelative from "@/components/utils/TimeStampRelative.vue";

  const system = getSystem();

  const info = ref(null);
  const loading = ref(true);
  let intervalId = null;

  const revealID = ref(false);
  const revealAccessToken = ref(false);

  const revealedAppNames = ref([]);

  function toggleAppIDReveal(appID) {
    const index = revealedAppNames.value.indexOf(appID);

    if (index === -1) {
      // Not revealed → add it
      revealedAppNames.value.push(appID);
    } else {
      // Already revealed → remove it
      revealedAppNames.value.splice(index, 1);
    }
  }

  async function fetchInfo() {
    try {
      const res = await system.func("info");

      console.log(res);

      if (res?.data) {
        info.value = res.data;
      }
    } catch (err) {
      console.error("Failed to fetch info:", err);
    }
  }

  onBeforeMount(async () => {
    await fetchInfo(); // initial fetch
    loading.value = false;

    intervalId = setInterval(() => {
      fetchInfo();
    }, 3000);
  });

  onUnmounted(() => {
    clearInterval(intervalId);
  });
</script>
