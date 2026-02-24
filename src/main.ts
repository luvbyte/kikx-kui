import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import { vSwipe, vSwipeStop } from "@/directives/swipe.js";
import draggable from "@/directives/draggable.js";

import vLongpress from "@/directives/longpress";

import 'animate.css';
import "./style.css";

document.addEventListener("contextmenu", e => {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
  }
});

const app = createApp(App);

app.directive("swipe", vSwipe);
app.directive("swipe-stop", vSwipeStop);
app.directive("longpress", vLongpress);

app.use(createPinia());

app.mount("#app");
