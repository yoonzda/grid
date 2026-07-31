import React, { useRef, useState, useEffect } from 'react';
import { Section, EditorElement, GuidelineWidth, Page, ThemeSettings } from '../types';
import { ElementWrapper } from './ElementWrapper';
import { useGridSnap } from '../hooks/useGridSnap';
import { getFontFamilyByFamilyName } from '../utils/fontManager';

export const extractYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

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
  previewHeaderState?: 'top' | 'scrolled' | null;
  previewFlexAlign?: string | null;
  previewHeaderLogoFont?: string | null;
}

export const getMarginPercent = (gWidth?: GuidelineWidth) => {
  if (gWidth === '80%') return '10%';
  if (gWidth === '60%') return '20%';
  return '0%';
};

export const getContentPercent = (gWidth?: GuidelineWidth) => {
  if (gWidth === '80%') return '80%';
  if (gWidth === '60%') return '60%';
  return '100%';
};

const MainSlideSectionNode: React.FC<{ 
  sec: Section; 
  onNavigatePage?: (id: string) => void;
  onUpdateSection?: (secId: string, updates: Partial<Section>) => void;
  activeElement?: { sectionId: string; elementId: string } | null;
  setActiveElement?: (val: { sectionId: string; elementId: string } | null) => void;
  activeSectionId?: string | null;
  setActiveSectionId?: (val: string | null) => void;
  setContextMenu?: (val: { x: number; y: number; type: 'section' | 'element'; sectionId: string; elementId?: string } | null) => void;
  themeSettings?: ThemeSettings;
}> = ({ sec, onNavigatePage: _onNavigatePage, onUpdateSection, activeElement, setActiveElement, activeSectionId: _activeSectionId, setActiveSectionId, setContextMenu, themeSettings }) => {
  const slides = sec.slideItems || [];
  const [internalSlideIndex, setInternalSlideIndex] = useState(0);

  const activeIdx = sec.activeSlideIndex !== undefined 
    ? (sec.activeSlideIndex % Math.max(1, slides.length)) 
    : (internalSlideIndex % Math.max(1, slides.length));

  const loop = sec.loop !== false;
  const enableDrag = sec.enableDrag !== false;

  const changeSlide = (newIdx: number) => {
    setInternalSlideIndex(newIdx);
    if (onUpdateSection) {
      onUpdateSection(sec.id, { activeSlideIndex: newIdx });
    }
  };

  const nextSlide = () => {
    if (!loop && activeIdx >= slides.length - 1) return;
    changeSlide((activeIdx + 1) % slides.length);
  };

  const prevSlide = () => {
    if (!loop && activeIdx <= 0) return;
    changeSlide((activeIdx - 1 + slides.length) % slides.length);
  };

  // Drag / Swipe handlers
  const dragStartX = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableDrag) return;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!enableDrag || dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
    dragStartX.current = null;
  };

  const activeSlide = slides[activeIdx] || {
    title: 'Experience Next-Gen Innovation',
    description: '미래형 디지털 기술과 생동감 넘치는 인터랙티브 미디어 환경을 경험하세요.',
    mediaType: 'video',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-41443-large.mp4',
    videoName: 'sample1_cyber.mp4',
    imageSrc: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1600&auto=format&fit=crop&q=80',
    btnText: '자세히 보기'
  };

  const effect = sec.slideEffectType || 'zoom';

  const cWidth = sec.contentWidth || (sec.guidelineWidth === '100%' ? '80%' : sec.guidelineWidth || '80%');
  const widthPct = getContentPercent(cWidth);

  const isAutoHeight = sec.heightMode === 'auto';
  const isDvhHeight = sec.heightUnit === 'dvh' || sec.heightUnit === 'vh';
  const computedHeight = isAutoHeight
    ? 'auto'
    : isDvhHeight
      ? (sec.height === 100 ? '100vh' : `${sec.height || 100}vh`)
      : `${sec.height || 680}px`;

  const computedMinHeight = isAutoHeight
    ? 'auto'
    : isDvhHeight
      ? (sec.height === 100 ? '100vh' : `${sec.height || 100}vh`)
      : `${sec.height || 680}px`;

  const [isContentHovered, setIsContentHovered] = useState(false);
  const isContentSelected = activeElement?.sectionId === sec.id && activeElement?.elementId === 'slide-content';

  const vertAlignStyle = sec.verticalAlign === 'start'
    ? 'flex-start'
    : sec.verticalAlign === 'end'
      ? 'flex-end'
      : 'center';

  const titleMarginVar = themeSettings?.spacingPresets?.find(sp => sp.id === sec.slideTitleMarginVarId);
  const titleMB = titleMarginVar ? titleMarginVar.value : (sec.slideTitleMarginBottom !== undefined ? sec.slideTitleMarginBottom : 16);

  const descMarginVar = themeSettings?.spacingPresets?.find(sp => sp.id === sec.slideDescMarginVarId);
  const descMB = descMarginVar ? descMarginVar.value : (sec.slideDescMarginBottom !== undefined ? sec.slideDescMarginBottom : 28);

  const currentMediaType = activeSlide.mediaType || 'image';
  const defaultOverlay = (currentMediaType === 'video' || currentMediaType === 'youtube') ? 45 : 0;
  const overlayOpacity = activeSlide.overlayOpacity !== undefined ? activeSlide.overlayOpacity : defaultOverlay;
  const brightnessVal = 1 - (overlayOpacity / 100);

  const renderBackgroundMedia = () => {
    if (currentMediaType === 'video' && (activeSlide.videoSrc || activeSlide.imageSrc)) {
      const vSrc = activeSlide.videoSrc || 'https://vjs.zencdn.net/v/oceans.mp4';
      return (
        <video
          key={vSrc + activeIdx}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: `brightness(${brightnessVal})`,
          }}
          src={vSrc}
        />
      );
    }

    if (currentMediaType === 'youtube') {
      const ytId = extractYouTubeId(activeSlide.youtubeUrl) || activeSlide.youtubeId || 'dQU4R_37R4s';
      return (
        <div
          key={ytId + activeIdx}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <iframe
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.77vh',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              border: 'none',
              filter: `brightness(${brightnessVal})`,
            }}
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
            allow="autoplay; encrypted-media"
            title="YouTube Background Video"
          />
        </div>
      );
    }

    return (
      <div 
        key={activeIdx}
        style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: `url(${activeSlide.imageSrc})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          filter: `brightness(${brightnessVal})`, 
          transition: effect === 'slide' ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease' : effect === 'zoom' ? 'transform 1.2s ease-out, opacity 0.6s ease' : 'opacity 0.6s ease',
          transform: effect === 'zoom' ? 'scale(1.06)' : 'scale(1)',
        }} 
      />
    );
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.main-slide-content-box')) return;
        setActiveSectionId?.(sec.id);
        setActiveElement?.(null);
      }}
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.main-slide-content-box')) return;
        e.preventDefault();
        e.stopPropagation();
        setActiveSectionId?.(sec.id);
        setActiveElement?.(null);
        setContextMenu?.({
          x: e.clientX,
          y: e.clientY,
          type: 'section',
          sectionId: sec.id,
        });
      }}
      style={{ position: 'relative', width: '100%', minHeight: computedMinHeight, height: computedHeight, overflow: 'hidden', color: '#ffffff', display: 'flex', alignItems: vertAlignStyle, justifyContent: 'center', boxSizing: 'border-box', paddingTop: sec.paddingTop !== undefined ? `${sec.paddingTop}px` : 'var(--theme-default-section-padding)', paddingBottom: sec.paddingBottom !== undefined ? `${sec.paddingBottom}px` : 'var(--theme-default-section-padding)', cursor: enableDrag ? 'grab' : 'default' }}
    >
      {renderBackgroundMedia()}

      {(() => {
        const activeAlign = sec.flexAlign || 'start';
        const textAlignVal: 'left' | 'center' | 'right' = activeAlign === 'center' ? 'center' : activeAlign === 'end' ? 'right' : 'left';
        const flexAlignItems = activeAlign === 'center' ? 'center' : activeAlign === 'end' ? 'flex-end' : 'flex-start';
        const descMargin = activeAlign === 'center' ? `0 auto ${descMB}px auto` : activeAlign === 'end' ? `0 0 ${descMB}px auto` : `0 0 ${descMB}px 0`;

        return (
          <div 
            className="main-slide-content-box"
            onMouseEnter={() => setIsContentHovered(true)}
            onMouseLeave={() => setIsContentHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              setActiveElement?.({ sectionId: sec.id, elementId: 'slide-content' });
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveElement?.({ sectionId: sec.id, elementId: 'slide-content' });
              setContextMenu?.({
                x: e.clientX,
                y: e.clientY,
                type: 'element',
                sectionId: sec.id,
                elementId: 'slide-content',
              });
            }}
            style={{ 
              position: 'relative', 
              zIndex: 50, 
              width: widthPct, 
              margin: '0 auto', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: flexAlignItems,
              textAlign: textAlignVal, 
              padding: '0px', 
              userSelect: 'none', 
              transition: 'all 0.2s ease', 
              boxSizing: 'border-box',
              borderRadius: '0px',
              border: isContentSelected ? '2.5px solid #0284c7' : isContentHovered ? '2px dashed #0284c7' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
            title="슬라이드 컨텐츠 수정"
          >
            <h1 
              style={{ width: '100%', textAlign: textAlignVal, fontSize: '48px', fontWeight: 800, margin: `0 0 ${titleMB}px 0`, letterSpacing: '-1px', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
            >
              {activeSlide.title}
            </h1>
            <p 
              style={{ width: '100%', textAlign: textAlignVal, fontSize: '18px', color: '#f1f5f9', margin: descMargin, lineHeight: 1.6, maxWidth: '640px', textShadow: '0 1px 5px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
            >
              {activeSlide.description}
            </p>
            {activeSlide.btnText && (
              <a
                href={activeSlide.linkUrl || '#'}
                style={{ display: 'inline-block', alignSelf: flexAlignItems, padding: '14px 32px', backgroundColor: 'var(--theme-primary, #1e3a8a)', color: '#ffffff', textDecoration: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', pointerEvents: 'none' }}
              >
                {activeSlide.btnText}
              </a>
            )}
          </div>
        );
      })()}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 15, background: 'rgba(0,0,0,0.45)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 15, background: 'rgba(0,0,0,0.45)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}
          >
            ›
          </button>
          <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 15, display: 'flex', gap: '8px' }}>
            {slides.map((_, idx) => (
              <div
                key={idx}
                onClick={(e) => { e.stopPropagation(); changeSlide(idx); }}
                style={{ width: idx === activeIdx ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: idx === activeIdx ? '#ffffff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s ease' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FeaturesGridSectionNode: React.FC<{ sec: Section; onNavigatePage?: (id: string) => void }> = ({ sec, onNavigatePage }) => {
  const items = sec.featureItems || [];
  return (
    <div style={{ padding: '40px 0', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
        {items.map((item, idx) => {
          const isEven = idx % 2 === 1;
          const textCol = (
            <div key="text" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px' }}>
              <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--theme-primary, #1e3a8a)', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: '0 0 24px 0' }}>
                {item.description}
              </p>
              {item.btnText && (
                <div>
                  <a
                    href={item.linkUrl || '#'}
                    onClick={(e) => {
                      if (item.linkType === 'page' && item.linkPageId && onNavigatePage) {
                        e.preventDefault();
                        onNavigatePage(item.linkPageId);
                      }
                    }}
                    style={{ fontSize: '14px', fontWeight: 700, color: 'var(--theme-primary, #1e3a8a)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {item.btnText}
                  </a>
                </div>
              )}
            </div>
          );

          const imgCol = (
            <div key="img" style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
              <img src={item.imageSrc} alt={item.title} style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }} />
            </div>
          );

          return (
            <div key={item.id || idx} className="feature-grid-row" style={{ display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
              {isEven ? [imgCol, textCol] : [textCol, imgCol]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PromoBannerSectionNode: React.FC<{ sec: Section; onNavigatePage?: (id: string) => void }> = ({ sec, onNavigatePage }) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '340px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: sec.backgroundImage ? `url(${sec.backgroundImage})` : 'none',
      backgroundAttachment: sec.backgroundAttachment || 'fixed',
      backgroundPosition: sec.backgroundPosition || 'center',
      backgroundSize: sec.backgroundSize || 'cover',
      backgroundRepeat: 'no-repeat',
      padding: '60px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(11, 25, 44, 0.75)', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', textAlign: 'center', color: '#ffffff' }}>
        {sec.sectionSubTitle && (
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#38bdf8', marginBottom: '12px', display: 'block' }}>
            {sec.sectionSubTitle}
          </span>
        )}
        <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 24px 0', lineHeight: 1.4, wordBreak: 'keep-all' }}>
          {sec.sectionTitle || '지속 가능한 성장과 함께하는 혁신, 우리는 미래를 준비합니다.'}
        </h2>
        {sec.ctaBtnText && (
          <a
            href={sec.ctaLinkUrl || '#'}
            onClick={(e) => {
              if (sec.ctaLinkType === 'page' && sec.ctaLinkPageId && onNavigatePage) {
                e.preventDefault();
                onNavigatePage(sec.ctaLinkPageId);
              }
            }}
            style={{ display: 'inline-block', padding: '12px 28px', border: '1.5px solid #ffffff', color: '#ffffff', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s ease' }}
          >
            {sec.ctaBtnText}
          </a>
        )}
      </div>
    </div>
  );
};

const CardSliderSectionNode: React.FC<{ sec: Section; onNavigatePage?: (id: string) => void }> = ({ sec, onNavigatePage }) => {
  const cards = sec.cardItems || [];
  const [startIndex, setStartIndex] = useState(0);

  const visibleCardsCount = 3;
  const totalCards = cards.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartIndex(prev => (prev - 1 + totalCards) % totalCards);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartIndex(prev => (prev + 1) % totalCards);
  };

  const visibleCards = [];
  for (let i = 0; i < Math.min(visibleCardsCount, totalCards); i++) {
    visibleCards.push(cards[(startIndex + i) % totalCards]);
  }

  return (
    <div style={{ padding: '40px 0', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            {sec.sectionSubTitle || 'Our Latest News'}
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--theme-primary, #1e3a8a)', marginTop: '8px' }} />
        </div>
        {totalCards > 3 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#475569' }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#475569' }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {visibleCards.map((card, idx) => (
          <div
            key={card.id || idx}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => {
              if (card.linkType === 'page' && card.linkPageId && onNavigatePage) {
                onNavigatePage(card.linkPageId);
              } else if (card.linkUrl && card.linkUrl !== '#') {
                window.open(card.linkUrl, card.linkTarget || '_self');
              }
            }}
          >
            <div style={{ height: '180px', overflow: 'hidden' }}>
              <img src={card.imageSrc} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0284c7', textTransform: 'uppercase', display: 'inline-block', marginBottom: '10px' }}>
                  {card.tag || 'NEWS'}
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                  {card.title}
                </h4>
                {card.description && (
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {card.description}
                  </p>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px' }}>
                {card.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  previewHeaderState,
  previewFlexAlign,
  previewHeaderLogoFont,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDragContainerWidth, setActiveDragContainerWidth] = useState<number>(1200);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'section' | 'element'; sectionId: string; elementId?: string } | null>(null);

  // Close context menu on left click (outside menu), scroll, or escape key
  useEffect(() => {
    if (!contextMenu) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        const menuLayer = document.querySelector('.canvas-context-menu-layer');
        if (menuLayer && menuLayer.contains(e.target as Node)) {
          return;
        }
        setContextMenu(null);
      }
    };

    const handleScroll = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

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
      fontSize: sec.headerMenuSize || '15px',
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
        <button style={btnStyle}>{sec.headerBtnText || '문의하기'}</button>
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
    const textColor = sec.footerTextColor || '#0f172a';
    const subTextColor = sec.footerSubTextColor || '#475569';
    const paddingY = sec.footerPaddingY !== undefined ? sec.footerPaddingY : 36;
    const layout = sec.footerLayout || 'left-corporate';

    const company = sec.footerCompany || '(주) 코퍼레이트';
    const rep = sec.footerRepresentative || '홍길동';
    const addr = sec.footerAddress || '서울특별시 강남구 테헤란로 501, 15층 (삼성동, 코퍼레이트타워)';
    const tel = sec.footerTel || '1588-0000';
    const bizNum = sec.footerBizNum || '123-45-67890';
    const linksStr = sec.footerLinksText || '개인정보처리방침   이용약관';
    const copyright = sec.footerCopyright || `Copyright © ${company || 'Corporate Inc.'}. All rights reserved.`;

    // Helper to render interactive page links for policy & terms
    const renderInteractiveLinks = () => {
      const linkItems = linksStr.split(/\s{2,}|\s*\|\s*/).filter(Boolean);
      if (linkItems.length === 0) return <span>{linksStr}</span>;

      return linkItems.map((item, idx) => {
        const trimmed = item.trim();
        const isPrivacy = trimmed.includes('개인정보');
        const isTerms = trimmed.includes('약관') || trimmed.includes('이용약관');
        const targetPageId = isPrivacy ? 'privacy' : isTerms ? 'terms' : undefined;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && <span style={{ opacity: 0.4, margin: '0 8px' }}>|</span>}
            <a
              href={isPrivacy ? 'privacy.html' : isTerms ? 'terms.html' : '#'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (targetPageId && onNavigatePage) {
                  onNavigatePage(targetPageId);
                }
              }}
              style={{
                color: textColor,
                textDecoration: 'none',
                fontWeight: isPrivacy || isTerms ? 700 : 600,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              title={targetPageId ? `'${trimmed}' 페이지로 이동` : undefined}
            >
              {trimmed}
            </a>
          </React.Fragment>
        );
      });
    };

    // Helper for business info row (Rep, Address, Tel, BizNum)
    const renderBizInfoRow = (align: 'left' | 'center' | 'right' = 'left') => (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          columnGap: '20px',
          rowGap: '6px',
          fontSize: '12px',
          color: subTextColor,
          lineHeight: 1.6,
        }}
      >
        {rep && (
          <span>
            <strong style={{ fontWeight: 700, color: textColor, marginRight: '6px' }}>대표자</strong>
            {rep}
          </span>
        )}
        {addr && (
          <span>
            <strong style={{ fontWeight: 700, color: textColor, marginRight: '6px' }}>주소</strong>
            {addr}
          </span>
        )}
        {tel && (
          <span>
            <strong style={{ fontWeight: 700, color: textColor, marginRight: '6px' }}>TEL</strong>
            {tel}
          </span>
        )}
        {bizNum && (
          <span>
            <strong style={{ fontWeight: 700, color: textColor, marginRight: '6px' }}>사업자번호</strong>
            {bizNum}
          </span>
        )}
      </div>
    );

    if (layout === 'left-corporate') {
      return (
        <div
          className="footer-flex-wrapper left-corporate"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            width: '100%',
            margin: '0 auto',
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
            textAlign: 'left',
            fontFamily: fontStyle,
            boxSizing: 'border-box',
            pointerEvents: 'auto',
          }}
        >
          {/* Row 1: Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: textColor }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {renderInteractiveLinks()}
            </div>
          </div>

          {/* Row 2: Rep, Address, Tel, BizNum */}
          {renderBizInfoRow('left')}

          {/* Row 3: Copyright */}
          <div style={{ fontSize: '12px', color: subTextColor, marginTop: '2px' }}>
            {copyright}
          </div>
        </div>
      );
    }

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
            {renderBizInfoRow('left')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>
              {renderInteractiveLinks()}
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
            {renderInteractiveLinks()}
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
        {renderBizInfoRow('center')}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', fontWeight: 600, color: textColor, marginTop: '4px' }}>
          {renderInteractiveLinks()}
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
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.canvas-section-node')) return;
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

        const isEditingThisHeader = activeSectionId === sec.id;
        const isHeaderComp = sec.sharedType === 'header';

        let isHeaderTransparent = false;
        if (isHeaderComp) {
          if (isEditingThisHeader && previewHeaderState) {
            isHeaderTransparent = previewHeaderState === 'top';
          } else {
            isHeaderTransparent = sec.headerTransparentAtTop !== false && activePageId === 'main';
          }
        }

        const headerNodeBgColor = isHeaderComp
          ? (isHeaderTransparent ? 'transparent' : (sec.headerScrollBgColor || sec.backgroundColor || 'var(--theme-primary, #1e3a8a)'))
          : sec.backgroundColor;

        const headerMarginBottom = (isHeaderComp && isHeaderTransparent) ? '-70px' : '0px';
        const headerZIndex = (isHeaderComp && isHeaderTransparent) ? 40 : (isFocused ? 20 : 1);

        return (
          <div
            key={sec.id}
            id={`section-${sec.id}`}
            className={`canvas-section-node section-${sec.id} relative w-full ${isFocused ? 'active-section' : ''}`}
            style={{
              minHeight: (sec.sharedType === 'header' || sec.sharedType === 'footer' || sec.heightMode === 'auto')
                ? 'auto'
                : (sec.heightUnit === 'dvh' || sec.heightUnit === 'vh')
                  ? (sec.height === 100 ? `${sec.minHeight || 680}px` : `${sec.height * 6.8}px`)
                  : `${sec.height || 400}px`,
              height: 'auto', // dynamic height flow
              backgroundColor: headerNodeBgColor,
              backgroundImage: sec.backgroundImage ? `url(${sec.backgroundImage})` : 'none',
              backgroundPosition: sec.backgroundPosition || 'center',
              backgroundSize: sec.backgroundSize || 'cover',
              backgroundRepeat: sec.backgroundRepeat || 'no-repeat',
              marginBottom: headerMarginBottom,
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
              zIndex: headerZIndex,
            } as React.CSSProperties}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('.main-slide-content-box')) return;
              e.stopPropagation();
              setHoveredSectionId?.(null);
              setActiveSectionId(sec.id);
              setActiveElement(null);
            }}
            onContextMenu={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('.main-slide-content-box')) return;
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
                style={(sec.sharedType === 'header' || sec.sharedType === 'footer' || sec.sectionPresetType === 'main-slide') ? { 
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
                ) : sec.sectionPresetType === 'main-slide' ? (
                  <MainSlideSectionNode 
                    sec={sec} 
                    onNavigatePage={onNavigatePage} 
                    onUpdateSection={(secId, updates) => setSections(prev => prev.map(s => s.id === secId ? { ...s, ...updates } : s))} 
                    activeElement={activeElement}
                    setActiveElement={setActiveElement}
                    activeSectionId={activeSectionId}
                    setActiveSectionId={setActiveSectionId}
                    setContextMenu={setContextMenu}
                    themeSettings={themeSettings}
                  />
                ) : sec.sectionPresetType === 'features-grid' ? (
                  <FeaturesGridSectionNode sec={sec} onNavigatePage={onNavigatePage} />
                ) : sec.sectionPresetType === 'promo-banner' ? (
                  <PromoBannerSectionNode sec={sec} onNavigatePage={onNavigatePage} />
                ) : sec.sectionPresetType === 'card-slider' ? (
                  <CardSliderSectionNode sec={sec} onNavigatePage={onNavigatePage} />
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

        const menuWidth = 185;
        const menuHeight = 160;

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
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              padding: '0px',
              overflow: 'hidden',
              fontFamily: 'Inter, Pretendard, sans-serif',
              userSelect: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Selection Status Header */}
            {(() => {
              let selName = '';

              if (contextMenu.type === 'element' && targetElement) {
                const elTypeMap: Record<string, string> = {
                  title: '타이틀',
                  text: '글상자',
                  button: '버튼',
                  image: '이미지',
                  'three-column': '3열 글상자',
                  'legal-terms': '약관',
                };
                const typeLabel = elTypeMap[targetElement.type] || '요소';
                const contentPreview = targetElement.content ? ` ("${targetElement.content.slice(0, 8)}${targetElement.content.length > 8 ? '...' : ''}")` : '';
                selName = `${typeLabel}${contentPreview}`;
              } else if (contextMenu.elementId === 'slide-content' || (activeElement?.sectionId === targetSection.id && activeElement?.elementId === 'slide-content')) {
                selName = '슬라이드 컨텐츠';
              } else if (targetSection.sectionPresetType === 'main-slide') {
                selName = '메인 슬라이드';
              } else if (targetSection.sharedType === 'header') {
                selName = '공통 헤더';
              } else if (targetSection.sharedType === 'footer') {
                selName = '공통 푸터';
              } else {
                selName = `${targetSection.sectionTitle || '기본 섹션'}`;
              }

              return (
                <div 
                  style={{ 
                    width: '100%',
                    padding: '10px 16px', 
                    backgroundColor: '#e2e8f0', 
                    borderBottom: '1px solid #cbd5e1', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    color: '#334155',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    boxSizing: 'border-box'
                  }}
                  title={selName}
                >
                  {selName}
                </div>
              );
            })()}
            {contextMenu.elementId === 'slide-content' ? (
              <div style={{ padding: '10px 16px', fontSize: '14px', color: '#94a3b8' }}>
                슬라이드 컨텐츠
              </div>
            ) : contextMenu.type === 'element' && targetElement ? (
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
