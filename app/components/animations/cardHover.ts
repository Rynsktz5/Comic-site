"use client";
import anime from "animejs/lib/anime.es.js"

export const hoverIn = (el: HTMLElement) => {
  anime({
    targets: el,
    translateY: -6,
    boxShadow: "0 0 24px rgba(220,38,38,0.35)",
    duration: 260,
    easing: "easeOutQuad",
  });
};

export const hoverOut = (el: HTMLElement) => {
  anime({
    targets: el,
    translateY: 0,
    rotateX: 0,
    rotateY: 0,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    duration: 320,
    easing: "easeOutExpo",
  });
};

export const tilt = (
  el: HTMLElement,
  e: MouseEvent,
  strength = 8
) => {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const rotateY = ((x / rect.width) - 0.5) * strength;
  const rotateX = -((y / rect.height) - 0.5) * strength;

  anime({
    targets: el,
    rotateX,
    rotateY,
    duration: 120,
    easing: "linear",
  });
};
