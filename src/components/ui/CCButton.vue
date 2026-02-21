<script setup>
  import { useSlots } from "vue";

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    }
  });

  const emit = defineEmits(["update:modelValue"]);
  const slots = useSlots();

  function toggle() {
    emit("update:modelValue", !props.modelValue);
  }
</script>

<template>
  <button
    class="btn btn-xl btn-square transition-all duration-600 flex items-center justify-center"
    :class="
      modelValue ? 'bg-white text-secondary' : 'bg-white/40 text-black/80'
    "
    @click="toggle"
  >
    <!-- If before or after slots -->
    <template v-if="slots.before || slots.after">
      <slot v-if="!modelValue" name="before" />
      <slot v-else name="after" />
    </template>

    <!-- Otherwise fallback to default slot -->
    <template v-else>
      <slot />
    </template>
  </button>
</template>
