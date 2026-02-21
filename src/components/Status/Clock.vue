<template>
  <div class="font-semibold font-heading">{{ time }}</div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from "vue";

  const props = defineProps({
    format: { type: String, default: "HH:mm" }, 
    interval: { type: Number, default: 1000 }
  });

  const time = ref("");
  let timer = null;

  // YYYY, MM, DD, HH, mm, ss
  const formatTime = format => {
    const d = new Date();

    const pad = n => n.toString().padStart(2, "0");

    return format
      .replace("YYYY", d.getFullYear())
      .replace("MM", pad(d.getMonth() + 1))
      .replace("DD", pad(d.getDate()))
      .replace("HH", pad(d.getHours()))
      .replace("mm", pad(d.getMinutes()))
      .replace("ss", pad(d.getSeconds()));
  };

  onMounted(() => {
    time.value = formatTime(props.format);

    timer = setInterval(() => {
      time.value = formatTime(props.format);
    }, props.interval);
  });

  onUnmounted(() => clearInterval(timer));
</script>
