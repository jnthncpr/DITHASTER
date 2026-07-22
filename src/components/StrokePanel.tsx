interface StrokePanelProps {
  enabled: boolean;
  color: string;
  width: number;
  onEnabledChange: (enabled: boolean) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onClose: () => void;
}

export default function StrokePanel({
  enabled,
  color,
  width,
  onEnabledChange,
  onColorChange,
  onWidthChange,
  onClose,
}: StrokePanelProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span>Grid Stroke</span>
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="panel-body">
        <label className="field-row checkbox-row">
          <span>Show grid lines</span>
          <input type="checkbox" checked={enabled} onChange={(e) => onEnabledChange(e.target.checked)} />
        </label>
        <label className="field-row">
          <span>Line color</span>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            disabled={!enabled}
          />
        </label>
        <label className="slider-row">
          <span>Line width</span>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={width}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            disabled={!enabled}
          />
          <span className="slider-value">{width}px</span>
        </label>
      </div>
    </div>
  );
}
