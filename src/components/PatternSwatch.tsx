import { useEffect, useRef } from 'react';
import type { Pattern } from '../lib/patterns';

interface PatternSwatchProps {
  pattern: Pattern;
  color: string;
  selected: boolean;
  onSelect: () => void;
}

export default function PatternSwatch({ pattern, color, selected, onSelect }: PatternSwatchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellPx = Math.max(2, Math.floor(28 / pattern.size));
  const px = cellPx * pattern.size;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, px, px);
    ctx.fillStyle = color;
    for (let y = 0; y < pattern.size; y++) {
      for (let x = 0; x < pattern.size; x++) {
        if (pattern.mask[y * pattern.size + x]) {
          ctx.fillRect(x * cellPx, y * cellPx, cellPx, cellPx);
        }
      }
    }
  }, [pattern, color, cellPx, px]);

  return (
    <button
      type="button"
      className={`pattern-swatch${selected ? ' active' : ''}`}
      onClick={onSelect}
      title={pattern.name}
      aria-label={pattern.name}
    >
      <canvas ref={canvasRef} width={px} height={px} />
    </button>
  );
}
