<script setup>
  import { ref } from "vue";
  import { getImageUrl } from "@/kikx/config";

  defineProps(["title", "icon"]);
</script>

<template>
  <div
    class="w-20 aspect-square flex flex-col items-center bg-white/30 border-2 border-white/30 active:bg-white/60 transition-colors duration-100 p-2 px-3 rounded-lg"
  >
    <div class="w-10 aspect-square flex items-center justify-center relative">
      <img
        draggable="false"
        class="w-10 aspect-square rounded-xl object-cover"
        :src="getImageUrl(icon)"
      />
    </div>

    <div
      class="text-white text-xs text-center truncate w-full font-heading mt-auto"
    >
      {{ title }}
    </div>
  </div>
</template>
