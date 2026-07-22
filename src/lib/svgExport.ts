import type { PixelGrid } from './grid';
import { packedToAlpha, packedToHex } from './color';

export interface ExportOptions {
  /** Width:height ratio of a single pixel. 1 = square. */
  pixelAspectRatio: number;
  /** Logical height of one cell in exported SVG units. */
  cellSize: number;
  stroke?: { color: string; width: number } | null;
}

export function gridToSvg(grid: PixelGrid, opts: ExportOptions): string {
  const cellH = opts.cellSize;
  const cellW = cellH * opts.pixelAspectRatio;
  const width = grid.cols * cellW;
  const height = grid.rows * cellH;

  const rects: string[] = [];
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const packed = grid.data[y * grid.cols + x];
      const alpha = packedToAlpha(packed);
      if (alpha === 0) continue;
      const fill = packedToHex(packed);
      const opacityAttr = alpha < 1 ? ` fill-opacity="${alpha.toFixed(3)}"` : '';
      rects.push(
        `<rect x="${x * cellW}" y="${y * cellH}" width="${cellW}" height="${cellH}" fill="${fill}"${opacityAttr}/>`,
      );
    }
  }

  let gridLines = '';
  if (opts.stroke) {
    const lines: string[] = [];
    for (let i = 0; i <= grid.cols; i++) {
      const x = i * cellW;
      lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}"/>`);
    }
    for (let j = 0; j <= grid.rows; j++) {
      const y = j * cellH;
      lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`);
    }
    gridLines = `<g stroke="${opts.stroke.color}" stroke-width="${opts.stroke.width}">\n${lines.join('\n')}\n</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n<g>${rects.join('\n')}</g>\n${gridLines}\n</svg>`;
}

export function downloadSvg(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
