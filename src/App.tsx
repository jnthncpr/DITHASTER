import { useCallback, useRef, useState } from 'react';
import PixelEditor, { type Ink, type PixelEditorHandle, type Tool } from './components/PixelEditor';
import ColorPickerPanel from './components/ColorPickerPanel';
import DimensionsPanel from './components/DimensionsPanel';
import StrokePanel from './components/StrokePanel';
import BrushPanel from './components/BrushPanel';
import Toolbar, { type PanelKind } from './components/Toolbar';
import { hexToPacked } from './lib/color';
import type { BrushShape } from './lib/brush';
import './App.css';

const DEFAULT_COLS = 32;
const DEFAULT_ROWS = 32;
const EXPORT_CELL_SIZE = 20;

export default function App() {
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [pixelAspectRatio, setPixelAspectRatio] = useState(1);

  const [color, setColor] = useState('#2a9d8f');
  const [alpha, setAlpha] = useState(1);
  const [eraser, setEraser] = useState(false);
  const [patternId, setPatternId] = useState<string | null>(null);

  const [tool, setTool] = useState<Tool>('draw');
  const [brushShape, setBrushShape] = useState<BrushShape>('square');
  const [brushSize, setBrushSize] = useState(1);

  const [strokeEnabled, setStrokeEnabled] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#3a3a3a');
  const [strokeWidth, setStrokeWidth] = useState(1);

  const [activePanel, setActivePanel] = useState<PanelKind>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const editorRef = useRef<PixelEditorHandle | null>(null);

  const ink: Ink = {
    color: eraser ? 0 : hexToPacked(color, alpha),
    patternId: eraser ? null : patternId,
  };

  const handleHistoryChange = useCallback((undo: boolean, redo: boolean) => {
    setCanUndo(undo);
    setCanRedo(redo);
  }, []);

  return (
    <div className="app">
      <PixelEditor
        ref={editorRef}
        cols={cols}
        rows={rows}
        pixelAspectRatio={pixelAspectRatio}
        ink={ink}
        tool={tool}
        brushShape={brushShape}
        brushSize={brushSize}
        strokeEnabled={strokeEnabled}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        onHistoryChange={handleHistoryChange}
      />

      <Toolbar
        activePanel={activePanel}
        onTogglePanel={setActivePanel}
        tool={tool}
        onToolChange={setTool}
        onUndo={() => editorRef.current?.undo()}
        onRedo={() => editorRef.current?.redo()}
        onClear={() => editorRef.current?.clear()}
        onExport={() => editorRef.current?.exportSvg(EXPORT_CELL_SIZE)}
        onResetView={() => editorRef.current?.resetView()}
        canUndo={canUndo}
        canRedo={canRedo}
        swatchColor={color}
      />

      {activePanel === 'color' && (
        <ColorPickerPanel
          color={color}
          alpha={alpha}
          eraser={eraser}
          patternId={patternId}
          onColorChange={(hex) => {
            setColor(hex);
            setEraser(false);
          }}
          onAlphaChange={setAlpha}
          onEraserToggle={() => setEraser((v) => !v)}
          onPatternChange={setPatternId}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'dimensions' && (
        <DimensionsPanel
          cols={cols}
          rows={rows}
          pixelAspectRatio={pixelAspectRatio}
          onApply={(newCols, newRows) => {
            setCols(newCols);
            setRows(newRows);
          }}
          onAspectRatioChange={setPixelAspectRatio}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'stroke' && (
        <StrokePanel
          enabled={strokeEnabled}
          color={strokeColor}
          width={strokeWidth}
          onEnabledChange={setStrokeEnabled}
          onColorChange={setStrokeColor}
          onWidthChange={setStrokeWidth}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'brush' && (
        <BrushPanel
          shape={brushShape}
          size={brushSize}
          onShapeChange={setBrushShape}
          onSizeChange={setBrushSize}
          onClose={() => setActivePanel(null)}
        />
      )}
    </div>
  );
}
