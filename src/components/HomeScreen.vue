<template>
  <div
    v-swipe="onSwipe"
    @click="showMenu = false"
    class="absolute inset-0 z-30 overflow-hidden"
  >
    <Transition name="fade">
      <AppsMenu
        v-if="showMenu"
        :openApp="openApp"
        class="absolute inset-0 bg-black/60"
      />
    </Transition>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import AppsMenu from "@/components/AppsMenu.vue";

  const props = defineProps(["openApp", "changeScreen"]);

  const showMenu = ref(false);

  function onSwipe(direction) {
    if (direction === "up") {
      showMenu.value = true;
    } else if (direction === "left") {
      props.changeScreen("control");
    } else if (direction === "down") {
      props.changeScreen("control");
    } else if (direction === "right") {
      props.changeScreen("app-control");
    }
  }
</script>
