<script setup lang="ts">
  import { ref } from "vue";
  import { getUrl, getImageUrl } from "@/kikx/config";

  const props = defineProps(["app"]);

  const loading = ref(true);
  const closing = ref(false);

  const handleLoad = () => {
    closing.value = true;

    // wait for animation to finish
    setTimeout(() => {
      loading.value = false;
    }, 150);
  };

  const getSandbox = () => {};
</script>

<template>
  <div class="fscreen relative flex flex-col overflow-hidden">
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
      :class="{ closing: closing }"
    >
      <img
        class="loader-ring w-1/2 aspect-square rounded-full"
        :src="getImageUrl(app.manifest.icon)"
      />
    </div>
    <iframe
      :id="'app_' + app.id"
      :name="app.name"
      :title="app.title"
      :src="getUrl(app.url)"
      :sandbox="app.iframe.sandbox"
      :allowFullscreen="app.iframe.allowfullscreen"
      :allow="app.iframe.allow"
      :loading="app.iframe.loading"
      scrolling="no"
      :referrerPolicy="app.iframe.referrerpolicy"
      :class="[
        'flex-1 transition-opacity duration-300',
        loading ? 'opacity-0' : 'opacity-100'
      ]"
      @load="handleLoad"
    ></iframe>
  </div>
</template>

<style scoped>
  .loader-ring {
    background: conic-gradient(from 0deg, #3b82f6, #9333ea, #ec4899, #3b82f6);
    animation: loader-pulse 1.6s ease-in-out infinite;
    transition:
      transform 0.4s ease,
      opacity 0.4s ease;
  }

  @keyframes loader-pulse {
    0% {
      transform: scale(1);
      opacity: 0.9;
    }
    50% {
      transform: scale(1.08);
      opacity: 0.6;
    }
    100% {
      transform: scale(1);
      opacity: 0.9;
    }
  }

  /* Exit animation */
  .closing {
    animation: launchZoom 0.38s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    will-change: transform, opacity;
  }

  @keyframes launchZoom {
    0% {
      transform: scale(1);
      opacity: 1;
    }

    70% {
      transform: scale(2.2);
      opacity: 1;
    }

    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
</style>
