import { useState } from 'react';

interface DimensionsPanelProps {
  cols: number;
  rows: number;
  pixelAspectRatio: number;
  onApply: (cols: number, rows: number) => void;
  onAspectRatioChange: (ratio: number) => void;
  onClose: () => void;
}

const MIN_DIM = 1;
const MAX_DIM = 512;
const RATIO_PRESETS: Array<{ label: string; value: number }> = [
  { label: '1:2', value: 0.5 },
  { label: '1:1', value: 1 },
  { label: '2:1', value: 2 },
];

export default function DimensionsPanel({
  cols,
  rows,
  pixelAspectRatio,
  onApply,
  onAspectRatioChange,
  onClose,
}: DimensionsPanelProps) {
  const [draftCols, setDraftCols] = useState(cols);
  const [draftRows, setDraftRows] = useState(rows);

  const clamp = (n: number) => Math.min(MAX_DIM, Math.max(MIN_DIM, Math.round(n) || MIN_DIM));

  const apply = () => onApply(clamp(draftCols), clamp(draftRows));

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Working Area</span>
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="panel-body">
        <label className="field-row">
          <span>Width (px)</span>
          <input
            type="number"
            min={MIN_DIM}
            max={MAX_DIM}
            value={draftCols}
            onChange={(e) => setDraftCols(Number(e.target.value))}
          />
        </label>
        <label className="field-row">
          <span>Height (px)</span>
          <input
            type="number"
            min={MIN_DIM}
            max={MAX_DIM}
            value={draftRows}
            onChange={(e) => setDraftRows(Number(e.target.value))}
          />
        </label>
        <p className="panel-hint">Resizing keeps existing pixels anchored to the top-left corner.</p>
        <button type="button" className="apply-button" onClick={apply}>
          Apply
        </button>

        <div className="panel-subhead">Pixel Aspect Ratio</div>
        <div className="shape-row">
          {RATIO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`shape-button${pixelAspectRatio === preset.value ? ' active' : ''}`}
              onClick={() => onAspectRatioChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <label className="field-row">
          <span>Custom (w÷h)</span>
          <input
            type="number"
            min={0.1}
            max={10}
            step={0.1}
            value={pixelAspectRatio}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v > 0) onAspectRatioChange(v);
            }}
          />
        </label>
      </div>
    </div>
  );
}
