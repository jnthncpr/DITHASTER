import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { type PixelGrid, clearGrid, cloneGrid, createGrid, plotLine, resizeGrid, setCell } from '../lib/grid';
import { packedToCss } from '../lib/color';
import { downloadSvg, gridToSvg } from '../lib/svgExport';

const BASE_CELL = 16;
const MIN_SCALE = 0.25;
const MAX_SCALE = 40;
const HISTORY_LIMIT = 50;
const TAP_GESTURE_MAX_MS = 300;

export interface PixelEditorHandle {
  clear: () => void;
  undo: () => void;
  redo: () => void;
  resetView: () => void;
  exportSvg: (cellSize: number, filename?: string) => void;
}

export interface PixelEditorProps {
  cols: number;
  rows: number;
  pixelAspectRatio: number;
  paintColor: number;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

interface View {
  scale: number;
  tx: number;
  ty: number;
}

interface ActivePointer {
  x: number;
  y: number;
  type: string;
}

const PixelEditor = forwardRef<PixelEditorHandle, PixelEditorProps>(function PixelEditor(
  { cols, rows, pixelAspectRatio, paintColor, strokeEnabled, strokeColor, strokeWidth, onHistoryChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gridRef = useRef<PixelGrid>(createGrid(cols, rows));
  const viewRef = useRef<View>({ scale: 1, tx: 0, ty: 0 });

  const pointersRef = useRef<Map<number, ActivePointer>>(new Map());
  const drawRef = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null);
  const gestureRef = useRef<{
    startDist: number;
    startScale: number;
    startMidX: number;
    startMidY: number;
    startTx: number;
    startTy: number;
    startTime: number;
    moved: boolean;
  } | null>(null);

  const historyRef = useRef<PixelGrid[]>([]);
  const redoRef = useRef<PixelGrid[]>([]);

  const cellW = BASE_CELL * pixelAspectRatio;
  const cellH = BASE_CELL;

  const reportHistory = useCallback(() => {
    onHistoryChange?.(historyRef.current.length > 0, redoRef.current.length > 0);
  }, [onHistoryChange]);

  const applyTransform = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const { scale, tx, ty } = viewRef.current;
    wrapper.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const grid = gridRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const packed = grid.data[y * grid.cols + x];
        if ((packed & 0xff) === 0) continue;
        ctx.fillStyle = packedToCss(packed);
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
      }
    }
    if (strokeEnabled) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      for (let i = 0; i <= grid.cols; i++) {
        const x = i * cellW;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, grid.rows * cellH);
      }
      for (let j = 0; j <= grid.rows; j++) {
        const y = j * cellH;
        ctx.moveTo(0, y);
        ctx.lineTo(grid.cols * cellW, y);
      }
      ctx.stroke();
    }
  }, [cellW, cellH, strokeEnabled, strokeColor, strokeWidth]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const grid = gridRef.current;
    canvas.width = grid.cols * cellW;
    canvas.height = grid.rows * cellH;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    redraw();
  }, [cellW, cellH, redraw]);

  const fitToView = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const pad = 48;
    const availW = container.clientWidth - pad * 2;
    const availH = container.clientHeight - pad * 2;
    const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.min(availW / canvas.width, availH / canvas.height)));
    const tx = (container.clientWidth - canvas.width * scale) / 2;
    const ty = (container.clientHeight - canvas.height * scale) / 2;
    viewRef.current = { scale, tx, ty };
    applyTransform();
  }, [applyTransform]);

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const isFirstDims = useRef(true);
  useEffect(() => {
    if (isFirstDims.current) {
      isFirstDims.current = false;
      fitToView();
      return;
    }
    historyRef.current.push(cloneGrid(gridRef.current));
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
    redoRef.current = [];
    gridRef.current = resizeGrid(gridRef.current, cols, rows);
    resizeCanvas();
    fitToView();
    reportHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, rows]);

  useEffect(() => {
    fitToView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixelAspectRatio]);

  useEffect(() => {
    const onResize = () => fitToView();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitToView]);

  const pushHistory = useCallback(() => {
    historyRef.current.push(cloneGrid(gridRef.current));
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
    redoRef.current = [];
    reportHistory();
  }, [reportHistory]);

  const screenToGrid = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const localX = ((clientX - rect.left) / rect.width) * canvas.width;
      const localY = ((clientY - rect.top) / rect.height) * canvas.height;
      return { x: Math.floor(localX / cellW), y: Math.floor(localY / cellH) };
    },
    [cellW, cellH],
  );

  const paintAt = useCallback(
    (x: number, y: number) => {
      setCell(gridRef.current, x, y, paintColor);
    },
    [paintColor],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      container?.setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });

      if (e.pointerType === 'touch' && pointersRef.current.size === 2) {
        // Switch to pan/zoom gesture; abandon any in-progress draw stroke.
        drawRef.current = null;
        const pts = Array.from(pointersRef.current.values());
        const dx = pts[0].x - pts[1].x;
        const dy = pts[0].y - pts[1].y;
        const dist = Math.hypot(dx, dy);
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        gestureRef.current = {
          startDist: dist,
          startScale: viewRef.current.scale,
          startMidX: midX,
          startMidY: midY,
          startTx: viewRef.current.tx,
          startTy: viewRef.current.ty,
          startTime: performance.now(),
          moved: false,
        };
        return;
      }

      if (pointersRef.current.size === 1) {
        const pos = screenToGrid(e.clientX, e.clientY);
        if (!pos) return;
        pushHistory();
        paintAt(pos.x, pos.y);
        redraw();
        drawRef.current = { pointerId: e.pointerId, lastX: pos.x, lastY: pos.y };
      }
    },
    [screenToGrid, pushHistory, paintAt, redraw],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
      }

      if (gestureRef.current && pointersRef.current.size === 2) {
        const pts = Array.from(pointersRef.current.values());
        const dx = pts[0].x - pts[1].x;
        const dy = pts[0].y - pts[1].y;
        const dist = Math.hypot(dx, dy);
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        const g = gestureRef.current;
        const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, g.startScale * (dist / g.startDist)));
        const panX = midX - g.startMidX;
        const panY = midY - g.startMidY;
        if (Math.abs(panX) > 2 || Math.abs(panY) > 2 || Math.abs(dist - g.startDist) > 2) {
          g.moved = true;
        }
        viewRef.current = { scale, tx: g.startTx + panX, ty: g.startTy + panY };
        applyTransform();
        return;
      }

      if (drawRef.current && drawRef.current.pointerId === e.pointerId) {
        const pos = screenToGrid(e.clientX, e.clientY);
        if (!pos) return;
        plotLine(drawRef.current.lastX, drawRef.current.lastY, pos.x, pos.y, (x, y) => paintAt(x, y));
        drawRef.current.lastX = pos.x;
        drawRef.current.lastY = pos.y;
        redraw();
      }
    },
    [applyTransform, screenToGrid, paintAt, redraw],
  );

  const endPointer = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const wasGesture = gestureRef.current;
    pointersRef.current.delete(e.pointerId);

    if (drawRef.current?.pointerId === e.pointerId) {
      drawRef.current = null;
    }

    if (pointersRef.current.size < 2) {
      if (
        wasGesture &&
        !wasGesture.moved &&
        performance.now() - wasGesture.startTime < TAP_GESTURE_MAX_MS
      ) {
        // Two-finger tap with negligible movement: treat as undo gesture.
        undoRef.current?.();
      }
      gestureRef.current = null;
    }
  }, []);

  // Stable ref so endPointer (created once via useCallback deps) can call the latest undo.
  const undoRef = useRef<(() => void) | null>(null);

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    redoRef.current.push(cloneGrid(gridRef.current));
    gridRef.current = prev;
    resizeCanvas();
    fitToView();
    reportHistory();
  }, [resizeCanvas, fitToView, reportHistory]);

  useEffect(() => {
    undoRef.current = undo;
  }, [undo]);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(cloneGrid(gridRef.current));
    gridRef.current = next;
    resizeCanvas();
    fitToView();
    reportHistory();
  }, [resizeCanvas, fitToView, reportHistory]);

  useImperativeHandle(
    ref,
    () => ({
      clear() {
        pushHistory();
        clearGrid(gridRef.current);
        redraw();
      },
      undo,
      redo,
      resetView() {
        fitToView();
      },
      exportSvg(cellSize: number, filename = 'pixel-art.svg') {
        const svg = gridToSvg(gridRef.current, {
          pixelAspectRatio,
          cellSize,
          stroke: strokeEnabled ? { color: strokeColor, width: strokeWidth } : null,
        });
        downloadSvg(svg, filename);
      },
    }),
    [pushHistory, fitToView, redraw, undo, redo, pixelAspectRatio, strokeEnabled, strokeColor, strokeWidth],
  );

  return (
    <div
      ref={containerRef}
      className="pixel-editor-viewport"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    >
      <div ref={wrapperRef} className="pixel-editor-wrapper">
        <canvas ref={canvasRef} className="pixel-editor-canvas" />
      </div>
    </div>
  );
});

export default PixelEditor;
