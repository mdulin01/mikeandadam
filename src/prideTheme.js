/**
 * prideTheme.js — the app's queer visual language, in one place.
 *
 * Two jobs:
 *  1. Shared gradient/stripe constants so rings, bars, glows and bursts
 *     all use the SAME flag rather than six near-miss rainbows.
 *  2. Date-aware "pride moments" — June, our anniversaries, race day —
 *     that automatically dial the app up and then quietly dial it back.
 *
 * Dates are evaluated in LOCAL time (Mike is Eastern). Never toISOString().
 */

// Six-stripe pride flag, the canonical hexes.
export const PRIDE_STRIPES = ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'];

/** Left-to-right flag, for bars and underlines. */
export const PRIDE_LINEAR = `linear-gradient(90deg, ${PRIDE_STRIPES.join(', ')})`;

/** Top-to-bottom flag, for full-screen washes. */
export const PRIDE_LINEAR_V = `linear-gradient(180deg, ${PRIDE_STRIPES.join(', ')})`;

/** Seamless wheel, for rings and rotating halos (repeats first stop at 360deg). */
export const PRIDE_CONIC = `conic-gradient(from 0deg, ${[...PRIDE_STRIPES, PRIDE_STRIPES[0]].join(', ')})`;

/** Low-alpha flag for row/card backgrounds that still sit under text. */
export const PRIDE_WASH = 'linear-gradient(90deg,rgba(228,3,3,0.16),rgba(255,140,0,0.16),rgba(255,237,0,0.14),rgba(0,128,38,0.16),rgba(0,77,255,0.16),rgba(117,7,135,0.18))';

/**
 * The dates that make the app wear rainbow on its own.
 * `month` is 1-indexed. A moment with no `day` covers the whole month.
 */
export const PRIDE_MOMENTS = [
  {
    key: 'pride-month',
    month: 6,
    label: 'Pride Month',
    emoji: '\u{1F3F3}\u{FE0F}\u{200D}\u{1F308}',
    blurb: "It's Pride Month — the whole app is wearing the flag.",
    intensity: 'high',
  },
  {
    key: 'official',
    month: 5,
    day: 17,
    label: 'Becoming Official',
    emoji: '❤️',
    blurb: 'Champagne, flowers, and a big question. Happy anniversary. \u{1F490}',
    intensity: 'high',
  },
  {
    key: 'race-day',
    month: 11,
    day: 21,
    label: 'Greensboro Half Marathon',
    emoji: '\u{1F3C3}',
    blurb: '13.1 miles, side by side. Go get it. \u{1F308}',
    intensity: 'high',
  },
];

/**
 * Which pride moment (if any) is live for a given date.
 * Day-specific moments beat month-long ones.
 *
 * @param {Date} [now]
 * @returns {{key,label,emoji,blurb,intensity}|null}
 */
export const getPrideMoment = (now = new Date()) => {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const dayMatch = PRIDE_MOMENTS.find((p) => p.day && p.month === m && p.day === d);
  if (dayMatch) return dayMatch;
  return PRIDE_MOMENTS.find((p) => !p.day && p.month === m) || null;
};

/** Convenience: is the app currently in a dialed-up state? */
export const isPrideMoment = (now = new Date()) => !!getPrideMoment(now);

/** Celebration density multiplier — pride moments get more confetti. */
export const prideIntensity = (now = new Date()) => (getPrideMoment(now) ? 1.6 : 1);

export default {
  PRIDE_STRIPES,
  PRIDE_LINEAR,
  PRIDE_LINEAR_V,
  PRIDE_CONIC,
  PRIDE_WASH,
  PRIDE_MOMENTS,
  getPrideMoment,
  isPrideMoment,
  prideIntensity,
};
