import { ref, computed } from "vue";
import { getUrl } from "@/kikx/config";

export function useRunningApps(client, uiConfig, changeScreen) {
  const runningApps = ref<any[]>([]);
  const activeAppIndex = ref<number>(-1);

  // ---------------- ACTIVE APP
  const activeApp = computed(() => {
    if (
      activeAppIndex.value < 0 ||
      activeAppIndex.value >= runningApps.value.length
    ) {
      return null;
    }

    return runningApps.value[activeAppIndex.value];
  });

  // ---------------- SET ACTIVE
  function setActiveApp(index: number) {
    if (index < 0 || index >= runningApps.value.length) {
      activeAppIndex.value = -1;
      return;
    }

    activeAppIndex.value = index;
  }

  // ---------------- MOVE INDEX
  function moveIndex(arr: any[], index: number, next: boolean) {
    const total = arr.length;

    if (total === 0) return -1;
    if (index < 0) return 0;

    return next
      ? (index + 1) % total
      : (index - 1 + total) % total;
  }

  function switchAppLeft() {
    if (!runningApps.value.length) return;
    activeAppIndex.value = moveIndex(
      runningApps.value,
      activeAppIndex.value,
      true
    );
  }

  function switchAppRight() {
    if (!runningApps.value.length) return;
    activeAppIndex.value = moveIndex(
      runningApps.value,
      activeAppIndex.value,
      false
    );
  }

  // ---------------- OPEN APP
  async function openApp(name: string, sudo = false) {
    try {
      const res = await fetch(getUrl("/open-app"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sudo,
          client_id: client.clientID
        })
      });

      const data = await res.json();

      runningApps.value.push(data);
      setActiveApp(runningApps.value.length - 1);
      changeScreen("app");
    } catch (err) {
      console.error("Open app failed:", err);
    }
  }

  // ---------------- CLOSE APP
  async function closeApp(index: number) {
    const app = runningApps.value[index];
    if (!app) return;

    runningApps.value.splice(index, 1);

    try {
      await fetch(getUrl("/close-app"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: app.id,
          client_id: client.clientID
        })
      });

      uiConfig.removeAppAlerts(app.id);
    } catch (err) {
      console.error("Close app failed:", err);
    }

    const total = runningApps.value.length;

    if (total === 0) {
      activeAppIndex.value = -1;
      changeScreen("home");
      return;
    }

    if (index >= total) {
      activeAppIndex.value = total - 1;
    }
  }

  // ---------------- EXTERNAL CLOSE (ws event safe)
  function closeAppById(appId: string) {
    const index = runningApps.value.findIndex(a => a.id === appId);
    if (index !== -1) {
      closeApp(index);
    }
  }

  return {
    runningApps,
    activeAppIndex,
    activeApp,
    setActiveApp,
    switchAppLeft,
    switchAppRight,
    openApp,
    closeApp,
    closeAppById
  };
}