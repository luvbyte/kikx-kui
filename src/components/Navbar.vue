<template>
  <div
    v-if="show"
    class="w-full h-10 flex items-center justify-stretch"
    :class="getAppTheme(theme)"
  >
    <!-- Recents -->
    <button
      @click="onNavbarClick(1)"
      class="w-1/3 flex justify-center items-center p-1 active:bg-white/20 rounded-lg transition duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1m0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1M3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1"
        />
      </svg>
    </button>
    <!-- Home -->
    <button
      @click="onNavbarClick(0)"
      class="w-1/3 p-1 flex justify-center items-center active:bg-white/20 rounded-lg transition duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8"
        />
      </svg>
    </button>
    <!-- Close -->
    <button
      v-if="isKeyboardOpen"
      @click="closeKeyboard"
      class="w-1/3 p-1 flex justify-center items-center active:bg-white/20 rounded-lg transition duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 1024 1024"
      >
        <path
          fill="currentColor"
          d="M831.9 340.9L512 652.7L192.1 340.9a30.6 30.6 0 0 0-42.7 0a29 29 0 0 0 0 41.6l340.3 331.7a32 32 0 0 0 44.6 0l340.3-331.7a29 29 0 0 0 0-41.7a30.6 30.6 0 0 0-42.7 0z"
          stroke-width="25.5"
          stroke="currentColor"
        />
      </svg>
    </button>
    <button
      @click="onNavbarClick(2)"
      v-else
      class="w-1/3 p-1 flex justify-center items-center active:bg-white/60 rounded-lg transition duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
  import { useKeyboard } from "@/composables/useKeyboard";

  import { getAppTheme } from "@/kikx/style";

  import { ref } from "vue";

  defineProps(["onNavbarClick", "theme"]);

  const { isKeyboardOpen, closeKeyboard } = useKeyboard();

  const show = ref(false);

  setTimeout(() => {
    show.value = true;
  }, 300);
</script>
