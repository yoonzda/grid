import { useState } from 'react';
import { EditorElement, Section } from '../types';

export interface AlignmentLine {
  type: 'vertical' | 'horizontal';
  position: number; // pixel position relative to grid container
  targetId: string;
}

export interface DragState {
  elementId: string;
  sectionId: string;
  startX: number;
  startY: number;
  startGridX: number;
  startGridY: number;
  currentLeft: number;
  currentTop: number;
  isDragging: boolean;
}

export interface ResizeState {
  elementId: string;
  sectionId: string;
  handle: 'r' | 'b' | 'br'; // right, bottom, bottom-right
  startX: number;
  startY: number;
  startGridW: number;
  startGridH: number;
  currentWidth: number;
  currentHeight: number;
  isResizing: boolean;
}

export const useGridSnap = (
  sections: Section[],
  setSections: React.Dispatch<React.SetStateAction<Section[]>>
) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([]);

  const GRID_COLS = 12;
  const ROW_HEIGHT = 40;
  const GAP = 16;
  const PADDING_TOP = 40;

  // Start element dragging
  const handleDragStart = (
    e: React.MouseEvent,
    sectionId: string,
    element: EditorElement,
    containerWidth: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const colWidth = (containerWidth - (GRID_COLS - 1) * GAP) / GRID_COLS;
    const initialLeft = element.gridX * (colWidth + GAP);
    const initialTop = element.gridY * (ROW_HEIGHT + GAP) + PADDING_TOP;

    setDragState({
      elementId: element.id,
      sectionId,
      startX: e.clientX,
      startY: e.clientY,
      startGridX: element.gridX,
      startGridY: element.gridY,
      currentLeft: initialLeft,
      currentTop: initialTop,
      isDragging: true,
    });
  };

  // Drag mouse move handler
  const handleDragMove = (
    clientX: number,
    clientY: number,
    containerWidth: number,
    sectionId: string,
    elementId: string
  ) => {
    if (!dragState) return;

    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;

    const colWidth = (containerWidth - (GRID_COLS - 1) * GAP) / GRID_COLS;
    const startLeft = dragState.startGridX * (colWidth + GAP);
    const startTop = dragState.startGridY * (ROW_HEIGHT + GAP) + PADDING_TOP;

    let newLeft = startLeft + deltaX;
    let newTop = startTop + deltaY;

    // Detect alignments & guides
    const section = sections.find(s => s.id === sectionId);
    const currentEl = section?.elements.find(e => e.id === elementId);
    if (!section || !currentEl) return;

    const widthPx = currentEl.gridW * colWidth + (currentEl.gridW - 1) * GAP;
    const heightPx = currentEl.gridH * ROW_HEIGHT + (currentEl.gridH - 1) * GAP;

    const lines: AlignmentLine[] = [];
    const SNAP_THRESHOLD = 8; // Snap range in pixels

    // Coordinates of current dragged element
    const dragL = newLeft;
    const dragR = newLeft + widthPx;
    const dragC = newLeft + widthPx / 2;
    const dragT = newTop;
    const dragB = newTop + heightPx;
    const dragCY = newTop + heightPx / 2;

    // Check alignments against other elements in same section
    section.elements.forEach(other => {
      if (other.id === elementId) return;

      const otherL = other.gridX * (colWidth + GAP);
      const otherR = otherL + other.gridW * colWidth + (other.gridW - 1) * GAP;
      const otherC = otherL + (other.gridW * colWidth + (other.gridW - 1) * GAP) / 2;
      const otherT = other.gridY * (ROW_HEIGHT + GAP) + PADDING_TOP;
      const otherB = otherT + other.gridH * ROW_HEIGHT + (other.gridH - 1) * GAP;
      const otherCY = otherT + (other.gridH * ROW_HEIGHT + (other.gridH - 1) * GAP) / 2;

      // Vertical guides (matching X coordinates)
      if (Math.abs(dragL - otherL) < SNAP_THRESHOLD) {
        newLeft = otherL;
        lines.push({ type: 'vertical', position: otherL, targetId: other.id });
      } else if (Math.abs(dragR - otherR) < SNAP_THRESHOLD) {
        newLeft = otherR - widthPx;
        lines.push({ type: 'vertical', position: otherR, targetId: other.id });
      } else if (Math.abs(dragC - otherC) < SNAP_THRESHOLD) {
        newLeft = otherC - widthPx / 2;
        lines.push({ type: 'vertical', position: otherC, targetId: other.id });
      }

      // Horizontal guides (matching Y coordinates)
      if (Math.abs(dragT - otherT) < SNAP_THRESHOLD) {
        newTop = otherT;
        lines.push({ type: 'horizontal', position: otherT, targetId: other.id });
      } else if (Math.abs(dragB - otherB) < SNAP_THRESHOLD) {
        newTop = otherB - heightPx;
        lines.push({ type: 'horizontal', position: otherB, targetId: other.id });
      } else if (Math.abs(dragCY - otherCY) < SNAP_THRESHOLD) {
        newTop = otherCY - heightPx / 2;
        lines.push({ type: 'horizontal', position: otherCY, targetId: other.id });
      }
    });

    // Check center guidelines of section (canvas center)
    const canvasCenterX = containerWidth / 2;
    if (Math.abs(dragC - canvasCenterX) < SNAP_THRESHOLD) {
      newLeft = canvasCenterX - widthPx / 2;
      lines.push({ type: 'vertical', position: canvasCenterX, targetId: 'canvas-center' });
    }

    // Grid coordinates snap mapping
    let gridX = Math.round(newLeft / (colWidth + GAP));
    let gridY = Math.round((newTop - PADDING_TOP) / (ROW_HEIGHT + GAP));

    // Bounds limit
    gridX = Math.max(0, Math.min(GRID_COLS - currentEl.gridW, gridX));
    gridY = Math.max(0, gridY);

    setDragState(prev => prev ? { ...prev, currentLeft: newLeft, currentTop: newTop } : null);
    setAlignmentLines(lines);

    // Update section elements preview state on the fly
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          elements: s.elements.map(el =>
            el.id === elementId ? { ...el, gridX, gridY } : el
          ),
        };
      })
    );
  };

  // Start element resizing
  const handleResizeStart = (
    e: React.MouseEvent,
    sectionId: string,
    element: EditorElement,
    handle: 'r' | 'b' | 'br',
    containerWidth: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const colWidth = (containerWidth - (GRID_COLS - 1) * GAP) / GRID_COLS;
    const initialWidth = element.gridW * colWidth + (element.gridW - 1) * GAP;
    const initialHeight = element.gridH * ROW_HEIGHT + (element.gridH - 1) * GAP;

    setResizeState({
      elementId: element.id,
      sectionId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startGridW: element.gridW,
      startGridH: element.gridH,
      currentWidth: initialWidth,
      currentHeight: initialHeight,
      isResizing: true,
    });
  };

  // Resize mouse move handler
  const handleResizeMove = (
    clientX: number,
    clientY: number,
    containerWidth: number,
    sectionId: string,
    elementId: string
  ) => {
    if (!resizeState) return;

    const deltaX = clientX - resizeState.startX;
    const deltaY = clientY - resizeState.startY;

    const colWidth = (containerWidth - (GRID_COLS - 1) * GAP) / GRID_COLS;
    const startWidth = resizeState.startGridW * colWidth + (resizeState.startGridW - 1) * GAP;
    const startHeight = resizeState.startGridH * ROW_HEIGHT + (resizeState.startGridH - 1) * GAP;

    let newWidth = startWidth;
    let newHeight = startHeight;

    if (resizeState.handle === 'r' || resizeState.handle === 'br') {
      newWidth = Math.max(colWidth, startWidth + deltaX);
    }
    if (resizeState.handle === 'b' || resizeState.handle === 'br') {
      newHeight = Math.max(ROW_HEIGHT, startHeight + deltaY);
    }

    const section = sections.find(s => s.id === sectionId);
    const currentEl = section?.elements.find(e => e.id === elementId);
    if (!section || !currentEl) return;

    // Convert pixels to grid counts
    let gridW = Math.round((newWidth + GAP) / (colWidth + GAP));
    let gridH = Math.round((newHeight + GAP) / (ROW_HEIGHT + GAP));

    // Limit bounds
    gridW = Math.max(1, Math.min(GRID_COLS - currentEl.gridX, gridW));
    gridH = Math.max(1, gridH);

    setResizeState(prev =>
      prev ? { ...prev, currentWidth: newWidth, currentHeight: newHeight } : null
    );

    // Update dimensions on the fly
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          elements: s.elements.map(el =>
            el.id === elementId ? { ...el, gridW, gridH } : el
          ),
        };
      })
    );
  };

  // Stop drag or resize
  const handleActionEnd = () => {
    setDragState(null);
    setResizeState(null);
    setAlignmentLines([]);
  };

  return {
    dragState,
    resizeState,
    alignmentLines,
    handleDragStart,
    handleDragMove,
    handleResizeStart,
    handleResizeMove,
    handleActionEnd,
  };
};
