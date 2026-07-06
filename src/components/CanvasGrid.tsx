import React, { useRef, useState, useEffect } from 'react';
import { Section, EditorElement, GuidelineWidth } from '../types';
import { ElementWrapper } from './ElementWrapper';
import { useGridSnap } from '../hooks/useGridSnap';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface CanvasGridProps {
  guideline: GuidelineWidth;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  activeElement: { sectionId: string; elementId: string } | null;
  setActiveElement: (val: { sectionId: string; elementId: string } | null) => void;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  guideline,
  sections,
  setSections,
  activeElement,
  setActiveElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizingSection, setResizingSection] = useState<{ id: string; startHeight: number; startY: number } | null>(null);
  const [activeDragContainerWidth, setActiveDragContainerWidth] = useState<number>(1200);

  // Retrieve drag & snap controls from custom hook
  const {
    dragState,
    resizeState,
    alignmentLines,
    handleDragStart,
    handleDragMove,
    handleResizeStart,
    handleResizeMove,
    handleActionEnd,
  } = useGridSnap(sections, setSections);

  // Global mouse handlers for Drag and Resize operations
  useEffect(() => {
    if (!dragState && !resizeState) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragState) {
        handleDragMove(e.clientX, e.clientY, activeDragContainerWidth, dragState.sectionId, dragState.elementId);
      } else if (resizeState) {
        handleResizeMove(e.clientX, e.clientY, activeDragContainerWidth, resizeState.sectionId, resizeState.elementId);
      }
    };

    const handleGlobalMouseUp = () => {
      handleActionEnd();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, resizeState, activeDragContainerWidth]);

  // Dynamic start triggers using closest DOM element to get accurate container width
  const onElementDragStart = (e: React.MouseEvent, sectionId: string, element: EditorElement) => {
    const gridContainer = (e.currentTarget as HTMLElement).closest('.section-grid-container');
    const width = gridContainer ? gridContainer.getBoundingClientRect().width : 1200;
    setActiveDragContainerWidth(width);
    handleDragStart(e, sectionId, element, width);
  };

  const onElementResizeStart = (e: React.MouseEvent, sectionId: string, element: EditorElement, handle: 'r' | 'b' | 'br') => {
    const gridContainer = (e.currentTarget as HTMLElement).closest('.section-grid-container');
    const width = gridContainer ? gridContainer.getBoundingClientRect().width : 1200;
    setActiveDragContainerWidth(width);
    handleResizeStart(e, sectionId, element, handle, width);
  };

  // Section Height Resizing
  const handleSectionResizeStart = (e: React.MouseEvent, sectionId: string, currentHeight: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingSection({
      id: sectionId,
      startHeight: currentHeight,
      startY: e.clientY,
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - e.clientY;
      const newHeight = Math.max(150, Math.min(1000, currentHeight + deltaY));
      
      setSections(prev =>
        prev.map(s => (s.id === sectionId ? { ...s, height: newHeight } : s))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setResizingSection(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Inline text editing updates
  const handleTextChange = (sectionId: string, elementId: string, newText: string) => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          elements: s.elements.map(el =>
            el.id === elementId ? { ...el, content: newText } : el
          ),
        };
      })
    );
  };

  // Section CRUD operations
  const addSection = (index: number) => {
    const newSection: Section = {
      id: `s_${Date.now()}`,
      height: 350,
      backgroundColor: '#ffffff',
      elements: [],
    };
    setSections(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newSection);
      return updated;
    });
  };

  const deleteSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sections.length <= 1) {
      alert('최소 하나의 섹션은 존재해야 합니다.');
      return;
    }
    setSections(prev => prev.filter(s => s.id !== id));
    if (activeElement && activeElement.sectionId === id) {
      setActiveElement(null);
    }
  };

  const moveSection = (id: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setSections(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const renderGridCols = () => {
    return Array.from({ length: 12 }).map((_, idx) => (
      <div key={idx} className="grid-guide-col"></div>
    ));
  };

  const getMarginPercent = () => {
    if (guideline === '80%') return '10%';
    if (guideline === '60%') return '20%';
    return '0%';
  };

  const getContentPercent = () => {
    if (guideline === '80%') return '80%';
    if (guideline === '60%') return '60%';
    return '100%';
  };

  return (
    <div className="canvas-grid-root" ref={containerRef}>
      {/* Top section divider button */}
      <div className="section-insert-line top-line">
        <button className="insert-btn" onClick={() => addSection(-1)}>
          <Plus size={12} />
          <span>섹션 추가</span>
        </button>
      </div>

      {sections.map((sec, secIdx) => {
        const isDraggingInThisSection = dragState?.sectionId === sec.id;

        return (
          <div
            key={sec.id}
            className="canvas-section-node relative w-full"
            style={{
              minHeight: sec.height,
              height: 'auto', // dynamic height flow
              backgroundColor: sec.backgroundColor,
              backgroundImage: sec.backgroundImage ? `url(${sec.backgroundImage})` : 'none',
            }}
            onClick={() => setActiveElement(null)}
          >
            {/* 1. Left Dimmed Margin Shading Layer */}
            {guideline !== '100%' && (
              <div className="side-margin-shading left" style={{ width: getMarginPercent() }}>
                <div className="margin-border-line right-border"></div>
              </div>
            )}

            {/* 2. Centered Content Grid Container */}
            <div
              className="section-grid-container"
              style={{ width: getContentPercent() }}
            >
              {/* Grid column guidelines */}
              <div className="grid-guides-overlay">
                {renderGridCols()}
              </div>

              {/* Elements container utilizing real CSS Grid for placement layout */}
              <div className="elements-box">
                {sec.elements.map(el => (
                  <ElementWrapper
                    key={el.id}
                    element={el}
                    sectionId={sec.id}
                    isActive={activeElement?.elementId === el.id}
                    onClick={() => setActiveElement({ sectionId: sec.id, elementId: el.id })}
                    onDragStart={onElementDragStart}
                    onResizeStart={onElementResizeStart}
                    onTextChange={handleTextChange}
                  />
                ))}
              </div>

              {/* Smart Guide lines drawing during drag */}
              {isDraggingInThisSection &&
                alignmentLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`smart-guide-line ${line.type}`}
                    style={
                      line.type === 'vertical'
                        ? { left: line.position }
                        : { top: line.position }
                    }
                  />
                ))}
            </div>

            {/* 3. Right Dimmed Margin Shading Layer */}
            {guideline !== '100%' && (
              <div className="side-margin-shading right" style={{ width: getMarginPercent() }}>
                <div className="margin-border-line left-border"></div>
              </div>
            )}

            {/* Section Operations Bar (Floating controller) */}
            <div className="section-operations">
              <div className="operation-tag">섹션 {secIdx + 1}</div>
              <button
                className="op-btn"
                disabled={secIdx === 0}
                onClick={(e) => moveSection(sec.id, 'up', e)}
                title="위로 이동"
              >
                <ChevronUp size={14} />
              </button>
              <button
                className="op-btn"
                disabled={secIdx === sections.length - 1}
                onClick={(e) => moveSection(sec.id, 'down', e)}
                title="아래로 이동"
              >
                <ChevronDown size={14} />
              </button>
              <button
                className="op-btn delete"
                onClick={(e) => deleteSection(sec.id, e)}
                title="섹션 삭제"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Section Height Resize Handle (Bottom border drag) */}
            <div
              className="section-resize-handle"
              onMouseDown={(e) => handleSectionResizeStart(e, sec.id, sec.height)}
              title="섹션 높이 조절"
            >
              <div className="resize-indicator"></div>
            </div>

            {/* Section Insert Divider Line */}
            <div className="section-insert-line">
              <button className="insert-btn" onClick={() => addSection(secIdx)}>
                <Plus size={12} />
                <span>섹션 추가</span>
              </button>
            </div>
          </div>
        );
      })}

      <style>{`
        .canvas-grid-root {
          width: 100%;
          min-height: 100%;
          position: relative;
          padding: 40px 0;
        }

        /* Full width section node */
        .canvas-section-node {
          border-bottom: 1px solid var(--figma-border);
          position: relative;
          background-size: cover;
          background-position: center;
          transition: background-color 0.2s;
        }

        /* Center content container */
        .section-grid-container {
          margin: 0 auto;
          min-height: 100%;
          position: relative;
          z-index: 5;
          transition: width 0.25s ease-in-out;
          display: flex;
          flex-direction: column;
        }

        /* Side margin shading layers */
        .side-margin-shading {
          position: absolute;
          top: 0;
          bottom: 0;
          background-color: var(--figma-margin-dim); /* Overlay shading */
          z-index: 10;
          pointer-events: none;
          transition: width 0.25s ease-in-out;
        }

        .side-margin-shading.left {
          left: 0;
        }

        .side-margin-shading.right {
          right: 0;
        }

        /* Solid guideline border lines */
        .margin-border-line {
          position: absolute;
          width: 1px;
          height: 100%;
          border-left: 1px dashed rgba(24, 160, 251, 0.4);
        }

        .right-border {
          right: 0;
        }

        .left-border {
          left: 0;
        }

        .grid-guides-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          padding: 40px 8px;
          gap: 16px;
          pointer-events: none;
          z-index: 1;
        }

        .grid-guide-col {
          border-left: 1px dashed var(--figma-grid-line);
          border-right: 1px dashed var(--figma-grid-line);
          background-color: rgba(24, 160, 251, 0.002);
          height: 100%;
        }

        /* Section height resize handle */
        .section-resize-handle {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 8px;
          cursor: ns-resize;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          transition: background 0.2s;
        }

        .section-resize-handle:hover {
          background: rgba(24, 160, 251, 0.2);
        }

        .resize-indicator {
          width: 30px;
          height: 3px;
          background: var(--figma-accent);
          border-radius: 1.5px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .section-resize-handle:hover .resize-indicator {
          opacity: 1;
        }

        /* Add section divider line buttons */
        .section-insert-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: transparent;
          z-index: 30;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        .canvas-section-node .section-insert-line {
          bottom: -1px;
        }

        .section-insert-line.top-line {
          top: 0;
          position: relative;
          margin-bottom: -2px;
        }

        .canvas-section-node:hover .section-insert-line,
        .section-insert-line.top-line:hover {
          opacity: 1;
          pointer-events: auto;
        }

        .insert-btn {
          background: var(--figma-bg);
          border: 1px solid var(--figma-accent);
          color: var(--figma-accent);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transform: translateY(0);
          transition: all 0.15s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .insert-btn:hover {
          background: var(--figma-accent);
          color: white;
          transform: scale(1.05);
        }

        .section-operations {
          position: absolute;
          left: 10px;
          top: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--figma-bg);
          border: 1px solid var(--figma-border);
          padding: 4px;
          border-radius: 6px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 25;
        }

        .canvas-section-node:hover .section-operations {
          opacity: 1;
        }

        .operation-tag {
          font-size: 8px;
          font-weight: 700;
          color: var(--figma-text-muted);
          text-align: center;
          padding: 2px 0;
          border-bottom: 1px solid var(--figma-border);
          margin-bottom: 2px;
        }

        .op-btn {
          background: transparent;
          border: none;
          color: var(--figma-text-muted);
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .op-btn:hover:not(:disabled) {
          background: rgba(0,0,0,0.05);
          color: var(--figma-text);
        }

        .op-btn.delete:hover {
          background: rgba(242, 78, 30, 0.1);
          color: var(--figma-danger);
        }

        .op-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Dynamic row height grid to accommodate wrap and auto-expands */
        .elements-box {
          position: relative;
          width: 100%;
          min-height: 100%;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(40px, auto); /* auto expanding rows! */
          padding: 40px 8px;
          gap: 16px;
          pointer-events: none;
          z-index: 2;
        }

        /* Smart Alignment Guides */
        .smart-guide-line {
          position: absolute;
          background-color: var(--figma-danger);
          pointer-events: none;
          z-index: 100;
        }

        .smart-guide-line.vertical {
          width: 1px;
          height: 100%;
          top: 0;
          border-left: 1px dashed var(--figma-danger);
        }

        .smart-guide-line.horizontal {
          height: 1px;
          width: 100%;
          left: 0;
          border-top: 1px dashed var(--figma-danger);
        }
      `}</style>
    </div>
  );
};
