<script setup>
  import { computed, ref, watch } from "vue";
  import { useUIConfig } from "@/stores/kikx";

  import { getUrl } from "@/kikx/config";

  const uiConfig = useUIConfig();
  const props = defineProps(["close"]);

  const currentAlert = computed(() => {
    return uiConfig.pendingToastAlerts[0] || null;
  });

  // Alert Class
  const alertTypeClasses = {
    success: "bg-success/80 text-success-content",
    error: "bg-error/80 text-error-content",
    warning: "bg-warning/80 text-warning-content",
    info: "bg-black/60",
    default: ""
  };

  function getClass(alert) {
    if (!alert?.type) return alertTypeClasses.default;
    return alertTypeClasses[alert.type] || alertTypeClasses.default;
  }

  function getTickerStyle(alert) {
    if (!alert) return { animationDuration: "8s" };

    const text = (alert.title || "") + " " + (alert.msg || "");
    const length = text.length;

    const baseSpeed = 0.09;
    let duration = length * baseSpeed;

    if (length < 30) duration *= 0.7;

    duration = Math.min(Math.max(duration, 4), 18);

    return {
      animationDuration: duration + "s"
    };
  }

  const getAlertMessage = msg => {
    return Array.isArray(msg) ? msg.join(" ") : msg;
  };

  // Move to next alert
  function goNext() {
    const alert = currentAlert.value;
    if (!alert) return;

    uiConfig.toastComplete(alert.uid);

    // After removal, the next alert shifts into same index.

    if (uiConfig.pendingToastAlerts.length === 0) {
      props.close();
    }
  }

  function handleAnimationEnd() {
    goNext();
  }

  function skipAlert() {
    goNext();
  }
</script>

<template>
  <div
    v-if="currentAlert"
    class="select-none fscreen flex items-center font-semibold overflow-hidden whitespace-nowrap transition-colors duration-600"
    :class="getClass(currentAlert)"
    @click="skipAlert"
    v-longpress="close"
  >
    <div
      class="ticker flex items-center gap-1"
      :style="getTickerStyle(currentAlert)"
      :key="currentAlert.uid"
      @animationend="handleAnimationEnd"
    >
      <img
        :src="getUrl(currentAlert.icon)"
        class="h-4 w-4 rounded aspect-square"
      />
      <h1 v-if="false" class="font-bold">{{ currentAlert.title }}</h1>
      <p>
        {{ getAlertMessage(currentAlert.msg) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
  .ticker {
    padding-left: 100%;
    animation-name: tickerMove;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }

  @keyframes tickerMove {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(-100%);
    }
  }
</style>
