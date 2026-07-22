import type { PixelGrid } from './grid';

/** Classic 4-directional flood fill: finds all cells matching the seed's color and calls apply(x, y) on each. */
export function floodFill(grid: PixelGrid, startX: number, startY: number, apply: (x: number, y: number) => void): void {
  if (startX < 0 || startY < 0 || startX >= grid.cols || startY >= grid.rows) return;
  const targetColor = grid.data[startY * grid.cols + startX];
  const visited = new Uint8Array(grid.cols * grid.rows);
  const stack: number[] = [startX, startY];

  while (stack.length > 0) {
    const y = stack.pop() as number;
    const x = stack.pop() as number;
    if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) continue;
    const idx = y * grid.cols + x;
    if (visited[idx]) continue;
    if (grid.data[idx] !== targetColor) continue;
    visited[idx] = 1;
    apply(x, y);
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
}
