"use client";
import anime from "animejs/lib/anime.es.js"

/* OPEN MENU */
export const animateMenuIn = (menu: HTMLElement) => {
  anime({
    targets: menu,
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 400,
    easing: "easeOutExpo",
  });

  anime({
    targets: menu.querySelectorAll(".menu-item"),
    opacity: [0, 1],
    translateX: [-30, 0],
    delay: anime.stagger(80),
    duration: 500,
    easing: "easeOutExpo",
  });
};

/* CLOSE MENU */
export const animateMenuOut = (menu: HTMLElement, done: () => void) => {
  anime({
    targets: menu,
    opacity: [1, 0],
    translateY: [0, -20],
    duration: 250,
    easing: "easeInExpo",
    complete: done,
  });
};

/* HOVER */
export const animateHover = (el: HTMLElement) => {
  anime({
    targets: el,
    translateX: 6,
    duration: 200,
    easing: "easeOutQuad",
  });
};

export const resetHover = (el: HTMLElement) => {
  anime({
    targets: el,
    translateX: 0,
    duration: 200,
    easing: "easeOutQuad",
  });
};

/* CLICK */
export const animateClick = (el: HTMLElement, cb: () => void) => {
  anime({
    targets: el,
    scale: [1, 0.94, 1],
    duration: 180,
    easing: "easeOutQuad",
    complete: cb,
  });
};
