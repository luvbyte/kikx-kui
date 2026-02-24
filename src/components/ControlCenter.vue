<template>
  <div
    v-swipe="onSwipe"
    @click="close"
    class="absolute fscreen inset-0 z-20 flex flex-col p-2 bg-black/60"
  >
    <!-- Top Panle -->
    <div class="p-4 w-full flex items-center justify-center">
      <div
        class="px-4 w-full max-w-md border-2 border-white/60 bg-white/20 rounded-2xl"
      >
        <div @click.stop class="grid grid-cols-5 gap-4 p-4">
          <!-- Buttons -->
          <CCButton v-model="uiConfig.state.isSilent">
            <template #before>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 16 16"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                >
                  <polygon
                    points="1.75 5.75 1.75 10.25 4.25 10.25 8.25 13.25 8.25 2.75 4.25 5.75"
                  />
                  <path
                    d="m10.75 6.25s1 .5 1 1.75-1 1.75-1 1.75m1-6.5c2 1 3 2.5 3 4.75s-1 3.75-3 4.75"
                  />
                </g>
              </svg>
            </template>

            <template #after>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="m89.752 59.582l251.583 251.584l5.433 5.432l49.473 49.473v-.001l30.861 30.861h-.001l25.318 25.318l-30.17 30.17l-187.833-187.834l.001 164.103l-110.73-85.458h-81.02V172.563h80.896l10.537-8.293l-74.518-74.518zm314.213 28.015c67.74 75.639 82.5 181.38 44.28 270.136l-32.95-32.95c23.87-71.003 8.999-151.972-44.615-210.559zm-84.385 67.509c28.626 31.924 41.556 72.77 38.788 112.752l-49.236-49.236c-4.823-12.914-12.148-25.12-21.976-35.884l-.9-.973zm-85.163-69.772l-.001 58.574l-32.78-32.78z"
                />
              </svg>
            </template>
          </CCButton>

          <!-- Notify / Toast Button -->
          <CCButton v-model="uiConfig.state.canToast">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 21 21"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5.5 3.5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2m1 2h8"
                stroke-width="1.5"
              />
            </svg>
          </CCButton>

          <!-- Navigation Button -->
          <CCButton v-model="uiConfig.state.navbar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1m0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1M3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1"
              />
            </svg>
          </CCButton>

          <!-- Iscreen Button -->
          <CCButton v-model="uiConfig.state.iScreen">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5"
              />
            </svg>
          </CCButton>

          <!-- Stickbar Button -->
          <CCButton v-model="uiConfig.state.stickBar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M5.325 3.95q-.175.625-.25 1.263T5 6.5q0 1.575.45 3.038t1.3 2.762q.2.275.175.6t-.25.55t-.525.2t-.5-.3q-1.05-1.5-1.6-3.25T3.5 6.5q0-.675.075-1.35T3.8 3.8L2.575 5.025q-.225.225-.525.225t-.525-.225T1.3 4.5t.225-.525L3.8 1.7q.3-.3.7-.3t.7.3l2.275 2.275Q7.7 4.2 7.7 4.5t-.225.525t-.525.213t-.525-.213zM16.45 20.825q-.575.2-1.162.188t-1.138-.288L8.5 18.1q-.375-.175-.525-.562T8 16.775l.05-.1q.25-.5.7-.812t1-.363l1.7-.125L8.65 7.7q-.15-.4.025-.763t.575-.512t.762.025t.513.575l2.4 6.575l.95-.35l-1.025-2.825q-.15-.4.025-.763t.575-.512t.762.025t.513.575l1.025 2.825l.925-.35L16 10.35q-.15-.4.025-.762t.575-.513t.762.025t.513.575l.675 1.875l.95-.35q-.15-.4.025-.762t.575-.513t.762.025t.513.575l1.375 3.75q.575 1.575-.113 3.063T20.375 19.4z"
              />
            </svg>
          </CCButton>

          <!-- Fullscreen Button -->
          <CCButton v-if="!isAndroidWebView()" @click="toggleFullscreen">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 4H4m0 0v4m0-4l5 5m7-5h4m0 0v4m0-4l-5 5M8 20H4m0 0v-4m0 4l5-5m7 5h4m0 0v-4m0 4l-5-5"
              />
            </svg>
          </CCButton>

          <!-- Wallpaper Button -->
          <button
            class="btn btn-lg btn-neutral btn-square"
            @click="showModule('WallpaperChanger')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M5 21q-.825 0-1.412-.587T3 19v-5q0-.425.288-.712T4 13t.713.288T5 14v5h5q.425 0 .713.288T11 20t-.288.713T10 21zm14 0h-5q-.425 0-.712-.288T13 20t.288-.712T14 19h5v-5q0-.425.288-.712T20 13t.713.288T21 14v5q0 .825-.587 1.413T19 21m-7.75-5l2.6-3.475q.15-.2.4-.2t.4.2L17.4 16.2q.2.25.05.525T17 17H7q-.3 0-.45-.275t.05-.525l2-2.675q.15-.2.4-.2t.4.2zM3 5q0-.825.588-1.412T5 3h5q.425 0 .713.288T11 4t-.288.713T10 5H5v5q0 .425-.288.713T4 11t-.712-.288T3 10zm18 0v5q0 .425-.288.713T20 11t-.712-.288T19 10V5h-5q-.425 0-.712-.288T13 4t.288-.712T14 3h5q.825 0 1.413.588T21 5m-6.575 4.575Q14 9.15 14 8.5t.425-1.075T15.5 7t1.075.425T17 8.5t-.425 1.075T15.5 10t-1.075-.425"
              />
            </svg>
          </button>
          <!-- Settings Button -->
          <button
            v-if="false"
            class="btn btn-lg btn-neutral btn-square"
            @click="showModule('Settings')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
            >
              <g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">
                <path
                  d="M12 8.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5M9.75 12a2.25 2.25 0 1 1 4.5 0a2.25 2.25 0 0 1-4.5 0"
                />
                <path
                  d="M11.975 1.25c-.445 0-.816 0-1.12.02a2.8 2.8 0 0 0-.907.19a2.75 2.75 0 0 0-1.489 1.488c-.145.35-.184.72-.2 1.122a.87.87 0 0 1-.415.731a.87.87 0 0 1-.841-.005c-.356-.188-.696-.339-1.072-.389a2.75 2.75 0 0 0-2.033.545a2.8 2.8 0 0 0-.617.691c-.17.254-.356.575-.578.96l-.025.044c-.223.385-.408.706-.542.98c-.14.286-.25.568-.29.88a2.75 2.75 0 0 0 .544 2.033c.231.301.532.52.872.734a.87.87 0 0 1 .426.726a.87.87 0 0 1-.426.726c-.34.214-.64.433-.872.734a2.75 2.75 0 0 0-.545 2.033c.041.312.15.594.29.88c.135.274.32.595.543.98l.025.044c.222.385.408.706.578.96c.177.263.367.5.617.69a2.75 2.75 0 0 0 2.033.546c.376-.05.716-.2 1.072-.389a.87.87 0 0 1 .84-.005a.86.86 0 0 1 .417.731c.015.402.054.772.2 1.122a2.75 2.75 0 0 0 1.488 1.489c.29.12.59.167.907.188c.304.021.675.021 1.12.021h.05c.445 0 .816 0 1.12-.02c.318-.022.617-.069.907-.19a2.75 2.75 0 0 0 1.489-1.488c.145-.35.184-.72.2-1.122a.87.87 0 0 1 .415-.732a.87.87 0 0 1 .841.006c.356.188.696.339 1.072.388a2.75 2.75 0 0 0 2.033-.544c.25-.192.44-.428.617-.691c.17-.254.356-.575.578-.96l.025-.044c.223-.385.408-.706.542-.98c.14-.286.25-.569.29-.88a2.75 2.75 0 0 0-.544-2.033c-.231-.301-.532-.52-.872-.734a.87.87 0 0 1-.426-.726c0-.278.152-.554.426-.726c.34-.214.64-.433.872-.734a2.75 2.75 0 0 0 .545-2.033a2.8 2.8 0 0 0-.29-.88a18 18 0 0 0-.543-.98l-.025-.044a18 18 0 0 0-.578-.96a2.8 2.8 0 0 0-.617-.69a2.75 2.75 0 0 0-2.033-.546c-.376.05-.716.2-1.072.389a.87.87 0 0 1-.84.005a.87.87 0 0 1-.417-.731c-.015-.402-.054-.772-.2-1.122a2.75 2.75 0 0 0-1.488-1.489c-.29-.12-.59-.167-.907-.188c-.304-.021-.675-.021-1.12-.021zm-1.453 1.595c.077-.032.194-.061.435-.078c.247-.017.567-.017 1.043-.017s.796 0 1.043.017c.241.017.358.046.435.078c.307.127.55.37.677.677c.04.096.073.247.086.604c.03.792.439 1.555 1.165 1.974s1.591.392 2.292.022c.316-.167.463-.214.567-.227a1.25 1.25 0 0 1 .924.247c.066.051.15.138.285.338c.139.206.299.483.537.895s.397.69.506.912c.107.217.14.333.15.416a1.25 1.25 0 0 1-.247.924c-.064.083-.178.187-.48.377c-.672.422-1.128 1.158-1.128 1.996s.456 1.574 1.128 1.996c.302.19.416.294.48.377c.202.263.29.595.247.924c-.01.083-.044.2-.15.416c-.109.223-.268.5-.506.912s-.399.689-.537.895c-.135.2-.219.287-.285.338a1.25 1.25 0 0 1-.924.247c-.104-.013-.25-.06-.567-.227c-.7-.37-1.566-.398-2.292.021s-1.135 1.183-1.165 1.975c-.013.357-.046.508-.086.604a1.25 1.25 0 0 1-.677.677c-.077.032-.194.061-.435.078c-.247.017-.567.017-1.043.017s-.796 0-1.043-.017c-.241-.017-.358-.046-.435-.078a1.25 1.25 0 0 1-.677-.677c-.04-.096-.073-.247-.086-.604c-.03-.792-.439-1.555-1.165-1.974s-1.591-.392-2.292-.022c-.316.167-.463.214-.567.227a1.25 1.25 0 0 1-.924-.247c-.066-.051-.15-.138-.285-.338a17 17 0 0 1-.537-.895c-.238-.412-.397-.69-.506-.912c-.107-.217-.14-.333-.15-.416a1.25 1.25 0 0 1 .247-.924c.064-.083.178-.187.48-.377c.672-.422 1.128-1.158 1.128-1.996s-.456-1.574-1.128-1.996c-.302-.19-.416-.294-.48-.377a1.25 1.25 0 0 1-.247-.924c.01-.083.044-.2.15-.416c.109-.223.268-.5.506-.912s.399-.689.537-.895c.135-.2.219-.287.285-.338a1.25 1.25 0 0 1 .924-.247c.104.013.25.06.567.227c.7.37 1.566.398 2.292-.022c.726-.419 1.135-1.182 1.165-1.974c.013-.357.046-.508.086-.604c.127-.307.37-.55.677-.677"
                />
              </g>
            </svg>
          </button>
          <!-- Logout Button -->
          <button
            class="btn btn-lg btn-secondary btn-circle"
            @click="showModule('Logout')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 1024 1024"
            >
              <path
                fill="currentColor"
                d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8c-7 8.5-14.5 16.7-22.4 24.5a353.8 353.8 0 0 1-112.7 75.9A352.8 352.8 0 0 1 512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.8 353.8 0 0 1-112.7-75.9a353.3 353.3 0 0 1-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8s94.3 9.3 137.9 27.8c42.2 17.8 80.1 43.4 112.7 75.9c7.9 7.9 15.3 16.1 22.4 24.5c3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82C271.7 82.6 79.6 277.1 82 516.4C84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7c3.4-5.3-.4-12.3-6.7-12.3m88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <Transition name="slide-left">
      <AlertsPanel
        v-if="showAlerts"
        :onAlertClick
        :close
        :closePanel="() => onSwipe('right')"
      />
    </Transition>
    <Transition name="slide-right">
      <WidgetsPanel v-if="showWidgets" :closePanel="() => onSwipe('left')" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  import { Icon } from "@iconify/vue";
  import { useUIConfig } from "@/stores/kikx";

  import { isAndroidWebView } from "@/kikx/utils";

  import AlertsPanel from "@/components/AlertsPanel.vue";
  import WidgetsPanel from "@/components/widgets/WidgetsPanel.vue";

  import CCButton from "@/components/ui/CCButton.vue";

  const props = defineProps(["close", "showModule", "onAlertClick"]);

  const showAlerts = ref(false);
  const showWidgets = ref(false);

  function onSwipe(direction) {
    // if alerts panel open
    if (showAlerts.value) {
      if (direction === "right") {
        showAlerts.value = false;
      }
    }
    // if settings panel open
    else if (showWidgets.value) {
      if (direction === "left") {
        showWidgets.value = false;
      }
    }
    // if no panels opened
    else {
      if (direction === "up") {
        props.close();
      } else if (direction === "left") {
        showAlerts.value = true;
      } else if (direction === "right") {
        showWidgets.value = true;
      }
    }
  }

  const uiConfig = useUIConfig();

  function toggleFullscreen() {
    const doc = document;
    const elem = document.documentElement;

    const isFullscreen =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    if (!isFullscreen) {
      // Enter fullscreen
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        // IE/Edge
        elem.msRequestFullscreen();
      }

      uiConfig.state.isFullScreen = true;
    } else {
      // Exit fullscreen
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
      uiConfig.state.isFullScreen = false;
    }
  }
</script>
