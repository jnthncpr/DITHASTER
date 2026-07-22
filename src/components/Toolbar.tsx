import type { CSSProperties } from 'react';
import type { Tool } from './PixelEditor';

export type PanelKind = 'color' | 'dimensions' | 'stroke' | 'brush' | null;

interface ToolbarProps {
  activePanel: PanelKind;
  onTogglePanel: (panel: PanelKind) => void;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onResetView: () => void;
  canUndo: boolean;
  canRedo: boolean;
  swatchColor: string;
}

export default function Toolbar({
  activePanel,
  onTogglePanel,
  tool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onResetView,
  canUndo,
  canRedo,
  swatchColor,
}: ToolbarProps) {
  const toggle = (panel: PanelKind) => onTogglePanel(activePanel === panel ? null : panel);

  return (
    <div className="toolbar">
      <button
        type="button"
        className={`toolbar-button${tool === 'draw' ? ' active' : ''}`}
        onClick={() => onToolChange('draw')}
        title="Draw"
        aria-label="Draw"
      >
        ✎
      </button>
      <button
        type="button"
        className={`toolbar-button${tool === 'fill' ? ' active' : ''}`}
        onClick={() => onToolChange('fill')}
        title="Fill"
        aria-label="Fill"
      >
        ▨
      </button>
      <button
        type="button"
        className={`toolbar-button${activePanel === 'brush' ? ' active' : ''}`}
        onClick={() => toggle('brush')}
        title="Brush"
        aria-label="Brush"
      >
        ◯
      </button>
      <div className="toolbar-divider" />
      <button
        type="button"
        className={`toolbar-button color-button${activePanel === 'color' ? ' active' : ''}`}
        style={{ '--swatch': swatchColor } as CSSProperties}
        onClick={() => toggle('color')}
        title="Color"
        aria-label="Color"
      >
        <span className="color-dot" />
      </button>
      <button
        type="button"
        className={`toolbar-button${activePanel === 'dimensions' ? ' active' : ''}`}
        onClick={() => toggle('dimensions')}
        title="Working area"
        aria-label="Working area"
      >
        ▦
      </button>
      <button
        type="button"
        className={`toolbar-button${activePanel === 'stroke' ? ' active' : ''}`}
        onClick={() => toggle('stroke')}
        title="Grid stroke"
        aria-label="Grid stroke"
      >
        #
      </button>
      <div className="toolbar-divider" />
      <button type="button" className="toolbar-button" onClick={onUndo} disabled={!canUndo} title="Undo" aria-label="Undo">
        ↶
      </button>
      <button type="button" className="toolbar-button" onClick={onRedo} disabled={!canRedo} title="Redo" aria-label="Redo">
        ↷
      </button>
      <button type="button" className="toolbar-button" onClick={onResetView} title="Reset view" aria-label="Reset view">
        ⤢
      </button>
      <div className="toolbar-divider" />
      <button type="button" className="toolbar-button" onClick={onClear} title="Clear canvas" aria-label="Clear canvas">
        ⌫
      </button>
      <button type="button" className="toolbar-button export-button" onClick={onExport} title="Export SVG" aria-label="Export SVG">
        SVG
      </button>
    </div>
  );
}
