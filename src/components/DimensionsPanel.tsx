import { useState } from 'react';

interface DimensionsPanelProps {
  cols: number;
  rows: number;
  onApply: (cols: number, rows: number) => void;
  onClose: () => void;
}

const MIN_DIM = 1;
const MAX_DIM = 512;

export default function DimensionsPanel({ cols, rows, onApply, onClose }: DimensionsPanelProps) {
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
      </div>
    </div>
  );
}
