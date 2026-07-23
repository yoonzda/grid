import React, { useRef, useState, useEffect } from 'react';
import { Section, EditorElement, GuidelineWidth, Page, ThemeSettings } from '../types';
import { ElementWrapper } from './ElementWrapper';
import { useGridSnap } from '../hooks/useGridSnap';
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
  activePageId?: string;
  onNavigatePage?: (id: string) => void;
  hoveredSectionId?: string | null;
  setHoveredSectionId?: (id: string | null) => void;
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
  activePageId,
  onNavigatePage,
  hoveredSectionId,
  setHoveredSectionId,
  themeSettings,
  hoveredGuidelineWidth,
  previewHeaderLayout: _previewHeaderLayout,
  previewFlexAlign,
  previewHeaderLogoFont,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDragContainerWidth, setActiveDragContainerWidth] = useState<number>(1200);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'section' | 'element'; sectionId: string; elementId?: string } | null>(null);

  // Close context menu on outside click or scroll or escape key
  useEffect(() => {
    const handleCloseContextMenu = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleCloseContextMenu);
    window.addEventListener('scroll', handleCloseContextMenu, true);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleCloseContextMenu);
      window.removeEventListener('scroll', handleCloseContextMenu, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Element ordering helper
  const handleMoveElement = (secId: string, elId: string, direction: 'up' | 'down') => {
    setSections(prev =>
      prev.map(sec => {
        if (sec.id !== secId) return sec;
        const elements = [...sec.elements];
        const idx = elements.findIndex(e => e.id === elId);
        if (idx === -1) return sec;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= elements.length) return sec;
        const temp = elements[idx];
        elements[idx] = elements[targetIdx];
        elements[targetIdx] = temp;
        return { ...sec, elements };
      })
    );
  };

  // Element deletion helper
  const handleDeleteElement = (secId: string, elId: string) => {
    setSections(prev =>
      prev.map(sec => {
        if (sec.id !== secId) return sec;
        return { ...sec, elements: sec.elements.filter(e => e.id !== elId) };
      })
    );
    if (activeElement?.elementId === elId) {
      setActiveElement(null);
    }
  };

  // Section ordering helper
  const handleMoveSection = (secId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const list = [...prev];
      const idx = list.findIndex(s => s.id === secId);
      if (idx === -1) return prev;
      
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      if (list[targetIdx].sharedType === 'header' || list[targetIdx].sharedType === 'footer') return prev;
      if (list[idx].sharedType === 'header' || list[idx].sharedType === 'footer') return prev;

      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return list;
    });
  };

  // Section deletion helper
  const handleDeleteSection = (secId: string) => {
    setSections(prev => prev.filter(s => s.id !== secId));
    if (activeSectionId === secId) {
      setActiveSectionId(null);
      setActiveElement(null);
    }
  };

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
      <div 
        className="header-logo-container" 
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveSectionId(sec.id);
          setActiveElement(null);
        }}
      >
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
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveSectionId(sec.id);
          setActiveElement(null);
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
      <div 
        className="header-btn-container" 
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveSectionId(sec.id);
          setActiveElement(null);
        }}
      >
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

  const renderFooterComponent = (sec: Section) => {
    const textFont = sec.footerTextFont || 'Inter';
    const fontStyle = getFontFamilyByFamilyName(textFont);
    const textColor = sec.footerTextColor || '#ffffff';
    const subTextColor = sec.footerSubTextColor || '#9ca3af';
    const paddingY = sec.footerPaddingY !== undefined ? sec.footerPaddingY : 36;
    const layout = sec.footerLayout || 'stacked-center';

    const company = sec.footerCompany || '(주) 코퍼레이트 글로벌  |  CORPORATE Inc.';
    const address = sec.footerAddress || '대표이사: 홍길동  |  사업자등록번호: 123-45-67890  |  주소: 서울특별시 강남구 테헤란로 501  |  고객센터: 1588-0000';
    const links = sec.footerLinksText || '이용약관   |   개인정보처리방침   |   사업자정보확인   |   고객센터';
    const copyright = sec.footerCopyright || '© 2026 Corporate Inc. All rights reserved.';

    if (layout === 'split-between') {
      return (
        <div
          className="footer-flex-wrapper split-between"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '32px',
            width: '100%',
            margin: '0 auto',
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
            fontFamily: fontStyle,
            boxSizing: 'border-box',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '60%' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: textColor, letterSpacing: '-0.2px' }}>
              {company}
            </div>
            <div style={{ fontSize: '12px', color: subTextColor, lineHeight: 1.6 }}>
              {address}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>
              {links}
            </div>
            <div style={{ fontSize: '12px', color: subTextColor }}>
              {copyright}
            </div>
          </div>
        </div>
      );
    }

    if (layout === 'simple-center') {
      return (
        <div
          className="footer-flex-wrapper simple-center"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            margin: '0 auto',
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
            textAlign: 'center',
            fontFamily: fontStyle,
            boxSizing: 'border-box',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>
            {links}
          </div>
          <div style={{ fontSize: '12px', color: subTextColor }}>
            {copyright}
          </div>
        </div>
      );
    }

    // Default: 'stacked-center'
    return (
      <div
        className="footer-flex-wrapper stacked-center"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          margin: '0 auto',
          paddingTop: `${paddingY}px`,
          paddingBottom: `${paddingY}px`,
          textAlign: 'center',
          fontFamily: fontStyle,
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 700, color: textColor, letterSpacing: '-0.2px' }}>
          {company}
        </div>
        <div style={{ fontSize: '12px', color: subTextColor, lineHeight: 1.6, maxWidth: '850px' }}>
          {address}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', fontWeight: 600, color: textColor, marginTop: '4px' }}>
          {links}
        </div>
        <div style={{ fontSize: '12px', color: subTextColor, marginTop: '2px' }}>
          {copyright}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="canvas-grid-root" 
      ref={containerRef}
      onClick={() => {
        setActiveSectionId(null);
        setActiveElement(null);
        setHoveredSectionId?.(null);
      }}
    >
      <div 
        className="canvas-paper-artboard"
        style={{
          width: '100%',
          minWidth: '1024px',
          height: 'fit-content',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          borderRadius: '0px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Render SiteMap Page View if active page is sitemap */}
        {activePageId === 'sitemap' ? (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '650px', backgroundColor: '#ffffff' }}>
            {/* Header section if header exists */}
            {sections.find(s => s.sharedType === 'header') && (
              <div style={{ backgroundColor: sections.find(s => s.sharedType === 'header')?.backgroundColor || 'var(--theme-primary)' }}>
                {renderHeaderComponent(sections.find(s => s.sharedType === 'header')!)}
              </div>
            )}

            {/* SiteMap Body Container */}
            <div style={{ padding: '60px 48px', flex: 1, maxWidth: '960px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ borderBottom: '2px solid var(--theme-primary, #1e3a8a)', paddingBottom: '18px', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                  사이트맵 (Site Map)
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', margin: 0 }}>
                  현재 프로젝트에 등록되어 있는 전체 페이지 목록입니다. 이동하고 싶은 페이지를 클릭하세요.
                </p>
              </div>

              {/* Dynamic Pages Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
                {(pages || []).filter(p => p.id !== 'sitemap').map((p, pIdx) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigatePage?.(p.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '24px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    }}
                    className="sitemap-page-card"
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                          PAGE {String(pIdx + 1).padStart(2, '0')}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {p.fileName}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                        {p.name}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                        {p.id === 'main' ? '기본 메인 랜딩 페이지' : `${p.name} 페이지`}
                      </p>
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0284c7', fontSize: '13px', fontWeight: 600 }}>
                      <span>해당 페이지로 이동</span>
                      <span style={{ fontSize: '16px' }}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer section if footer exists */}
            {sections.find(s => s.sharedType === 'footer') && (
              <div style={{ backgroundColor: sections.find(s => s.sharedType === 'footer')?.backgroundColor || '#111827' }}>
                <div style={{ padding: '24px 0', color: '#9ca3af', fontSize: '12px', textAlign: 'center' }}>
                  © 2026 Site Map | {pages?.find(p => p.id === 'main')?.name || 'Web Builder'}
                </div>
              </div>
            )}

            <style>{`
              .sitemap-page-card:hover {
                background-color: #ffffff !important;
                border-color: #0284c7 !important;
                box-shadow: 0 8px 20px rgba(2, 132, 199, 0.12) !important;
                transform: translateY(-2px);
              }
            `}</style>
          </div>
        ) : (
          sections.map((sec) => {
        const isDraggingInThisSection = dragState?.sectionId === sec.id;
        const isSelected = activeSectionId === sec.id;
        const isHoveringGuideline = isSelected && hoveredGuidelineWidth !== null && hoveredGuidelineWidth !== undefined;
        const gWidth = isHoveringGuideline ? hoveredGuidelineWidth : (sec.guidelineWidth || '80%');

        const isHoveredFromList = hoveredSectionId === sec.id;
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
              minHeight: (sec.sharedType === 'header' || sec.sharedType === 'footer' || sec.heightMode === 'auto') ? 'auto' : `${sec.height}${sec.heightUnit || 'px'}`,
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
              transition: 'opacity 0.2s ease, filter 0.2s ease, box-shadow 0.15s ease',
              boxShadow: isFocused 
                ? `inset 0 0 0 2.5px ${rawThemeAccent}` 
                : 'none',
              position: 'relative',
              zIndex: isFocused ? 20 : 1,
            } as React.CSSProperties}
            onClick={(e) => {
              e.stopPropagation();
              setHoveredSectionId?.(null);
              setActiveSectionId(sec.id);
              setActiveElement(null);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHoveredSectionId?.(null);
              setActiveSectionId(sec.id);
              setActiveElement(null);
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                type: 'section',
                sectionId: sec.id,
              });
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
              style={(sec.sharedType === 'header' || sec.sharedType === 'footer') ? { 
                width: getContentPercent(gWidth), 
                height: 'auto',
                minHeight: 'auto',
                paddingTop: sec.sharedType === 'header' ? `${sec.headerPaddingY ?? 16}px` : 0,
                paddingBottom: sec.sharedType === 'header' ? `${sec.headerPaddingY ?? 16}px` : 0,
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
                style={(sec.sharedType === 'header' || sec.sharedType === 'footer') ? { 
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
                ) : sec.sharedType === 'footer' ? (
                  renderFooterComponent(sec)
                ) : (
                  sec.elements.map(el => (
                    <ElementWrapper
                      key={el.id}
                      element={el}
                      sectionId={sec.id}
                      parentLayoutMode={(sec.layoutMode as 'grid' | 'flex') || 'grid'}
                      isActive={activeElement?.elementId === el.id}
                      onClick={() => {
                        setHoveredSectionId?.(null);
                        setActiveElement({ sectionId: sec.id, elementId: el.id });
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setHoveredSectionId?.(null);
                        setActiveElement({ sectionId: sec.id, elementId: el.id });
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          type: 'element',
                          sectionId: sec.id,
                          elementId: el.id,
                        });
                      }}
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
      })
      )}
      </div>

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
          min-width: calc(1024px + 56px);
          min-height: 100%;
          position: relative;
          padding: 32px 28px;
          box-sizing: border-box;
          cursor: default;
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
      {/* Floating Canvas Right-Click Context Menu Layer */}
      {contextMenu && (() => {
        const targetSection = sections.find(s => s.id === contextMenu.sectionId);
        if (!targetSection) return null;

        const targetElement = contextMenu.elementId 
          ? targetSection.elements.find(e => e.id === contextMenu.elementId)
          : null;

        const menuWidth = 140;
        const menuHeight = 130;

        const posX = Math.min(contextMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - menuWidth - 10);
        const posY = Math.min(contextMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - menuHeight - 10);

        return (
          <div
            className="canvas-context-menu-layer"
            style={{
              position: 'fixed',
              top: `${posY}px`,
              left: `${posX}px`,
              zIndex: 99999,
              width: `${menuWidth}px`,
              backgroundColor: '#ffffff',
              borderRadius: '0px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
              padding: '0px',
              fontFamily: 'Inter, Pretendard, sans-serif',
              userSelect: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.type === 'element' && targetElement ? (
              <>
                <button
                  type="button"
                  className="context-menu-item"
                  onClick={() => {
                    handleMoveElement(contextMenu.sectionId, targetElement.id, 'up');
                    setContextMenu(null);
                  }}
                >
                  위로 이동
                </button>

                <button
                  type="button"
                  className="context-menu-item"
                  onClick={() => {
                    handleMoveElement(contextMenu.sectionId, targetElement.id, 'down');
                    setContextMenu(null);
                  }}
                >
                  아래로 이동
                </button>

                <button
                  type="button"
                  className="context-menu-item danger"
                  onClick={() => {
                    handleDeleteElement(contextMenu.sectionId, targetElement.id);
                    setContextMenu(null);
                  }}
                >
                  삭제하기
                </button>
              </>
            ) : (
              <>
                {targetSection.sharedType !== 'header' && targetSection.sharedType !== 'footer' ? (
                  <>
                    <button
                      type="button"
                      className="context-menu-item"
                      onClick={() => {
                        handleMoveSection(contextMenu.sectionId, 'up');
                        setContextMenu(null);
                      }}
                    >
                      위로 이동
                    </button>

                    <button
                      type="button"
                      className="context-menu-item"
                      onClick={() => {
                        handleMoveSection(contextMenu.sectionId, 'down');
                        setContextMenu(null);
                      }}
                    >
                      아래로 이동
                    </button>

                    <button
                      type="button"
                      className="context-menu-item danger"
                      onClick={() => {
                        handleDeleteSection(contextMenu.sectionId);
                        setContextMenu(null);
                      }}
                    >
                      삭제하기
                    </button>
                  </>
                ) : (
                  <div style={{ padding: '10px 16px', fontSize: '14px', color: '#94a3b8' }}>
                    공통 컴포넌트
                  </div>
                )}
              </>
            )}

            <style>{`
              .context-menu-item {
                width: 100%;
                display: block;
                padding: 10px 16px;
                border: none;
                border-bottom: 1px solid #f1f5f9;
                background: #ffffff;
                color: #0f172a;
                font-size: 14px;
                font-weight: 600;
                border-radius: 0px;
                cursor: pointer;
                transition: background 0.1s ease, color 0.1s ease;
                text-align: left;
                box-sizing: border-box;
              }
              .context-menu-item:last-child {
                border-bottom: none;
              }
              .context-menu-item:hover {
                background-color: #f1f5f9;
                color: #0284c7;
              }
              .context-menu-item.danger {
                color: #dc2626;
              }
              .context-menu-item.danger:hover {
                background-color: #fef2f2;
                color: #b91c1c;
              }
            `}</style>
          </div>
        );
      })()}
    </div>
  );
};
