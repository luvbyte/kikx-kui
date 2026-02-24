<script setup lang="ts">
  import { getUrl } from "@/kikx/config";

  const props = defineProps(["app"]);
</script>

<template>
  <iframe
    :id="'app_' + app.title"
    :name="app.name"
    :title="app.title"
    :src="getUrl(app.url)"
    :sandbox="app.iframe.sandbox"
    :allowFullscreen="app.iframe.allowfullscreen"
    :allow="app.iframe.allow"
    :loading="app.iframe.loading"
    scrolling="no"
    :referrerPolicy="app.iframe.referrerpolicy"
    class="animate__animated animate__fadeIn"
  ></iframe>
</template>
