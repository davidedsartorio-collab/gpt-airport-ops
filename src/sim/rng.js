// Deterministic PRNG (mulberry32). The whole point of isolating sim/ is to run
// it reproducibly: given the same seed and the same sequence of actions, the
// simulation is byte-for-byte identical. That unlocks unit tests and headless
// balancing (see scripts/balance.mjs). Replaces every Math.random() in tick.js.

// Hash a string or number into a 32-bit unsigned integer seed.
export function seedFrom(input) {
  const str = String(input);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

// Build a Math.random()-style function whose output is fully determined by
// `state`. After advancing it during a tick, persist rng.state() back into the
// game state so the next tick continues the same stream.
export function makeRng(state) {
  let a = state | 0;
  const rng = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.state = () => a | 0;
  return rng;
}
