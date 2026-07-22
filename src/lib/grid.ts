export interface PixelGrid {
  cols: number;
  rows: number;
  /** Packed RGBA per cell, 0xRRGGBBAA. Alpha 0 means empty/transparent. */
  data: Uint32Array;
}

export function createGrid(cols: number, rows: number): PixelGrid {
  return { cols, rows, data: new Uint32Array(cols * rows) };
}

/** Returns a new grid with the given dimensions, preserving existing pixels top-left aligned. */
export function resizeGrid(grid: PixelGrid, cols: number, rows: number): PixelGrid {
  const data = new Uint32Array(cols * rows);
  const copyCols = Math.min(cols, grid.cols);
  const copyRows = Math.min(rows, grid.rows);
  for (let y = 0; y < copyRows; y++) {
    for (let x = 0; x < copyCols; x++) {
      data[y * cols + x] = grid.data[y * grid.cols + x];
    }
  }
  return { cols, rows, data };
}

export function cloneGrid(grid: PixelGrid): PixelGrid {
  return { cols: grid.cols, rows: grid.rows, data: grid.data.slice() };
}

export function getCell(grid: PixelGrid, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) return 0;
  return grid.data[y * grid.cols + x];
}

export function setCell(grid: PixelGrid, x: number, y: number, color: number): void {
  if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) return;
  grid.data[y * grid.cols + x] = color;
}

export function clearGrid(grid: PixelGrid): void {
  grid.data.fill(0);
}

/** Bresenham line, calling paint(x, y) for every cell between the two points (inclusive). */
export function plotLine(x0: number, y0: number, x1: number, y1: number, paint: (x: number, y: number) => void): void {
  let cx = x0;
  let cy = y0;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    paint(cx, cy);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      cx += sx;
    }
    if (e2 <= dx) {
      err += dx;
      cy += sy;
    }
  }
}
