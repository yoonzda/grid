import React, { useRef, useState, useEffect } from 'react';
import { Section, EditorElement, GuidelineWidth, Page, ThemeSettings } from '../types';
import { ElementWrapper } from './ElementWrapper';
import { useGridSnap } from '../hooks/useGridSnap';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { getFontFamilyByFamilyName } from '../utils/fontManager';

interface CanvasGridProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  activeElement: { sectionId: string; elementId: string } | null;
  setActiveElement: (val: { sectionId: string; elementId: string } | null) => void;
  activeSectionId: string | null;
  setActiveSectionId: (val: string | null) => void;
  activePaddingGuide: { sectionId: string; type: 'top' | 'bottom' | 'both' } | null;
  pages?: Page[];
  onNavigatePage?: (id: string) => void;
  hoveredSectionId?: string | null;
  themeSettings?: ThemeSettings;
  hoveredGuidelineWidth?: GuidelineWidth | null;
  previewHeaderLayout?: string | null;
  previewFlexAlign?: string | null;
  previewHeaderLogoFont?: string | null;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  sections,
  setSections,
  activeElement,
  setActiveElement,
  activeSectionId,
  setActiveSectionId,
  activePaddingGuide,
  pages,
  onNavigatePage,
  hoveredSectionId,
  themeSettings,
  hoveredGuidelineWidth,
  previewHeaderLayout,
  previewFlexAlign,
  previewHeaderLogoFont,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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

  const getMarginPercent = (gWidth: GuidelineWidth) => {
    if (gWidth === '80%') return '10%';
    if (gWidth === '60%') return '20%';
    return '0%';
  };

  const getContentPercent = (gWidth: GuidelineWidth) => {
    if (gWidth === '80%') return '80%';
    if (gWidth === '60%') return '60%';
    return '100%';
  };

  const renderHeaderComponent = (sec: Section) => {
    const isSelectedHeader = activeSectionId === sec.id;
    const layout = sec.headerLayout || 'spread-center';
    
    const activeLogoFont = (isSelectedHeader && previewHeaderLogoFont) ? previewHeaderLogoFont : (sec.headerLogoFont || 'Inter');
    const logoStyle: React.CSSProperties = {
      color: sec.headerLogoColor || '#ffffff',
      fontSize: sec.headerLogoSize || '20px',
      fontWeight: 800,
      fontFamily: getFontFamilyByFamilyName(activeLogoFont),
      cursor: 'pointer',
      margin: 0,
      whiteSpace: 'nowrap',
    };

    const menuStyle: React.CSSProperties = {
      color: sec.headerMenuColor || '#cbd5e1',
      fontSize: sec.headerMenuSize || '13px',
      fontWeight: 500,
      fontFamily: sec.headerMenuFont || 'inherit',
      textDecoration: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    };

    const btnVariant = sec.headerBtnVariant || 'filled';
    const btnSize = sec.headerBtnSize || 'medium';
    
    let btnBgColor = sec.headerBtnBgColor || 'var(--theme-secondary)';
    let btnTextColor = sec.headerBtnTextColor || '#ffffff';
    let btnBorder = 'none';
    
    if (btnVariant === 'outlined') {
      btnBgColor = 'transparent';
      btnTextColor = sec.headerBtnBgColor || 'var(--theme-secondary)';
      btnBorder = `2px solid ${sec.headerBtnBgColor || 'var(--theme-secondary)'}`;
    } else if (btnVariant === 'ghost') {
      btnBgColor = 'transparent';
      btnTextColor = sec.headerBtnBgColor || 'var(--theme-secondary)';
      btnBorder = 'none';
    }
    
    let btnPad = '8px 16px';
    let btnFSize = '12px';
    if (btnSize === 'small') {
      btnPad = '5px 10px';
      btnFSize = '11px';
    } else if (btnSize === 'large') {
      btnPad = '12px 24px';
      btnFSize = '14px';
    }

    const btnStyle: React.CSSProperties = {
      backgroundColor: btnBgColor,
      color: btnTextColor,
      border: btnBorder,
      borderRadius: `${sec.headerBtnRadius ?? 4}px`,
      padding: btnPad,
      fontSize: btnFSize,
      fontFamily: sec.headerBtnFont || 'inherit',
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    };

    const logoNode = sec.headerShowLogo !== false && (
      <div className="header-logo-container" style={{ display: 'flex', alignItems: 'center' }}>
        {sec.headerLogoType === 'image' && sec.headerLogoImg ? (
          <img 
            src={sec.headerLogoImg} 
            alt={sec.headerLogoText || 'LOGO'} 
            style={{ width: `${sec.headerLogoWidth || 120}px`, height: 'auto', display: 'block' }}
          />
        ) : (
          <h1 style={logoStyle}>{sec.headerLogoText || 'CORPORATE'}</h1>
        )}
      </div>
    );

    const menuNode = sec.headerShowMenu !== false && (
      <nav 
        className="header-menu-container" 
        style={{ 
          display: 'flex', 
          gap: `${sec.headerMenuGap ?? 24}px`, 
          alignItems: 'center',
        }}
      >
        {(sec.headerMenuItems || []).map((item) => (
          <a 
            key={item.id} 
            href="#" 
            onClick={(e) => e.preventDefault()} 
            style={menuStyle}
            className="header-menu-link-preview"
          >
            {item.name}
          </a>
        ))}
      </nav>
    );

    const btnNode = sec.headerShowBtn !== false && (
      <div className="header-btn-container" style={{ display: 'flex', alignItems: 'center' }}>
        <button style={btnStyle}>{sec.headerBtnText || '시작하기'}</button>
      </div>
    );

    // 1. 'spread-center' Layout: Absolute horizontal center for navigation menu
    if (layout === 'spread-center') {
      return (
        <div 
          className="header-flex-wrapper spread-center"
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
          }}
        >
          <div className="header-left-col" style={{ display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
            {logoNode}
          </div>
          <div 
            className="header-center-col" 
            style={{ 
              position: 'absolute', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              pointerEvents: 'auto',
            }}
          >
            {menuNode}
          </div>
          <div className="header-right-col" style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            {btnNode}
          </div>
        </div>
      );
    }

    // 2. Standard flow alignment layouts ('spread-between', 'left', 'center', 'right', 'even-space')
    let justifyStyle = 'flex-start';
    if (layout === 'spread-between') justifyStyle = 'space-between';
    if (layout === 'right') justifyStyle = 'flex-end';
    if (layout === 'center') justifyStyle = 'center';
    if (layout === 'even-space') justifyStyle = 'space-around';

    return (
      <div 
        className="header-flex-wrapper standard-flow"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: justifyStyle,
          gap: (layout === 'even-space' || layout === 'spread-between') ? '0' : `${sec.headerGap ?? 40}px`,
          width: '100%',
          height: '100%',
          padding: '0',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        {logoNode}
        {menuNode}
        {btnNode}
      </div>
    );
  };

  return (
    <div className="canvas-grid-root" ref={containerRef}>
      {sections.map((sec, secIdx) => {
        const isDraggingInThisSection = dragState?.sectionId === sec.id;
        const isSelected = activeSectionId === sec.id || activeElement?.sectionId === sec.id;
        const isHoveringGuideline = isSelected && hoveredGuidelineWidth !== null && hoveredGuidelineWidth !== undefined;
        const gWidth = isHoveringGuideline ? hoveredGuidelineWidth : (sec.guidelineWidth || '80%');

        const isHoveredFromList = hoveredSectionId === sec.id;
        
        // Prioritize list hover preview: when hovering list item, focus ONLY the hovered section. Otherwise focus active selection.
        const isFocused = hoveredSectionId ? isHoveredFromList : isSelected;

        const hasSelection = activeSectionId !== null || activeElement !== null || hoveredSectionId !== null;
        const isDimmed = hasSelection && !isFocused;

        // Theme-adaptive primary accent color (e.g. #FF6B6B or #1E3A8A)
        const rawThemeAccent = themeSettings?.primaryColor || '#18a0fb';

        return (
          <div
            key={sec.id}
            id={`section-${sec.id}`}
            className={`canvas-section-node section-${sec.id} relative w-full ${isFocused ? 'active-section' : ''}`}
            style={{
              minHeight: sec.sharedType === 'header' ? 'auto' : sec.heightMode === 'auto' ? 'auto' : `${sec.height}${sec.heightUnit || 'px'}`,
              height: 'auto', // dynamic height flow
              backgroundColor: sec.backgroundColor,
              backgroundImage: sec.backgroundImage ? `url(${sec.backgroundImage})` : 'none',
              backgroundPosition: sec.backgroundPosition || 'center',
              backgroundSize: sec.backgroundSize || 'cover',
              backgroundRepeat: sec.backgroundRepeat || 'no-repeat',
              '--content-width': gWidth,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: sec.heightMode === 'auto'
                ? 'flex-start'
                : sec.verticalAlign === 'start'
                  ? 'flex-start'
                  : sec.verticalAlign === 'end'
                    ? 'flex-end'
                    : 'center',
              opacity: isDimmed ? 0.35 : 1,
              filter: isDimmed ? 'opacity(0.4)' : 'none',
              transition: 'opacity 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease',
              boxShadow: isFocused 
                ? `inset 0 0 0 2.5px ${rawThemeAccent}` 
                : 'none',
              position: 'relative',
              zIndex: isFocused ? 20 : 1,
            } as React.CSSProperties}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSectionId(sec.id);
              setActiveElement(null);
            }}
          >
            {/* 1. Left Dimmed Margin Shading Layer */}
            {gWidth !== '100%' && (
              <div className="side-margin-shading left" style={{ width: getMarginPercent(gWidth) }}>
                <div className="margin-border-line right-border"></div>
              </div>
            )}

            {/* Visual Guide Overlay for Guideline Width Hover Preview (Diagonal Hatched Pattern, No Side Borders) */}
            {isSelected && hoveredGuidelineWidth && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: getMarginPercent(hoveredGuidelineWidth),
                  width: getContentPercent(hoveredGuidelineWidth),
                  backgroundImage: 'repeating-linear-gradient(-45deg, rgba(2, 132, 199, 0.14), rgba(2, 132, 199, 0.14) 10px, rgba(2, 132, 199, 0.03) 10px, rgba(2, 132, 199, 0.03) 20px)',
                  border: 'none',
                  zIndex: 35,
                  pointerEvents: 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            )}

            {/* Visual Guide Overlay for Padding Top customization (Bound to section boundaries) */}
            {activePaddingGuide?.sectionId === sec.id && (activePaddingGuide.type === 'top' || activePaddingGuide.type === 'both') && (
              <div 
                className="padding-guide-overlay top-guide"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: getMarginPercent(gWidth),
                  right: getMarginPercent(gWidth),
                  height: sec.paddingTop !== undefined ? `${sec.paddingTop}px` : 'var(--theme-default-section-padding)',
                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                  borderBottom: '1px dashed #10b981',
                  zIndex: 30,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontFamily: 'sans-serif',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {sec.paddingTop !== undefined ? sec.paddingTop : (themeSettings?.defaultSectionPadding ?? 40)}px
                </span>
              </div>
            )}

            {/* Visual Guide Overlay for Padding Bottom customization (Bound to section boundaries) */}
            {activePaddingGuide?.sectionId === sec.id && (activePaddingGuide.type === 'bottom' || activePaddingGuide.type === 'both') && (
              <div 
                className="padding-guide-overlay bottom-guide"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: getMarginPercent(gWidth),
                  right: getMarginPercent(gWidth),
                  height: sec.paddingBottom !== undefined ? `${sec.paddingBottom}px` : 'var(--theme-default-section-padding)',
                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                  borderTop: '1px dashed #10b981',
                  zIndex: 30,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontFamily: 'sans-serif',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {sec.paddingBottom !== undefined ? sec.paddingBottom : (themeSettings?.defaultSectionPadding ?? 40)}px
                </span>
              </div>
            )}

            {/* 2. Centered Content Grid Container */}
            <div
              className="section-grid-container"
              style={sec.sharedType === 'header' ? { 
                width: getContentPercent(gWidth), 
                height: 'auto',
                minHeight: 'auto',
                paddingTop: `${sec.headerPaddingY ?? 16}px`,
                paddingBottom: `${sec.headerPaddingY ?? 16}px`,
              } : {
                width: getContentPercent(gWidth), 
                height: 'auto',
                minHeight: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {/* Grid column guidelines */}
              <div className="grid-guides-overlay">
                {renderGridCols()}
              </div>

              {/* Elements container utilizing real CSS Grid for placement layout */}
              <div 
                className="elements-box" 
                style={sec.sharedType === 'header' ? { 
                  display: 'block',
                  width: '100%', 
                  height: '100%', 
                  padding: 0,
                  gap: 0,
                  minHeight: '100%'
                } : sec.layoutMode === 'flex' ? (() => {
                  const activeAlign = (isSelected && previewFlexAlign) ? previewFlexAlign : (sec.flexAlign || 'center');
                  return {
                    display: 'flex',
                    flexDirection: sec.flexDirection === 'horizontal' ? 'row' : 'column',
                    gap: sec.flexGap !== undefined ? `${sec.flexGap}px` : 'var(--theme-default-flex-gap)',
                    alignItems: sec.flexDirection === 'horizontal' ? 'center' : 'stretch',
                    justifyContent: activeAlign === 'start' ? 'flex-start' : activeAlign === 'end' ? 'flex-end' : activeAlign === 'space-between' ? 'space-between' : 'center',
                    paddingTop: sec.paddingTop !== undefined ? `${sec.paddingTop}px` : 'var(--theme-default-section-padding)',
                    paddingBottom: sec.paddingBottom !== undefined ? `${sec.paddingBottom}px` : 'var(--theme-default-section-padding)',
                    height: 'auto',
                    minHeight: 'auto',
                    boxSizing: 'border-box',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                  };
                })() : { 
                  height: 'auto',
                  minHeight: 'auto',
                  paddingTop: sec.paddingTop !== undefined ? `${sec.paddingTop}px` : 'var(--theme-default-section-padding)',
                  paddingBottom: sec.paddingBottom !== undefined ? `${sec.paddingBottom}px` : 'var(--theme-default-section-padding)',
                  boxSizing: 'border-box',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {sec.sharedType === 'header' ? (
                  renderHeaderComponent(sec)
                ) : (
                  sec.elements.map(el => (
                    <ElementWrapper
                      key={el.id}
                      element={el}
                      sectionId={sec.id}
                      parentLayoutMode={sec.layoutMode || 'grid'}
                      isActive={activeElement?.elementId === el.id}
                      onClick={() => setActiveElement({ sectionId: sec.id, elementId: el.id })}
                      onDragStart={sec.layoutMode === 'flex' ? undefined : onElementDragStart}
                      onResizeStart={sec.layoutMode === 'flex' ? undefined : onElementResizeStart}
                      onTextChange={handleTextChange}
                      pages={pages}
                      onNavigatePage={onNavigatePage}
                    />
                  ))
                )}
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
            {gWidth !== '100%' && (
              <div className="side-margin-shading right" style={{ width: getMarginPercent(gWidth) }}>
                <div className="margin-border-line left-border"></div>
              </div>
            )}

            {/* Section Height Resize Handle (Bottom border drag) */}
            <div
              className="section-resize-handle"
              onMouseDown={(e) => handleSectionResizeStart(e, sec.id, sec.height)}
              title="섹션 높이 조절"
            >
              <div className="resize-indicator"></div>
            </div>
          </div>
        );
      })}

      <style>{`
        /* Structured Header Component Styles */
        .header-flex-wrapper {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
          min-height: auto;
          padding: 0;
          box-sizing: border-box;
          pointer-events: auto;
        }
        
        .header-flex-wrapper.spread-center {
          justify-content: space-between;
        }

        .header-left-col {
          flex: 1;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .header-center-col {
          flex: 2;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .header-right-col {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .header-menu-link-preview {
          transition: opacity 0.2s;
        }

        .header-menu-link-preview:hover {
          opacity: 0.8;
        }

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
          transition: background-color 0.2s, box-shadow 0.2s;
        }

        .canvas-section-node.active-section {
          box-shadow: inset 0 0 0 2px var(--figma-accent);
          z-index: 6;
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
          background-color: transparent; /* No side shading overlay to ensure backgrounds stretch 100% */
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
          border-left: 1.5px dashed rgba(24, 160, 251, 0.8); /* Clean dashed boundary guidelines */
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
          padding: 40px 0;
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
          padding: 0;
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
