import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";

import { defaultBackground } from "@/kikx/config";

export const useUIConfig = defineStore("uiConfig", () => {
  const state = reactive({
    bg: defaultBackground, // Default Background

    isSilent: false, // Silent
    canToast: true, // Top toast alert
    iScreen: false, // IScreen mode ( hides statusbar )
    stickBar: true, // Side stick
    navbar: true // navbar
  });

  //
  const alerts = ref([]);
  const toastedAlertIDList: string[] = [];

  //
  const pendingToastAlerts = computed(() => {
    return [...alerts.value]
      .filter((alert: any) => !toastedAlertIDList.includes(alert.uid))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  });

  function toastComplete(alertID) {
    toastedAlertIDList.push(alertID);
    console.log("Toast complete: ", alertID);

    console.log(toastedAlertIDList);
    console.log(pendingToastAlerts.value);
  }

  function addAppAlert(payload) {
    // If toast off then add it to complete list
    if (!state.canToast) {
      toastComplete(payload.uid);
    }

    alerts.value.push(payload);
  }

  // not required
  function addAppAlertBack(payload) {
    alerts.value.push({
      // AppID
      id: payload.id,
      // alert ID
      uid: payload.uid,
      name: payload.name,
      title: payload.title,
      icon: payload.icon,

      type: payload.type,

      msg: payload.msg,
      delay: payload.delay,
      priority: payload.priority,
      extra: payload.extra,

      createdAt: payload.createdAt
    });
  }

  // Remove all alerts
  function clearAlerts() {
    alerts.value.length = 0;
    toastedAlertIDList.length = 0;

    console.log("Cleared alerts: ", toastedAlertIDList, alerts.value);
  }

  // Remove all alerts based on appID
  //function removeAppAlerts(appID) {
  //alerts.value = alerts.value.filter(alert => alert.id !== appID);
  //}

  function removeAppAlerts(appID: string) {
    const removedAlerts = alerts.value.filter(alert => alert.id === appID);

    // Remove from alerts
    alerts.value = alerts.value.filter(alert => alert.id !== appID);

    // Remove their uids from toasted list
    removedAlerts.forEach(alert => {
      const index = toastedAlertIDList.indexOf(alert.uid);
      if (index !== -1) {
        toastedAlertIDList.splice(index, 1);
      }
    });
    console.log("Remove App: ", appID, toastedAlertIDList);
  }

  // Remove alert based on alertID
  function removeAppAlert(alertID: string) {
    alerts.value = alerts.value.filter(alert => alert.uid !== alertID);

    const index = toastedAlertIDList.indexOf(alertID);
    if (index !== -1) {
      toastedAlertIDList.splice(index, 1);
    }

    console.log("Remove alert ID: ", alertID, toastedAlertIDList);
  }

  return {
    alerts,
    clearAlerts,
    addAppAlert,

    toastComplete,

    pendingToastAlerts,

    removeAppAlert,
    removeAppAlerts,

    // --- state
    state
  };
});
