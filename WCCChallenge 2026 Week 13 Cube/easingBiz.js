function easeOutElastic(x){
const c4 = (TWO_PI) / 3;

return x === 0
  ? 0
  : x === 1
  ? 1
  : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
}

function easeInOutElastic(x) {
const c5 = (2 * Math.PI) / 4.5;

return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5
  ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
  : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

// --- Easing Functions ---
const easeInOutSine = (t) => -(cos(PI * t) - 1) / 2;

function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}