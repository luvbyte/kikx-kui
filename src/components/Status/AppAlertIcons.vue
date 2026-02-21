<script setup>
  import { computed } from "vue";
  import { useUIConfig } from "@/stores/kikx";
  import { getUrl } from "@/kikx/config";

  const uiConfig = useUIConfig();

  // Newest first (no need for priority here)
  const recentIcons = computed(() => {
    return [...uiConfig.alerts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  });
</script>

<template>
  <div class="flex items-center gap-0.5">
    <div
      v-for="(alert, index) in recentIcons"
      :key="alert.uid"
      class="relative"
    >
      <img
        v-if="alert.icon"
        :src="getUrl(alert.icon)"
        class="w-4 h-4 rounded-sm object-cover aspect-square"
      />
    </div>
    <div
      v-if="uiConfig.alerts.length >= 5"
      class="font-heading font-semibold flex justify-end"
    >
      ...
    </div>
  </div>
</template>
