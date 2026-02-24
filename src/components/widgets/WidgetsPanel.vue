<script setup>
  import { useUIConfig } from "@/stores/kikx";

  import Info from "./Info.vue";

  const uiConfig = useUIConfig();

  defineProps(["closePanel"]);
</script>

<template>
  <div
    @click.stop
    class="flex-1 flex flex-col rounded-2xl border-2 border-white/60 bg-white/20 shadow-2xl overflow-hidden"
  >
    <!-- Header -->
    <div
      class="px-2 py-3 border-b border-white/20 bg-blue-400/80 flex justify-between items-center"
    >
      <h1 class="text-white font-semibold tracking-wide">KIKX MUI</h1>
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

    <Info />

    <!-- Footer -->
    <div class="p-4 border-t border-white/20 bg-blue-400/80"></div>
  </div>
</template>
