import anime from "animejs/lib/anime.es.js"


export const hoverIn = (el: HTMLElement) => {
  anime({
    targets: el,
    scale: 1.05,
    translateY: -6,
    duration: 250,
    easing: "easeOutCubic"
  });
};

export const hoverOut = (el: HTMLElement) => {
  anime({
    targets: el,
    scale: 1,
    translateY: 0,
    duration: 300,
    easing: "easeOutExpo"
  });
};

export const tap = (el: HTMLElement) => {
  anime({
    targets: el,
    scale: [1, 0.95, 1],
    duration: 180,
    easing: "easeOutQuad"
  });
};
