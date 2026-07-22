import type { BrushShape } from '../lib/brush';

interface BrushPanelProps {
  shape: BrushShape;
  size: number;
  onShapeChange: (shape: BrushShape) => void;
  onSizeChange: (size: number) => void;
  onClose: () => void;
}

const MAX_SIZE = 12;

export default function BrushPanel({ shape, size, onShapeChange, onSizeChange, onClose }: BrushPanelProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span>Brush</span>
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="panel-body">
        <div className="shape-row">
          <button
            type="button"
            className={`shape-button${shape === 'square' ? ' active' : ''}`}
            onClick={() => onShapeChange('square')}
          >
            Square
          </button>
          <button
            type="button"
            className={`shape-button${shape === 'circle' ? ' active' : ''}`}
            onClick={() => onShapeChange('circle')}
          >
            Circle
          </button>
        </div>
        <label className="slider-row">
          <span>Size</span>
          <input
            type="range"
            min={1}
            max={MAX_SIZE}
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
          />
          <span className="slider-value">{size}px</span>
        </label>
      </div>
    </div>
  );
}
