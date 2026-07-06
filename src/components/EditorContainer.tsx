import React from 'react';
import { Section, EditorElement, GuidelineWidth, ElementType } from '../types';
import { LayoutGrid, Type, Image as ImageIcon, Link, Plus, Trash2, AlignCenter, AlignLeft, AlignRight, FileOutput, HelpCircle } from 'lucide-react';
import { CanvasGrid } from './CanvasGrid';
import { SidebarProperty } from './SidebarProperty';

interface EditorContainerProps {
  guideline: GuidelineWidth;
  setGuideline: (width: GuidelineWidth) => void;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  activeElement: { sectionId: string; elementId: string } | null;
  setActiveElement: (val: { sectionId: string; elementId: string } | null) => void;
  onExport: () => void;
}

export const EditorContainer: React.FC<EditorContainerProps> = ({
  guideline,
  setGuideline,
  sections,
  setSections,
  activeElement,
  setActiveElement,
  onExport,
}) => {
  
  // Adds a new element below the existing elements in the active/first section
  const addElement = (type: ElementType) => {
    if (sections.length === 0) return;
    
    // Choose section: use activeElement's section, or default to first section
    const targetSectionId = activeElement ? activeElement.sectionId : sections[0].id;
    const targetSection = sections.find(s => s.id === targetSectionId) || sections[0];
    
    // Calculate gridY (vertical placement) to append at the bottom row
    let maxGridY = 0;
    targetSection.elements.forEach(el => {
      maxGridY = Math.max(maxGridY, el.gridY + el.gridH);
    });

    const newElement: EditorElement = {
      id: `el_${Date.now()}`,
      type,
      gridX: 4, // Center horizontally by default
      gridW: type === 'button' ? 4 : (type === 'image' ? 6 : 8),
      gridY: maxGridY,
      gridH: type === 'image' ? 4 : (type === 'text' ? 2 : 1),
      content: type === 'title' ? '새 타이틀 텍스트' : (type === 'button' ? '버튼 텍스트' : '여기에 본문 글상자 텍스트를 입력하세요.'),
      color: type === 'title' ? '#1f2937' : '#4b5563',
      fontSize: type === 'title' ? '24px' : (type === 'button' ? '14px' : '14px'),
      fontFamily: '본고딕 (Noto Sans KR)',
      align: 'center',
    };

    if (type === 'image') {
      newElement.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800';
      newElement.borderRadius = 8;
      newElement.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }

    if (type === 'button') {
      newElement.btnBgColor = '#18a0fb';
      newElement.btnTextColor = '#ffffff';
      newElement.iconType = 'none';
      newElement.iconPosition = 'after';
      newElement.borderRadius = 6;
    }

    setSections(prev =>
      prev.map(s => {
        if (s.id !== targetSection.id) return s;
        return {
          ...s,
          elements: [...s.elements, newElement],
        };
      })
    );

    // Set new element as active
    setActiveElement({ sectionId: targetSection.id, elementId: newElement.id });
  };

  return (
    <div className="editor-shell flex flex-col h-full">
      {/* Top Figma-like Toolbar */}
      <div className="editor-toolbar flex items-center justify-between">
        <div className="toolbar-left flex items-center">
          <div className="app-logo flex items-center">
            <LayoutGrid size={18} className="logo-icon" />
            <span className="app-title">GRID.design</span>
          </div>
          <div className="divider"></div>
          {/* Guideline Width controls */}
          <div className="tool-group flex items-center">
            <span className="group-label">가이드라인폭:</span>
            {(['100%', '80%', '60%'] as GuidelineWidth[]).map((width) => (
              <button
                key={width}
                className={`tool-btn ${guideline === width ? 'active' : ''}`}
                onClick={() => setGuideline(width)}
              >
                {width}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-center flex items-center">
          <div className="tool-group flex items-center">
            <span className="group-label">섹션:</span>
            <button className="icon-tool-btn" onClick={() => {
              const newSection: Section = {
                id: `s_${Date.now()}`,
                height: 350,
                backgroundColor: '#ffffff',
                elements: [],
              };
              setSections(prev => [...prev, newSection]);
            }} title="새 섹션 추가">
              <Plus size={16} />
              <span>추가</span>
            </button>
          </div>
        </div>

        <div className="toolbar-right flex items-center">
          <button className="export-action-btn flex items-center gap-1" onClick={onExport}>
            <FileOutput size={15} />
            <span>내보내기</span>
          </button>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="workspace-main flex flex-1 overflow-hidden">
        {/* Left Elements Tool palette */}
        <div className="elements-palette flex flex-col">
          <div className="panel-header">요소 추가</div>
          <div className="palette-grid">
            <button className="add-el-btn flex flex-col items-center" onClick={() => addElement('title')}>
              <Type size={20} />
              <span>타이틀</span>
            </button>
            <button className="add-el-btn flex flex-col items-center" onClick={() => addElement('text')}>
              <Type size={20} style={{ opacity: 0.6 }} />
              <span>글상자</span>
            </button>
            <button className="add-el-btn flex flex-col items-center" onClick={() => addElement('image')}>
              <ImageIcon size={20} />
              <span>이미지</span>
            </button>
            <button className="add-el-btn flex flex-col items-center" onClick={() => addElement('button')}>
              <Link size={20} />
              <span>버튼</span>
            </button>
          </div>
        </div>

        {/* Center Canvas Area with guideline shading */}
        <div className="canvas-wrapper flex-1 overflow-auto">
          <CanvasGrid
            guideline={guideline}
            sections={sections}
            setSections={setSections}
            activeElement={activeElement}
            setActiveElement={setActiveElement}
          />
        </div>

        {/* Right Properties Panel */}
        <SidebarProperty
          activeElement={activeElement}
          sections={sections}
          setSections={setSections}
          setActiveElement={setActiveElement}
        />
      </div>

      {/* Bottom Figma-like Help/Status Bar */}
      <div className="editor-statusbar flex items-center justify-between">
        <div className="status-item flex items-center gap-1">
          <span className="dot online"></span>
          <span>에디터 활성화됨</span>
        </div>
        <div className="status-item flex items-center gap-1 text-muted">
          <HelpCircle size={12} />
          <span>도움말: 드래그하여 요소 이동 / 더블클릭하여 텍스트 수정</span>
        </div>
      </div>

      <style>{`
        .editor-shell {
          background-color: var(--figma-canvas);
          color: var(--figma-text);
          user-select: none;
        }

        .editor-toolbar {
          height: 45px;
          background-color: var(--figma-bg);
          border-bottom: 1px solid var(--figma-border);
          padding: 0 16px;
        }

        .app-logo {
          font-weight: 800;
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.5px;
          gap: 6px;
        }

        .logo-icon {
          color: var(--figma-accent);
        }

        .app-title {
          font-size: 15px;
        }

        .divider {
          width: 1px;
          height: 20px;
          background-color: var(--figma-border);
          margin: 0 16px;
        }

        .tool-group {
          gap: 8px;
        }

        .group-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--figma-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tool-btn {
          background: transparent;
          border: 1px solid var(--figma-border);
          color: var(--figma-text);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .tool-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .tool-btn.active {
          background-color: var(--figma-accent);
          border-color: var(--figma-accent);
          color: white;
        }

        .icon-tool-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--figma-border);
          color: var(--figma-text);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .icon-tool-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .export-action-btn {
          background: var(--figma-accent);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .export-action-btn:hover {
          background: var(--figma-accent-hover);
        }

        .workspace-main {
          display: flex;
          height: calc(100% - 45px - 25px);
        }

        .elements-palette {
          width: 200px;
          background-color: var(--figma-panel);
          border-right: 1px solid var(--figma-border);
        }

        .panel-header {
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 700;
          color: var(--figma-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--figma-border);
        }

        .palette-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 14px;
        }

        .add-el-btn {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px dashed var(--figma-border);
          color: var(--figma-text);
          padding: 14px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          gap: 8px;
        }

        .add-el-btn:hover {
          background-color: rgba(255, 255, 255, 0.07);
          border-color: var(--figma-accent);
          transform: translateY(-1px);
        }

        .canvas-wrapper {
          background-color: var(--figma-canvas);
          position: relative;
        }

        /* Margin shading mechanism */
        .canvas-guide-overlay {
          display: flex;
          width: 100%;
          min-height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }

        .canvas-content-area {
          flex: 1;
          height: 100%;
          border-left: 1px dashed rgba(24, 160, 251, 0.4);
          border-right: 1px dashed rgba(24, 160, 251, 0.4);
          position: relative;
          background-color: transparent;
          transition: flex 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .side-margin {
          background-color: var(--figma-margin-dim);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }

        /* Shading dimensions mapping */
        .canvas-guide-overlay.g-100 .side-margin {
          width: 0%;
        }
        .canvas-guide-overlay.g-100 .canvas-content-area {
          flex: 0 0 100%;
        }

        .canvas-guide-overlay.g-80 .side-margin {
          width: 10%;
        }
        .canvas-guide-overlay.g-80 .canvas-content-area {
          flex: 0 0 80%;
        }

        .canvas-guide-overlay.g-60 .side-margin {
          width: 20%;
        }
        .canvas-guide-overlay.g-60 .canvas-content-area {
          flex: 0 0 60%;
        }

        .properties-panel {
          width: 240px;
          background-color: var(--figma-panel);
          border-left: 1px solid var(--figma-border);
        }

        .editor-statusbar {
          height: 25px;
          background-color: var(--figma-bg);
          border-top: 1px solid var(--figma-border);
          padding: 0 12px;
          font-size: 11px;
          color: var(--figma-text-muted);
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot.online {
          background-color: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .text-muted {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};
