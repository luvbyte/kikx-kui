<template>
  <div
    v-swipe="onStickBarSwipe"
    class="fixed right-0 z-[160] bg-white/20 w-4 h-26 top-1/2 -translate-y-1/2 rounded-l-lg border border-white/60 border-r-0 opacity-80"
  ></div>
</template>

<script setup>
  defineProps(["onStickBarSwipe"]);
</script>
