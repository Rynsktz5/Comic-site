"use client";
import anime from "animejs/lib/anime.es.js"

export const dimOthers = (active: HTMLElement) => {
  const cards = document.querySelectorAll<HTMLElement>(".dimmable");

  cards.forEach(card => {
    if (card !== active) {
      anime({
        targets: card,
        opacity: 0.6,
        duration: 220,
        easing: "easeOutQuad",
      });
    }
  });
};

export const restoreAll = () => {
  const cards = document.querySelectorAll<HTMLElement>(".dimmable");

  anime({
    targets: cards,
    opacity: 1,
    duration: 260,
    easing: "easeOutExpo",
  });
};
