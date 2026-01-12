"use client";

import anime from "animejs/lib/anime.es.js"

export const openMenuAnim = (container: HTMLElement) => {
  anime.timeline()
    .add({
      targets: container,
      opacity: [0, 1],
      duration: 250,
      easing: "easeOutQuad",
    })
    .add({
      targets: container.querySelectorAll(".menu-item"),
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(80),
      duration: 500,
      easing: "easeOutExpo",
    });
};

export const closeMenuAnim = (
  container: HTMLElement,
  onComplete: () => void
) => {
  anime({
    targets: container,
    opacity: [1, 0],
    duration: 200,
    easing: "easeInQuad",
    complete: onComplete,
  });
};
