<script setup>
  import { useSlots, ref, computed, watch } from "vue";

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: undefined // makes v-model optional
    }
  });

  const emit = defineEmits(["update:modelValue"]);
  const slots = useSlots();

  // internal state fallback when v-model is not used
  const internalValue = ref(false);

  const isControlled = computed(() => props.modelValue !== undefined);

  const value = computed({
    get() {
      return isControlled.value ? props.modelValue : internalValue.value;
    },
    set(val) {
      if (isControlled.value) {
        emit("update:modelValue", val);
      } else {
        internalValue.value = val;
      }
    }
  });

  function toggle() {
    value.value = !value.value;
  }
</script>

<template>
  <button
    class="btn btn-lg btn-square transition-all duration-600 flex items-center justify-center"
    :class="value ? 'bg-white text-secondary' : 'bg-white/40 text-black/80'"
    @click="toggle"
  >
    <!-- If before or after slots -->
    <template v-if="slots.before || slots.after">
      <slot v-if="!value" name="before" />
      <slot v-else name="after" />
    </template>

    <!-- Otherwise fallback to default slot -->
    <template v-else>
      <slot />
    </template>
  </button>
</template>
