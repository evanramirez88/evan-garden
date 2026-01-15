/**
 * Simplex Noise Implementation
 * Used for organic, natural-looking movement in the generative background.
 * Based on Stefan Gustavson's simplex noise implementation.
 */

// Permutation table
const perm = new Uint8Array(512);
const permMod12 = new Uint8Array(512);

// Gradients for 2D
const grad3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

// Skewing factors for 2D
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/**
 * Initialize the noise with a seed
 */
export function seedNoise(seed: number = Math.random() * 65536): void {
  const p = new Uint8Array(256);

  // Initialize with values 0-255
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  // Shuffle using seed
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }

  // Extend to 512 entries
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = perm[i] % 12;
  }
}

// Initialize with default seed
seedNoise(12345);

/**
 * 2D Simplex noise
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Noise value between -1 and 1
 */
export function noise2D(x: number, y: number): number {
  // Skew input space to determine which simplex cell we're in
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  // Determine which simplex we're in
  let i1: number, j1: number;
  if (x0 > y0) {
    i1 = 1;
    j1 = 0;
  } else {
    i1 = 0;
    j1 = 1;
  }

  // Offsets for corners
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  // Hash coordinates of corners
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = permMod12[ii + perm[jj]];
  const gi1 = permMod12[ii + i1 + perm[jj + j1]];
  const gi2 = permMod12[ii + 1 + perm[jj + 1]];

  // Calculate contributions from corners
  let n0 = 0, n1 = 0, n2 = 0;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * dot2(grad3[gi0], x0, y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * dot2(grad3[gi1], x1, y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * dot2(grad3[gi2], x2, y2);
  }

  // Sum contributions and scale to [-1, 1]
  return 70 * (n0 + n1 + n2);
}

function dot2(g: number[], x: number, y: number): number {
  return g[0] * x + g[1] * y;
}

/**
 * Fractal/Octave noise for more natural patterns
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param octaves - Number of octaves (default: 4)
 * @param persistence - How much each octave contributes (default: 0.5)
 * @returns Noise value between -1 and 1
 */
export function fractalNoise2D(
  x: number,
  y: number,
  octaves: number = 4,
  persistence: number = 0.5
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}
