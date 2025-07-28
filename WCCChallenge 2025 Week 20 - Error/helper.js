/**
 * Easing functions determine how an animation progresses over time.
 * They control the rate at which the animation's change occurs.
 *
 * A bounce easing function simulates the effect of an object bouncing,
 * creating a springy, elastic animation.
 */
const EasingFunctions = {
  /**
   * Ease-out bounce: Starts fast and bounces to a stop.
   * @param {number} x - The input value between 0 and 1 (representing the animation's progress).
   * @returns {number} The eased output value between 0 and 1.
   */
  easeOutBounce: function (x) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= (1.5 / d1)) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= (2.25 / d1)) * x + 0.9375;
    } else {
      return n1 * (x -= (2.625 / d1)) * x + 0.984375;
    }
  },

  /**
   * Ease-in bounce: Starts with a bounce and ends fast.
   * It's the opposite of easeOutBounce.
   * @param {number} x - The input value between 0 and 1.
   * @returns {number} The eased output value between 0 and 1.
   */
  easeInBounce: function (x) {
    return 1 - EasingFunctions.easeOutBounce(1 - x);
  },

  /**
   * Ease-in-out bounce: Combines ease-in and ease-out, bouncing in the middle.
   * @param {number} x - The input value between 0 and 1.
   * @returns {number} The eased output value between 0 and 1.
   */
  easeInOutBounce: function (x) {
    return x < 0.5
      ? (1 - EasingFunctions.easeOutBounce(1 - 2 * x)) / 2
      : (1 + EasingFunctions.easeOutBounce(2 * x - 1)) / 2;
  },

  /**
 * Easing function for an "ease in out elastic" effect.
 * This function creates a bouncy, elastic effect that starts and ends smoothly,
 * with the "bounce" occurring in the middle of the animation.
 *
 * @param {number} t - The current time, normalized to a value between 0 and 1.
 * @returns {number} The eased value, typically between 0 and 1.
 */
    easeInOutElastic: function(t) {
    // Constants for the elastic effect
    // 's' controls the period of the oscillation. A smaller 's' means more oscillations.
    const s = 1.70158;
    // 'p' is the period of the elastic oscillation.
    // A smaller 'p' makes the bounce more frequent.
    const p = 0.45; // Adjusted from 0.3 for a more pronounced in-out elastic
    // 'a' is the amplitude of the oscillation.
    // A larger 'a' means a bigger bounce.
    const a = 1; // Start with 1, adjust if needed for stronger/weaker bounce

    // Handle edge cases for t
    if (t === 0) return 0;
    if (t === 1) return 1;

    // Scale t to be between 0 and 2 for the two phases (ease-in and ease-out)
    t *= 2;

    // Calculate the 's' value based on the amplitude 'a' and period 'p'
    // This ensures a smooth start and end even with varying 'a' and 'p'
    let s_adjusted;
    if (a < 1) {
        a = 1;
        s_adjusted = p / 4;
    } else {
        s_adjusted = (p / (2 * Math.PI)) * Math.asin(1 / a);
    }

    // Apply the elastic easing formula
    // The first half (t < 1) is ease-in, the second half (t >= 1) is ease-out
    if (t < 1) {
        return -0.5 * (a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s_adjusted) * (2 * Math.PI) / p));
    } else {
        return a * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1 - s_adjusted) * (2 * Math.PI) / p) * 0.5 + 1;
    }
},

/**
     * Easing function for an "ease out elastic" effect.
     * This function creates a bouncy, elastic effect that starts fast and
     * settles into a smooth stop with a final bounce.
     *
     * @param {number} t - The current time, normalized to a value between 0 and 1.
     * @returns {number} The eased value, typically between 0 and 1.
     */
    easeOutElastic: function(t) {
        // Constants for the elastic effect
        // 'p' is the period of the elastic oscillation.
        // A smaller 'p' makes the bounce more frequent.
        const p = 0.45; // Adjusted from 0.3 for a more pronounced elastic
        // 'a' is the amplitude of the oscillation.
        // A larger 'a' means a bigger bounce.
        let a = 1; // Start with 1, adjust if needed for stronger/weaker bounce

        // Handle edge cases for t
        if (t === 0) return 0;
        if (t === 1) return 1;

        // Calculate the 's' value based on the amplitude 'a' and period 'p'
        // This ensures a smooth start and end even with varying 'a' and 'p'.
        // If amplitude 'a' is less than 1, it's clamped to 1 to prevent issues with Math.asin(1/a).
        // s_adjusted determines the phase shift of the sine wave.
        let s_adjusted;
        if (a < 1) {
            a = 1;
            s_adjusted = p / 4;
        } else {
            s_adjusted = (p / (2 * Math.PI)) * Math.asin(1 / a);
        }

        // Apply the elastic easing formula for ease-out.
        // The Math.pow(2, -10 * t) creates the decaying oscillation.
        // Math.sin((t - s_adjusted) * (2 * Math.PI) / p) creates the oscillation itself.
        // Adding 1 shifts the output so it ends at 1.
        return a * Math.pow(2, -10 * t) * Math.sin((t - s_adjusted) * (2 * Math.PI) / p) + 1;
    }
};

/**
 * Replicates the functionality of p5.js's map() function.
 *
 * Maps a number from one range to another range.
 *
 * @param {number} value  - The number to map.
 * @param {number} start1 - The lower bound of the input range.
 * @param {number} stop1  - The upper bound of the input range.
 * @param {number} start2 - The lower bound of the output range.
 * @param {number} stop2  - The upper bound of the output range.
 * @returns {number} The mapped value.
 *
 * Example:
 * map(5, 0, 10, 0, 100) == 50
 */
function p5map(value, start1, stop1, start2, stop2) {
  const normalizedValue = (value - start1) / (stop1 - start1);
  return start2 + normalizedValue * (stop2 - start2);
}


/**
 * Calculates a point on an Archimedes spiral.
 *
 * @param {number} t The angle parameter in radians.
 * @param {number} a The spiral's start radius (default: 1).
 * @param {number} b The distance between successive turns (default: 1).
 * @returns {object} An object with x and y coordinates of the point.
 */
function archimedesSpiral(t, a = 1, b = 1) {
  // Input validation: Check if t is a number.
  if (typeof t !== 'number') {
    throw new TypeError('t must be a number');
  }
    // Input validation: Check if a and b are numbers.
  if (typeof a !== 'number' || typeof b !== 'number') { 
        throw new TypeError('a and b must be a number');
  }

  const r = a + b * t; // Calculate the radius
  const x = r * Math.cos(t); // Calculate the x-coordinate
  const z = r * Math.sin(t); // Calculate the y-coordinate

  return { x: x, z: z }; // Return the point as an object
}