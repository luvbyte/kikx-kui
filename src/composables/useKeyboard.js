import { ref, computed, onMounted, onBeforeUnmount } from "vue";

export function useKeyboard() {
  const viewportHeight = ref(
    window.visualViewport?.height || window.innerHeight
  );
  const initialHeight = ref(
    window.visualViewport?.height || window.innerHeight
  );

  const updateHeight = () => {
    viewportHeight.value = window.visualViewport?.height || window.innerHeight;
  };

  onMounted(() => {
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
    return initialHeight.value - viewportHeight.value > 150;
  });

  return { isKeyboardOpen };
}
