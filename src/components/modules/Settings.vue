<template>
  <div
    @click.self="close"
    class="fixed z-20 inset-0 fscreen flex flex-col justify-between bg-white/40"
  >
    <h1 class="p-2 text-center bg-white/40 font-semibold">Settings</h1>
  </div>
</template>

<script setup>
  defineProps(["close"]);
</script>
