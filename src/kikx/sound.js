import { getAudioUrl } from "./config";

const soudList = {
  alert: "sounds/pop_1.wav"
};

const poolSize = 10;
const pools = {};

export function playSound(name) {
  if (!soudList[name]) return;

  if (!pools[name]) {
    pools[name] = Array.from({ length: poolSize }, () => {
      return new Audio(getAudioUrl(soudList[name]));
    });
  }

  const audio = pools[name].find(a => a.paused || a.ended);

  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}
