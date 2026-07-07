import React, { useState } from 'react';
import { Section, EditorElement, GuidelineWidth, ElementType, Page, ThemeSettings } from '../types';
import { LayoutGrid, Type, Image as ImageIcon, Link, Plus, FileOutput, HelpCircle, Terminal, X, Sliders, Columns } from 'lucide-react';
import { CanvasGrid } from './CanvasGrid';
import { SidebarProperty } from './SidebarProperty';

interface EditorContainerProps {
  guideline: GuidelineWidth;
  setGuideline: (width: GuidelineWidth) => void;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  activeElement: { sectionId: string; elementId: string } | null;
  setActiveElement: (val: { sectionId: string; elementId: string } | null) => void;
  activeSectionId: string | null;
  setActiveSectionId: (val: string | null) => void;
  onExport: () => void;
  isCodeViewerOpen: boolean;
  setIsCodeViewerOpen: (val: boolean) => void;
  isStyleViewerOpen: boolean;
  setIsStyleViewerOpen: (val: boolean) => void;

  // Multi-page & Theme features
  pages: Page[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  activePageId: string;
  setActivePageId: (id: string) => void;
  activeTemplate: 'business' | 'modern';
  onTemplateChange: (templateKey: 'business' | 'modern') => void;
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  onAddPage: (name: string, rawFileName: string) => boolean;
}

export const EditorContainer: React.FC<EditorContainerProps> = ({
  guideline,
  setGuideline,
  sections,
  setSections,
  activeElement,
  setActiveElement,
  activeSectionId,
  setActiveSectionId,
  onExport,
  isCodeViewerOpen,
  setIsCodeViewerOpen,
  isStyleViewerOpen,
  setIsStyleViewerOpen,

  pages,
  setPages,
  activePageId,
  setActivePageId,
  activeTemplate,
  onTemplateChange,
  themeSettings,
  setThemeSettings,
  onAddPage,
}) => {
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageFileName, setNewPageFileName] = useState('');

  // Adds a new element below the existing elements in the active/first section
  const addElement = (type: ElementType) => {
    if (sections.length === 0) return;
    
    // Choose section: use activeElement's section, activeSectionId, or default to first section
    const targetSectionId = activeElement?.sectionId || activeSectionId || sections[0].id;
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
      color: type === 'title' ? 'var(--theme-primary)' : 'var(--theme-text)',
      fontSize: type === 'title' ? '24px' : (type === 'button' ? '14px' : '14px'),
      fontFamily: themeSettings.fontFamily,
      align: 'center',
      fontPresetId: type === 'title' ? 'title-1' : (type === 'text' ? 'body-1' : (type === 'button' ? 'button' : undefined))
    };

    if (type === 'image') {
      newElement.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800';
      newElement.borderRadius = 8;
      newElement.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }

    if (type === 'button') {
      newElement.btnBgColor = 'var(--theme-primary)';
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

  // Adds a 3-column text box layout (3 titles + 3 body text boxes side by side)
  const addThreeColumnTextBox = () => {
    if (sections.length === 0) return;
    
    const targetSectionId = activeElement?.sectionId || activeSectionId || sections[0].id;
    const targetSection = sections.find(s => s.id === targetSectionId) || sections[0];
    
    let maxGridY = 0;
    targetSection.elements.forEach(el => {
      maxGridY = Math.max(maxGridY, el.gridY + el.gridH);
    });

    const timestamp = Date.now();
    
    const newElement: EditorElement = {
      id: `el_${timestamp}`,
      type: 'three-column',
      gridX: 0,
      gridW: 12,
      gridY: maxGridY,
      gridH: 4,
      content: '',
      color: 'var(--theme-text)',
      fontSize: '14px',
      fontFamily: themeSettings.fontFamily,
      align: 'center',
      
      col1Title: '첫 번째 타이틀',
      col1Text: '첫 번째 열의 본문 내용을 입력하세요. 여기에 상세한 설명을 적을 수 있습니다.',
      col1Icon: 'home',
      
      col2Title: '두 번째 타이틀',
      col2Text: '두 번째 열의 본문 내용을 입력하세요. 여기에 상세한 설명을 적을 수 있습니다.',
      col2Icon: 'mail',
      
      col3Title: '세 번째 타이틀',
      col3Text: '세 번째 열의 본문 내용을 입력하세요. 여기에 상세한 설명을 적을 수 있습니다.',
      col3Icon: 'phone',

      colTitleColor: 'var(--theme-primary)',
      colTitleSize: '18px',
      colTextColor: 'var(--theme-text)',
      colTextSize: '14px',
      colIconColor: 'var(--theme-primary)',
      colShowIconBg: true,
      colIconBgColor: 'rgba(24, 160, 251, 0.1)',
      colTitlePresetId: 'title-3',
      colTextPresetId: 'body-2',
      colGap: 24,
      colContentGap: 8,
    };

    setSections(prev =>
      prev.map(s => {
        if (s.id !== targetSection.id) return s;
        return {
          ...s,
          elements: [...s.elements, newElement],
        };
      })
    );

    // Set the new three-column element as active
    setActiveElement({ sectionId: targetSection.id, elementId: newElement.id });
  };

  // Delete Page Action
  const handleDeletePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid switching page when clicking delete icon
    if (pageId === 'main') {
      alert('메인 페이지는 삭제할 수 없습니다.');
      return;
    }
    if (window.confirm('이 페이지를 정말 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.')) {
      if (activePageId === pageId) {
        setActivePageId('main');
      }
      setPages(prev => prev.filter(p => p.id !== pageId));
    }
  };

  // Submit new page form
  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || !newPageFileName.trim()) {
      alert('모든 입력 값을 채워주세요.');
      return;
    }

    const success = onAddPage(newPageName, newPageFileName);
    if (success) {
      setIsAddPageModalOpen(false);
      setNewPageName('');
      setNewPageFileName('');
    }
  };

  return (
    <div className="editor-shell flex flex-col h-full">
      {/* DOUBLE-ROW TOOLBAR */}
      
      {/* Row 1: Logo, Presets, Styles, Guidelines & Actions */}
      <div className="editor-toolbar flex items-center justify-between">
        <div className="toolbar-left flex items-center gap-3">
          <div className="app-logo flex items-center">
            <LayoutGrid size={18} className="logo-icon" />
            <span className="app-title">GRID.design</span>
          </div>
          <div className="divider"></div>

          {/* Template presets */}
          <div className="tool-group flex items-center">
            <span className="group-label">템플릿 프리셋:</span>
            <select
              className="template-select"
              value={activeTemplate}
              onChange={(e) => onTemplateChange(e.target.value as 'business' | 'modern')}
            >
              <option value="business">비즈니스형 (Corporate)</option>
              <option value="modern">모던 브랜딩형 (Branding Agency)</option>
            </select>
          </div>

          <div className="divider"></div>

          {/* Style Guide Color Palette adjustments */}
          <div className="tool-group flex items-center gap-2">
            <span className="group-label">스타일 가이드:</span>
            <div className="theme-color-input flex items-center gap-1.5" title="주조색 (Primary Color)">
              <span className="color-label-tag">주조색</span>
              <input
                type="color"
                value={themeSettings.primaryColor}
                onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
              />
              <span className="color-code-tag">{themeSettings.primaryColor.toUpperCase()}</span>
            </div>
            <div className="theme-color-input flex items-center gap-1.5" title="보조색 (Secondary Color)">
              <span className="color-label-tag">보조색</span>
              <input
                type="color"
                value={themeSettings.secondaryColor}
                onChange={(e) => setThemeSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
              />
              <span className="color-code-tag">{themeSettings.secondaryColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="toolbar-right flex items-center gap-2">
          {/* Guideline Width controls */}
          <div className="tool-group flex items-center mr-2">
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

          <div className="divider m-0"></div>

          <button className={`toggle-code-action-btn flex items-center gap-1 ${isCodeViewerOpen ? 'active' : ''}`} onClick={() => setIsCodeViewerOpen(!isCodeViewerOpen)} title={isCodeViewerOpen ? '코드 접기' : '코드 보기'}>
            <Terminal size={14} />
            <span>{isCodeViewerOpen ? '코드 접기' : '코드 보기'}</span>
          </button>
          
          <button className={`toggle-code-action-btn flex items-center gap-1 ${isStyleViewerOpen ? 'active' : ''}`} onClick={() => setIsStyleViewerOpen(!isStyleViewerOpen)} title="기본 디자인 프리셋 가이드 스타일 편집">
            <Sliders size={14} />
            <span>기본 스타일</span>
          </button>

          <button className="export-action-btn flex items-center gap-1" onClick={onExport}>
            <FileOutput size={15} />
            <span>내보내기</span>
          </button>
        </div>
      </div>

      {/* Row 2: Page Manager Tabs */}
      <div className="page-toolbar flex items-center justify-between">
        <div className="page-tabs flex items-center overflow-x-auto">
          {pages.map((p) => (
            <div
              key={p.id}
              className={`page-tab flex items-center gap-1.5 ${p.id === activePageId ? 'active' : ''}`}
              onClick={() => {
                setActivePageId(p.id);
                setActiveElement(null);
                setActiveSectionId(null);
              }}
            >
              <span className="tab-name">{p.name}</span>
              {p.id !== 'main' && (
                <button
                  className="tab-close-btn"
                  onClick={(e) => handleDeletePage(p.id, e)}
                  title="페이지 삭제"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          className="add-page-btn flex items-center gap-1"
          onClick={() => setIsAddPageModalOpen(true)}
          title="새로운 페이지 추가"
        >
          <Plus size={14} />
          <span>페이지 추가</span>
        </button>
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
            <button className="add-el-btn flex flex-col items-center" onClick={addThreeColumnTextBox}>
              <Columns size={20} />
              <span>3열 글상자</span>
            </button>
          </div>
          
          <div className="divider" style={{ margin: '14px 0', width: 'auto' }}></div>

          {/* Section controller inside left palette */}
          <div className="px-3 flex flex-col gap-2">
            <span className="group-label">섹션 관리</span>
            <button className="icon-tool-btn w-full justify-center" onClick={() => {
              const newSection: Section = {
                id: `s_${Date.now()}`,
                height: 350,
                backgroundColor: '#ffffff',
                elements: [],
              };
              setSections(prev => [...prev, newSection]);
            }} title="새 섹션 추가">
              <Plus size={16} />
              <span>새 섹션 추가</span>
            </button>
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className="canvas-wrapper flex-1 overflow-auto">
          <CanvasGrid
            guideline={guideline}
            sections={sections}
            setSections={setSections}
            activeElement={activeElement}
            setActiveElement={setActiveElement}
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
          />
        </div>

        {/* Right Properties Panel */}
        <SidebarProperty
          activeElement={activeElement}
          activeSectionId={activeSectionId}
          sections={sections}
          setSections={setSections}
          setActiveElement={setActiveElement}
          setActiveSectionId={setActiveSectionId}
          themeSettings={themeSettings}
        />
      </div>

      {/* Bottom Figma-like Status Bar */}
      <div className="editor-statusbar flex items-center justify-between">
        <div className="status-item flex items-center gap-1">
          <span className="dot online"></span>
          <span>에디터 활성화됨 (템플릿: {activeTemplate === 'business' ? '비즈니스' : '모던 브랜딩'})</span>
        </div>
        <div className="status-item flex items-center gap-1 text-muted">
          <HelpCircle size={12} />
          <span>도움말: 빈 배경 클릭 시 섹션 선택 / 요소 클릭 시 스타일 제어</span>
        </div>
      </div>

      {/* PAGE CREATION MODAL */}
      {isAddPageModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>새로운 페이지 추가</h3>
              <button className="close-modal-btn" onClick={() => setIsAddPageModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePage} className="modal-form">
              <div className="input-block">
                <label className="input-label">페이지 제목 (메뉴 표시용 한글명)</label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="예: 회사 소개, 제품 안내"
                  required
                />
              </div>

              <div className="input-block">
                <label className="input-label">영문 파일명 (웹 브라우저 HTML 주소)</label>
                <input
                  type="text"
                  value={newPageFileName}
                  onChange={(e) => setNewPageFileName(e.target.value)}
                  placeholder="예: introduce, products"
                  pattern="^[a-zA-Z0-9.-]+$"
                  title="영문 소문자, 숫자, 하이픈(-)만 가능합니다."
                  required
                />
                <span className="text-[10px]" style={{ opacity: 0.7, color: 'var(--figma-text-muted)', marginTop: '2px', display: 'block' }}>
                  * 입력하신 파일명 뒤에 자동으로 .html 확장자가 붙습니다.
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsAddPageModalOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                >
                  페이지 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      <style>{`
        .editor-shell {
          background-color: var(--figma-canvas);
          color: var(--figma-text);
          user-select: none;
        }

        .editor-toolbar {
          height: 48px;
          background-color: var(--figma-bg);
          border-bottom: 1px solid var(--figma-border);
          padding: 0 16px;
        }

        /* Row 2 toolbar styles */
        .page-toolbar {
          height: 38px;
          background-color: #1e2025; /* dark VSCode/Figma background */
          border-bottom: 1px solid var(--figma-border);
          padding: 0 16px;
          display: flex;
          align-items: center;
        }

        .page-tabs {
          display: flex;
          height: 100%;
          gap: 1px;
        }

        .page-tab {
          height: 100%;
          padding: 0 16px;
          background-color: #16171a; /* darker inactive tabs */
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.55);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-tab:hover {
          background-color: #1a1b1f;
          color: #ffffff;
        }

        .page-tab.active {
          background-color: #1e2025; /* matches bar background */
          color: #ffffff; /* pure white text - fully visible! */
          border-bottom: 2px solid var(--figma-accent);
          font-weight: 600;
        }

        .tab-close-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tab-close-btn:hover {
          background-color: rgba(255, 0, 0, 0.2);
          color: #ffffff;
        }

        .add-page-btn {
          background-color: var(--figma-accent);
          border: none;
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-page-btn:hover {
          background-color: var(--figma-accent-hover);
        }

        /* Preset select and Styles */
        .template-select {
          background: var(--figma-bg);
          border: 1px solid var(--figma-border);
          color: var(--figma-text);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          outline: none;
          cursor: pointer;
        }

        .theme-color-input {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--figma-border);
          padding: 2px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .color-label-tag {
          font-size: 9.5px;
          color: var(--figma-text-muted);
          font-weight: 600;
        }

        .color-code-tag {
          font-size: 9.5px;
          font-family: monospace;
          color: var(--figma-text);
          width: 50px;
          text-align: right;
        }

        .theme-color-input input[type="color"] {
          border: none;
          background: transparent;
          width: 14px;
          height: 14px;
          padding: 0;
          cursor: pointer;
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
          color: var(--figma-text-muted);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tool-btn:first-of-type {
          border-radius: 4px 0 0 4px;
        }

        .tool-btn:last-of-type {
          border-radius: 0 4px 4px 0;
        }

        .tool-btn + .tool-btn {
          border-left: none;
        }

        .tool-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--figma-text);
        }

        .tool-btn.active {
          background-color: rgba(24, 160, 251, 0.1);
          color: var(--figma-accent);
          border-color: var(--figma-accent);
        }

        .icon-tool-btn {
          background: transparent;
          border: 1px solid var(--figma-border);
          color: var(--figma-text);
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .icon-tool-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: var(--figma-accent);
        }

        .toggle-code-action-btn {
          background: transparent;
          border: 1px solid var(--figma-border);
          color: var(--figma-text-muted);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-code-action-btn:hover {
          background: rgba(0, 0, 0, 0.02);
          border-color: var(--figma-accent);
        }

        .toggle-code-action-btn.active {
          background: rgba(24, 160, 251, 0.05);
          border-color: var(--figma-accent);
          color: var(--figma-accent);
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
          height: calc(100% - 48px - 38px - 25px); /* adjusted for double row */
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
          height: 100%;
          overflow-y: auto;
        }

        /* MODAL OVERLAY & CONTENT */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(3px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background-color: var(--figma-panel);
          border: 1px solid var(--figma-border);
          border-radius: 8px;
          padding: 24px;
          width: 380px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }

        .modal-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }

        .close-modal-btn {
          background: transparent;
          border: none;
          color: var(--figma-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
        }

        .close-modal-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .input-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-block input[type="text"] {
          width: 100%;
          background: var(--figma-bg);
          border: 1px solid var(--figma-border);
          color: var(--figma-text);
          padding: 8px 10px;
          border-radius: 4px;
          font-size: 12px;
          outline: none;
        }

        .input-block input[type="text"]:focus {
          border-color: var(--figma-accent);
        }

        .modal-cancel-btn {
          background-color: transparent;
          border: 1px solid var(--figma-border);
          color: var(--figma-text);
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .modal-cancel-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .modal-submit-btn {
          background-color: var(--figma-accent);
          border: none;
          color: white;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .modal-submit-btn:hover {
          background-color: var(--figma-accent-hover);
        }

        /* Bottom figma-like bar */
        .editor-statusbar {
          height: 25px;
          background-color: var(--figma-bg);
          border-top: 1px solid var(--figma-border);
          padding: 0 12px;
          font-size: 10px;
        }

        .status-item {
          display: flex;
          align-items: center;
          color: var(--figma-text);
        }

        .status-item.text-muted {
          color: var(--figma-text-muted);
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot.online {
          background-color: #0ad375;
          box-shadow: 0 0 6px #0ad375;
        }
      `}</style>
    </div>
  );
};
