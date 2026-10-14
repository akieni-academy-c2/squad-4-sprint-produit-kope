


export const EASE = {

  enter: [0.05, 0.7, 0.1, 1],


  exit: [0.3, 0, 0.8, 0.15],


  move: [0.4, 0, 0.2, 1],


  emphasized: [0.2, 0, 0, 1],


  short: [0.4, 0, 0.6, 1],
};


export const DURATION = {

  instant: 0.09,

  quick: 0.14,

  standard: 0.22,

  entrance: 0.32,

  deliberate: 0.42,
};


export const PERCEPTIBLE = 0.06;


export const exitOf = (enterSeconds) => Number((enterSeconds * 0.7).toFixed(3));


export const SPRING = {

  press: { type: 'spring', stiffness: 700, damping: 41, mass: 0.6, visualDuration: 0.12, bounce: 0 },


  surface: { type: 'spring', stiffness: 320, damping: 34, mass: 0.9, visualDuration: 0.34, bounce: 0 },


  layout: { type: 'spring', stiffness: 260, damping: 33, mass: 1, visualDuration: 0.36, bounce: 0 },
};


export const isWorthAnimating = (pixels) => Math.abs(pixels) >= 8;
