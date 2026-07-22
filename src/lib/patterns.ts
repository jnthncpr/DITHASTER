export interface Pattern {
  id: string;
  name: string;
  size: number;
  /** size*size booleans (1 = ink, 0 = leave untouched), row-major. */
  mask: Uint8Array;
}

// Standard 8x8 Bayer (dispersed-dot) ordered-dither threshold matrix, values 0-63.
const BAYER8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

function densityPattern(percent: number): Pattern {
  const threshold = Math.round((percent / 100) * 64);
  const mask = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      mask[y * 8 + x] = BAYER8[y][x] < threshold ? 1 : 0;
    }
  }
  return { id: `dot${percent}`, name: `${percent}% Dot`, size: 8, mask };
}

function makePattern(id: string, name: string, size: number, rows: string[]): Pattern {
  const mask = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      mask[y * size + x] = rows[y][x] === '1' ? 1 : 0;
    }
  }
  return { id, name, size, mask };
}

export const PATTERNS: Pattern[] = [
  ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map(densityPattern),
  makePattern('checker', 'Checkerboard', 2, ['10', '01']),
  makePattern('hstripe', 'Horizontal Stripes', 4, ['1111', '1111', '0000', '0000']),
  makePattern('vstripe', 'Vertical Stripes', 4, ['1100', '1100', '1100', '1100']),
  makePattern('diag', 'Diagonal Stripes', 8, [
    '11000000',
    '11100000',
    '01110000',
    '00111000',
    '00011100',
    '00001110',
    '00000111',
    '10000011',
  ]),
  makePattern('cross', 'Crosshatch', 8, [
    '10000001',
    '01000010',
    '00100100',
    '00011000',
    '00011000',
    '00100100',
    '01000010',
    '10000001',
  ]),
  makePattern('dots', 'Dot Grid', 4, ['1000', '0000', '0000', '0000']),
];

export function getPattern(id: string | null): Pattern | undefined {
  if (!id) return undefined;
  return PATTERNS.find((p) => p.id === id);
}
