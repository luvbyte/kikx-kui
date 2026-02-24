<template>
  <div class="fscreen flex flex-col items-center justify-center bg-black/60">
    <div
      class="bg-white/20 p-8 rounded-xl shadow-lg text-center space-y-6 w-80"
    >
      <Loading label="Logging out..." class="font-semibold text-white" />

      <!-- Timer -->
      <p class="mt-8 text-lg font-medium text-white/80">
        Logging out in
        <span class="text-red-500 font-bold">{{ countdown }}</span> seconds
      </p>

      <!-- Buttons -->
      <div class="flex justify-center gap-4">
        <button @click="cancelLogout" class="btn w-32">Cancel</button>

        <button @click="logoutNow" class="btn w-32 btn-secondary">
          Logout Now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import Loading from "@/components/Loading.vue";
  import { useClient } from "@/kikx";

  const client = useClient();

  const props = defineProps(["close"]);

  const countdown = ref(8);
  let timer = null;

  const startTimer = () => {
    timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        logoutNow();
      }
    }, 1000);
  };

  const logoutNow = async () => {
    clearInterval(timer);
    await client._logout();
    location.reload();
  };

  const cancelLogout = () => {
    clearInterval(timer);
    props.close();
  };

  onMounted(() => {
    startTimer();
  });

  onBeforeUnmount(() => {
    clearInterval(timer);
  });
</script>
