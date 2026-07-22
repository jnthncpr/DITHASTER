export type BrushShape = 'square' | 'circle';

/** Cell offsets (relative to the painted cell) covered by a brush of the given shape and size (in cells). */
export function brushOffsets(shape: BrushShape, size: number): Array<[number, number]> {
  const lo = -Math.floor((size - 1) / 2);
  const hi = Math.ceil((size - 1) / 2);
  const center = (lo + hi) / 2;
  const radius = size / 2 - 0.1;

  const offsets: Array<[number, number]> = [];
  for (let dy = lo; dy <= hi; dy++) {
    for (let dx = lo; dx <= hi; dx++) {
      if (shape === 'square') {
        offsets.push([dx, dy]);
        continue;
      }
      const distX = dx - center;
      const distY = dy - center;
      if (Math.sqrt(distX * distX + distY * distY) <= radius) {
        offsets.push([dx, dy]);
      }
    }
  }
  return offsets;
}
