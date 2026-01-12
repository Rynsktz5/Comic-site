"use client";
import anime from "animejs/lib/anime.es.js"

export const runHomeTimeline = () => {
  const tl = anime.timeline({
    easing: "easeOutExpo",
    autoplay: true,
  });

  tl.add({
    targets: ".reveal-continue",
    opacity: [0, 1],
    translateY: [24, 0],
    duration: 600,
  })

  .add({
    targets: ".reveal-title",
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 500,
  }, "-=300")

  //.add({
  //  targets: ".reveal-grid .item-wrapper",
  //  opacity: [0, 1],
  //  translateY: [18, 0],
  //  delay: anime.stagger(60),
  //  duration: 500,
 // }, "-=200");
};
