"use client";
import anime from "animejs/lib/anime.es.js"

export const fadeUpText = (el: HTMLElement, delay = 0) => {
  anime({
    targets: el,
    opacity: [0, 1],
    translateY: [8, 0],
    duration: 600,
    delay,
    easing: "easeOutExpo",
  });
};

export const subtleGlow = (el: HTMLElement) => {
  anime({
    targets: el,
    textShadow: [
      "0 0 0 rgba(220,38,38,0)",
      "0 0 12px rgba(220,38,38,0.6)",
    ],
    duration: 800,
    easing: "easeOutQuad",
  });
};
