import React, { useRef, useState } from 'react';
import { Section, EditorElement, GuidelineWidth } from '../types';
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

  // Section Height resizing logic
  const handleResizeStart = (e: React.MouseEvent, sectionId: string, currentHeight: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingSection({
      id: sectionId,
      startHeight: currentHeight,
      startY: e.clientY,
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingSection) {
        const deltaY = moveEvent.clientY - e.clientY;
        const newHeight = Math.max(150, Math.min(1000, currentHeight + deltaY));
        
        setSections(prev =>
          prev.map(s => (s.id === sectionId ? { ...s, height: newHeight } : s))
        );
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setResizingSection(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
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

  // Grid lines renderer
  const renderGridCols = () => {
    return Array.from({ length: 12 }).map((_, idx) => (
      <div key={idx} className="grid-guide-col"></div>
    ));
  };

  return (
    <div className="canvas-grid-root" ref={containerRef}>
      {/* Centered Guide Overlay holding sections */}
      <div className={`canvas-guide-overlay ${guideline === '80%' ? 'g-80' : guideline === '60%' ? 'g-60' : 'g-100'}`}>
        
        {/* Left Dimmed Margin Shading */}
        <div className="side-margin left-margin">
          <div className="margin-border-line"></div>
        </div>

        {/* Content Container spanning the guideline width */}
        <div className="canvas-content-area">
          
          {/* Top section divider button */}
          <div className="section-insert-line top-line">
            <button className="insert-btn" onClick={() => addSection(-1)}>
              <Plus size={12} />
              <span>섹션 추가</span>
            </button>
          </div>

          {sections.map((sec, secIdx) => (
            <div
              key={sec.id}
              className="canvas-section-node relative"
              style={{
                height: sec.height,
                backgroundColor: sec.backgroundColor,
                backgroundImage: sec.backgroundImage ? `url(${sec.backgroundImage})` : 'none',
              }}
              onClick={() => setActiveElement(null)}
            >
              {/* Grid guide overlay (dashed lines) - shown in editor */}
              <div className="grid-guides-overlay">
                {renderGridCols()}
              </div>

              {/* Elements rendering box */}
              <div className="elements-box w-full h-full relative">
                {/* Element rendering will be placed here in step 5 */}
                {sec.elements.map(el => (
                  <div
                    key={el.id}
                    className={`mock-canvas-element absolute flex items-center justify-center ${activeElement?.elementId === el.id ? 'active' : ''}`}
                    style={{
                      left: `calc(${(el.gridX / 12) * 100}% + 8px)`,
                      width: `calc(${(el.gridW / 12) * 100}% - 16px)`,
                      top: el.gridY * 55 + 20,
                      height: el.gridH * 55 - 15,
                      fontFamily: el.fontFamily.includes('Noto') ? "'Noto Sans KR', sans-serif" : 'inherit',
                      color: el.color,
                      fontSize: el.fontSize,
                      textAlign: el.align,
                      background: el.type === 'button' ? (el.btnBgColor || '#18a0fb') : (el.type === 'image' ? '#eee' : 'transparent'),
                      borderRadius: el.borderRadius ?? 4,
                      boxShadow: el.boxShadow || 'none',
                      border: el.type === 'image' || el.type === 'button' ? 'none' : '1px dashed rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      zIndex: activeElement?.elementId === el.id ? 10 : 2
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveElement({ sectionId: sec.id, elementId: el.id });
                    }}
                  >
                    {el.type === 'image' ? (
                      <img src={el.src} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: el.borderRadius }} alt="element" />
                    ) : el.type === 'button' ? (
                      <span style={{ color: el.btnTextColor || '#fff', fontSize: el.fontSize }}>{el.content}</span>
                    ) : (
                      <span>{el.content}</span>
                    )}
                  </div>
                ))}
              </div>

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
                onMouseDown={(e) => handleResizeStart(e, sec.id, sec.height)}
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
          ))}
        </div>

        {/* Right Dimmed Margin Shading */}
        <div className="side-margin right-margin">
          <div className="margin-border-line"></div>
        </div>

      </div>

      <style>{`
        .canvas-grid-root {
          width: 100%;
          min-height: 100%;
          position: relative;
        }

        .canvas-guide-overlay {
          display: flex;
          width: 100%;
          min-height: 100%;
        }

        .canvas-content-area {
          flex: 1;
          background-color: transparent;
          transition: flex 0.25s ease-in-out;
          position: relative;
          z-index: 5;
        }

        .side-margin {
          background-color: var(--figma-margin-dim);
          transition: width 0.25s ease-in-out;
          position: relative;
          z-index: 10;
          pointer-events: none;
        }

        .margin-border-line {
          width: 1px;
          height: 100%;
          background: rgba(24, 160, 251, 0.25);
          position: absolute;
        }

        .left-margin .margin-border-line {
          right: 0;
          border-right: 1px dashed rgba(24, 160, 251, 0.4);
        }

        .right-margin .margin-border-line {
          left: 0;
          border-left: 1px dashed rgba(24, 160, 251, 0.4);
        }

        /* Dimension definitions */
        .canvas-guide-overlay.g-100 .side-margin { width: 0%; }
        .canvas-guide-overlay.g-100 .canvas-content-area { flex: 0 0 100%; }

        .canvas-guide-overlay.g-80 .side-margin { width: 10%; }
        .canvas-guide-overlay.g-80 .canvas-content-area { flex: 0 0 80%; }

        .canvas-guide-overlay.g-60 .side-margin { width: 20%; }
        .canvas-guide-overlay.g-60 .canvas-content-area { flex: 0 0 60%; }

        /* Canvas Section nodes styling */
        .canvas-section-node {
          border-bottom: 1px solid var(--figma-border);
          position: relative;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          transition: background-color 0.2s;
        }

        .grid-guides-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          padding: 0 8px;
          gap: 16px;
          pointer-events: none;
          z-index: 1;
        }

        .grid-guide-col {
          border-left: 1px dashed var(--figma-grid-line);
          border-right: 1px dashed var(--figma-grid-line);
          background-color: rgba(24, 160, 251, 0.005);
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
          background: rgba(24, 160, 251, 0.3);
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

        /* Placement */
        .canvas-section-node .section-insert-line {
          bottom: -1px;
        }

        .section-insert-line.top-line {
          top: 0;
          position: relative;
          margin-bottom: -2px;
        }

        .canvas-section-node:hover .section-insert-line,
        .section-insert-line.top-line:hover,
        .canvas-content-area:hover .section-insert-line.top-line {
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

        /* Section Operations */
        .section-operations {
          position: absolute;
          left: -45px;
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

        /* Mock Element */
        .mock-canvas-element {
          transition: border-color 0.15s;
        }
        .mock-canvas-element.active {
          outline: 2px solid var(--figma-accent);
        }
      `}</style>
    </div>
  );
};
