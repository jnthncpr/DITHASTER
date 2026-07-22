import { PATTERNS } from '../lib/patterns';
import PatternSwatch from './PatternSwatch';

interface ColorPickerPanelProps {
  color: string;
  alpha: number;
  eraser: boolean;
  patternId: string | null;
  onColorChange: (hex: string) => void;
  onAlphaChange: (alpha: number) => void;
  onEraserToggle: () => void;
  onPatternChange: (patternId: string | null) => void;
  onClose: () => void;
}

const SWATCHES = [
  '#0a0a0a', '#ffffff', '#e63946', '#f4a261',
  '#2a9d8f', '#264653', '#a8dadc', '#8338ec',
];

export default function ColorPickerPanel({
  color,
  alpha,
  eraser,
  patternId,
  onColorChange,
  onAlphaChange,
  onEraserToggle,
  onPatternChange,
  onClose,
}: ColorPickerPanelProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span>Color</span>
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="panel-body">
        <div className="color-row">
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="color-input"
            aria-label="Pick color"
          />
          <button
            type="button"
            className={`eraser-toggle${eraser ? ' active' : ''}`}
            onClick={onEraserToggle}
          >
            Eraser
          </button>
        </div>
        <label className="slider-row">
          <span>Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(alpha * 100)}
            onChange={(e) => onAlphaChange(Number(e.target.value) / 100)}
          />
          <span className="slider-value">{Math.round(alpha * 100)}%</span>
        </label>
        <div className="swatches">
          {SWATCHES.map((sw) => (
            <button
              key={sw}
              type="button"
              className="swatch"
              style={{ background: sw }}
              onClick={() => {
                onColorChange(sw);
                onPatternChange(null);
              }}
              aria-label={`Swatch ${sw}`}
            />
          ))}
        </div>
        <div className="panel-subhead">Patterns</div>
        <div className="pattern-swatches">
          <button
            type="button"
            className={`pattern-swatch solid-option${patternId === null ? ' active' : ''}`}
            onClick={() => onPatternChange(null)}
            title="Solid"
            aria-label="Solid"
          >
            Solid
          </button>
          {PATTERNS.map((p) => (
            <PatternSwatch
              key={p.id}
              pattern={p}
              color={color}
              selected={patternId === p.id}
              onSelect={() => onPatternChange(p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
