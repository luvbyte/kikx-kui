import { ref, computed, onMounted, onBeforeUnmount } from "vue";

export function useKeyboard() {
  const initialHeight = ref(0);
  const currentHeight = ref(0);

  const updateHeight = () => {
    const height = window.visualViewport?.height || window.innerHeight;
    currentHeight.value = height;
  };

  onMounted(() => {
    const height = window.visualViewport?.height || window.innerHeight;
    initialHeight.value = height;
    currentHeight.value = height;

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
    } else {
      window.addEventListener("resize", updateHeight);
    }
  });

  onBeforeUnmount(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", updateHeight);
    } else {
      window.removeEventListener("resize", updateHeight);
    }
  });

  const isKeyboardOpen = computed(() => {
    const threshold = 100; // safer threshold
    return initialHeight.value - currentHeight.value > threshold;
  });

  const closeKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return {
    isKeyboardOpen,
    closeKeyboard
  };
}
