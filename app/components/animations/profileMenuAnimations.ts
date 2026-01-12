import anime from "animejs/lib/anime.es.js";

export const animateProfileMenuIn = (el: HTMLElement) => {
  anime({
    targets: el,
    opacity: [0, 1],
    translateY: [-12, 0],
    scale: [0.96, 1],
    duration: 300,
    easing: "easeOutExpo",
  });
};

export const animateProfileMenuOut = (
  el: HTMLElement,
  done: () => void
) => {
  anime({
    targets: el,
    opacity: [1, 0],
    translateY: [0, -12],
    scale: [1, 0.96],
    duration: 200,
    easing: "easeInQuad",
    complete: done,
  });
};
export const animateProfileItemClick = (
  menu: HTMLElement,
  done: () => void
) => {
  anime({
    targets: menu,
    scale: [1, 0.96],
    opacity: [1, 0],
    duration: 220,
    easing: "easeOutQuad",
    complete: done,
  });
};