<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { fetchAppsList } from "@/kikx";

  import AppIcon from "@/components/ui/AppIcon.vue";

  defineProps(["openApp"]);

  const appsList = ref([]);

  onMounted(async () => {
    appsList.value = await fetchAppsList();
  });
</script>

<template>
  <div class="absolute inset-0 select-none overflow-y-auto">
    <div class="py-6 px-4 grid grid-cols-4 gap-4">
      <AppIcon
        v-for="app in appsList"
        :key="app.name"
        @click="openApp(app.name)"
        v-longpress="() => openApp(app.name, true)"
        :title="app.title"
        :icon="app.icon"
        class="aspect-square w-full flex items-center justify-center"
      />
    </div>
  </div>
</template>