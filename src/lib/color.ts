/** Packs a "#rrggbb" hex string plus an alpha (0-1) into a 0xRRGGBBAA uint32. */
export function hexToPacked(hex: string, alpha = 1): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.round(alpha * 255);
  return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
}

export function packedToHex(packed: number): string {
  const r = (packed >>> 24) & 0xff;
  const g = (packed >>> 16) & 0xff;
  const b = (packed >>> 8) & 0xff;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function packedToAlpha(packed: number): number {
  return (packed & 0xff) / 255;
}

export function packedToCss(packed: number): string {
  const r = (packed >>> 24) & 0xff;
  const g = (packed >>> 16) & 0xff;
  const b = (packed >>> 8) & 0xff;
  const a = packed & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

export const TRANSPARENT = 0;
