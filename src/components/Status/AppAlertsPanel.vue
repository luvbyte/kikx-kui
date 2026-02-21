<script setup>
  import { computed, ref, watch } from "vue";
  import { useUIConfig } from "@/stores/kikx";

  import { getUrl } from "@/kikx/config";

  const uiConfig = useUIConfig();
  const props = defineProps(["close"]);

  const currentIndex = ref(0);

  // Sort alerts (not required)
  const sortedAlerts = computed(() => {
    return [...uiConfig.alerts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  });

  // Current alert derived from index
  const currentAlert = computed(() => {
    return uiConfig.pendingToastAlerts[currentIndex.value] || null;
  });

  // Alert Class
  const alertTypeClasses = {
    success: "bg-success/60 text-success-content",
    error: "bg-error/60 text-error-content",
    warning: "bg-warning/60 text-warning-content",
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

  // Move to next alert
  function goNext() {
    // tracking completed or skipped
    uiConfig.toastComplete(currentAlert.value.uid);

    if (currentIndex.value >= uiConfig.pendingToastAlerts.length - 1) {
      props.close?.();
      return;
    }
    currentIndex.value++;
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
        {{ currentAlert.msg }}
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
