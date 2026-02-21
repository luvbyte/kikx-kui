<template>
  <div class="relative flex items-center justify-center gap-1">
    <svg class="w-3.5 h-3.5 -rotate-90" viewBox="0 0 120 120">
      <!-- Background -->
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke-width="14"
        fill="none"
        class="stroke-gray-200"
      />

      <!-- Progress -->
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke-width="14"
        fill="none"
        stroke-linecap="round"
        :class="batteryLevel < 20 ? 'stroke-red-500' : 'stroke-green-500'"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        class="transition-all duration-300"
      />
    </svg>

    <div class="font-semibold font-heading">{{ batteryLevel }}%</div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from "vue";

  const batteryLevel = ref(0);
  let batteryRef = null;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const dashOffset = computed(
    () => circumference - (batteryLevel.value / 100) * circumference
  );

  const updateBattery = () => {
    if (!batteryRef) return;
    batteryLevel.value = Math.round(batteryRef.level * 100);
  };

  onMounted(async () => {
    if (!navigator.getBattery) {
      batteryLevel.value = 0;
      return;
    }

    batteryRef = await navigator.getBattery();
    updateBattery();
    batteryRef.addEventListener("levelchange", updateBattery);
  });

  onUnmounted(() => {
    batteryRef?.removeEventListener("levelchange", updateBattery);
  });
</script>
