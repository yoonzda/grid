import React, { useState, useEffect, useRef } from 'react';
import { Section, EditorElement, ThemeSettings, Page, GuidelineWidth } from '../types';
import { SUPPORTED_FONTS, findSupportedFont, updateGoogleFontsInDOM } from '../utils/fontManager';
import { ICON_TEMPLATES } from '../utils/iconTemplates';
import { DEFAULT_SPACING_PRESETS } from '../utils/templates';
import { AlignLeft, AlignCenter, AlignRight, MoveLeft, MoveRight, Trash2, X, Grid, ExternalLink, ArrowRight, ChevronLeft, ChevronRight, Plus, Check, ChevronDown, ChevronUp, Link } from 'lucide-react';
import { resolveCollisions } from '../utils/collision';

export const SLIDE_IMAGE_PRESETS = [
  { name: 'example1.jpg', url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example2.jpg', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example3.jpg', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example4.jpg', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example5.jpg', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example6.jpg', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example7.jpg', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example8.jpg', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example9.jpg', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=80' },
  { name: 'example10.jpg', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&auto=format&fit=crop&q=80' },
];

export const SLIDE_VIDEO_PRESETS = [
  { name: 'sample1_ocean.mp4', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
  { name: 'sample2_flower.mp4', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { name: 'sample3_city_hd.mp4', url: 'https://files.testfile.org/video-mp4-hd.mp4' },
  { name: 'sample4_people_hd.mp4', url: 'https://cdn.jsdelivr.net/gh/intel-iot-devkit/sample-videos@master/head-pose-face-detection-female.mp4' },
];

export const extractYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getDisplayImageName = (slide: { imageSrc?: string; imageName?: string }, defaultIdx: number) => {
  if (slide.imageName) return slide.imageName;
  const match = SLIDE_IMAGE_PRESETS.find(p => p.url === slide.imageSrc);
  if (match) return match.name;
  return `example${(defaultIdx % 10) + 1}.jpg`;
};

interface SidebarPropertyProps {
  activeElement: { sectionId: string; elementId: string } | null;
  activeSectionId: string | null;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setActiveElement: (val: { sectionId: string; elementId: string } | null) => void;
  setActiveSectionId: (val: string | null) => void;
  themeSettings?: ThemeSettings;
  setActivePaddingGuide: (val: { sectionId: string; type: 'top' | 'bottom' | 'both' } | null) => void;
  
  // Page link & navigation props
  pages?: Page[];
  activePageId?: string;
  onNavigatePage?: (id: string) => void;

  // Hover section preview props
  hoveredSectionId?: string | null;
  setHoveredSectionId?: (id: string | null) => void;

  // Guideline width hover preview props
  hoveredGuidelineWidth?: GuidelineWidth | null;
  setHoveredGuidelineWidth?: (w: GuidelineWidth | null) => void;

  // Layout style hover preview props
  previewHeaderLayout?: string | null;
  setPreviewHeaderLayout?: (layout: string | null) => void;
  previewHeaderState?: 'top' | 'scrolled' | null;
  setPreviewHeaderState?: (state: 'top' | 'scrolled' | null) => void;
  previewFlexAlign?: string | null;
  setPreviewFlexAlign?: (align: string | null) => void;
  previewHeaderLogoFont?: string | null;
  setPreviewHeaderLogoFont?: (font: string | null) => void;
}

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => {
  return (
    <div 
      style={{
        position: 'relative',
        width: '36px',
        height: '20px',
        borderRadius: '9999px',
        backgroundColor: disabled ? '#e2e8f0' : (checked ? '#0284c7' : '#cbd5e1'),
        padding: '2px',
        transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
    >
      <div 
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transform: checked ? 'translateX(16px)' : 'translateX(0px)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </div>
  );
};

const FontCustomSelect: React.FC<{
  currentFontName: string;
  onSelectFont: (fontName: string) => void;
  onHoverFont?: (fontName: string | null) => void;
}> = ({ currentFontName, onSelectFont, onHoverFont }) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialFontRef = useRef(currentFontName);
  const selectedFont = findSupportedFont(currentFontName);

  const [highlightedIndex, setHighlightedIndex] = useState<number>(() => {
    const idx = SUPPORTED_FONTS.findIndex(f => f.name === selectedFont.name || f.family === selectedFont.family);
    return idx >= 0 ? idx : 0;
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = SUPPORTED_FONTS.findIndex(f => f.name === selectedFont.name || f.family === selectedFont.family);
    if (idx >= 0) setHighlightedIndex(idx);
  }, [currentFontName, selectedFont]);

  const handleOpen = () => {
    initialFontRef.current = currentFontName;
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const itemEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (itemEl) {
        itemEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const previewFont = (fontName: string) => {
    updateGoogleFontsInDOM([fontName]);
    onSelectFont(fontName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        initialFontRef.current = currentFontName;
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(highlightedIndex + 1, SUPPORTED_FONTS.length - 1);
      setHighlightedIndex(nextIndex);
      if (SUPPORTED_FONTS[nextIndex]) {
        previewFont(SUPPORTED_FONTS[nextIndex].name);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(highlightedIndex - 1, 0);
      setHighlightedIndex(prevIndex);
      if (SUPPORTED_FONTS[prevIndex]) {
        previewFont(SUPPORTED_FONTS[prevIndex].name);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (SUPPORTED_FONTS[highlightedIndex]) {
        previewFont(SUPPORTED_FONTS[highlightedIndex].name);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      previewFont(initialFontRef.current);
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ position: 'relative', width: '100%', outline: 'none' }}
    >
      <div
        className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          fontFamily: selectedFont.family,
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedFont.name}
        </span>
        <ChevronDown size={16} style={{ color: '#64748b', marginLeft: '6px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </div>

      {isOpen && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            maxHeight: '220px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            padding: '4px 0',
          }}
        >
          {SUPPORTED_FONTS.map((f, idx) => {
            const isSelected = f.name === selectedFont.name || f.family === selectedFont.family;
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={f.name}
                onClick={() => {
                  previewFont(f.name);
                  setIsOpen(false);
                }}
                onMouseEnter={() => {
                  setHighlightedIndex(idx);
                  previewFont(f.name);
                  onHoverFont?.(f.name);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontFamily: f.family,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#e0f2fe' : isHighlighted ? '#f1f5f9' : 'transparent',
                  color: isSelected ? '#0284c7' : '#0f172a',
                  fontWeight: isSelected ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.1s ease',
                }}
              >
                <span>{f.name}</span>
                {isSelected && <Check size={14} style={{ color: '#0284c7' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SidebarProperty: React.FC<SidebarPropertyProps> = ({
  activeElement,
  activeSectionId,
  sections,
  setSections,
  setActiveElement,
  setActiveSectionId,
  themeSettings,
  setActivePaddingGuide,
  pages,
  activePageId,
  onNavigatePage,
  hoveredSectionId,
  setHoveredSectionId,
  hoveredGuidelineWidth: _hoveredGuidelineWidth,
  setHoveredGuidelineWidth,
  previewHeaderLayout: _previewHeaderLayout,
  setPreviewHeaderLayout: _setPreviewHeaderLayout,
  previewHeaderState,
  setPreviewHeaderState,
  previewFlexAlign: _previewFlexAlign,
  setPreviewFlexAlign,
  previewHeaderLogoFont: _previewHeaderLogoFont,
  setPreviewHeaderLogoFont,
}) => {
  const [showSectionDetail, setShowSectionDetail] = useState<boolean>(true);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [openPresetAccordionIndex, setOpenPresetAccordionIndex] = useState<number | null>(0);

  useEffect(() => {
    if (activeSectionId && !activeElement) {
      setShowSectionDetail(true);
    }
  }, [activeSectionId]);

  // Always reset sidebar scroll to top whenever active section, element, page, or detail state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const bodies = document.querySelectorAll('.properties-body');
      bodies.forEach(b => {
        b.scrollTop = 0;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [activeSectionId, activeElement?.elementId, activeElement?.sectionId, showSectionDetail, activePageId]);

  if (activeElement?.elementId === 'slide-content') {
    const section = sections.find(s => s.id === activeElement.sectionId) || sections.find(s => s.sectionPresetType === 'main-slide');
    if (!section) return null;

    const updateSection = (fields: Partial<Section>) => {
      setSections(prev =>
        prev.map(s => (s.id === section.id ? { ...s, ...fields } : s))
      );
    };

    const slides = section.slideItems || [];
    const activeSlideIdx = section.activeSlideIndex || 0;

    return (
      <div className="properties-panel">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }}
              onClick={() => setActiveElement(null)}
              title="상위 섹션 설정으로 돌아가기"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="font-bold text-base text-slate-900">속성 설정 (슬라이드 컨텐츠)</span>
          </div>
        </div>

        <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
          {/* 1. Full-width + 슬라이드 추가 Button at the VERY TOP (Above 컨텐츠 가로폭) */}
          <button
            type="button"
            style={{
              width: '100%',
              height: '38px',
              minHeight: '38px',
              flexShrink: 0,
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)',
            }}
            className="hover:bg-sky-700 transition-colors active:scale-[0.995]"
            onClick={() => {
              const presetIdx = slides.length % 10;
              const preset = SLIDE_IMAGE_PRESETS[presetIdx];
              const newSlide = {
                id: `slide_${Date.now()}`,
                title: `새 슬라이드 #${slides.length + 1}`,
                description: '새로운 슬라이드 설명을 입력하세요.',
                imageSrc: preset.url,
                imageName: preset.name,
                btnText: '자세히 보기',
                linkType: 'url' as const,
                linkUrl: '',
              };
              updateSection({ slideItems: [...slides, newSlide], activeSlideIndex: slides.length });
            }}
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>슬라이드 추가</span>
          </button>

          {/* 2. 컨텐츠 가로폭 */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">컨텐츠 가로폭</label>
            <div className="align-buttons-row">
              {(['100%', '80%', '60%'] as const).map((width) => {
                const currentContentW = section.contentWidth || '80%';
                const isActive = currentContentW === width;
                return (
                  <button
                    key={width}
                    type="button"
                    className={`align-btn ${isActive ? 'active' : ''}`}
                    onClick={() => updateSection({ contentWidth: width })}
                  >
                    {width}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Slide Title & Switcher Controls */}
          <div className="property-group flex flex-col gap-3">
            <div className="flex items-center justify-between pt-0.5">
              {/* Slide Title & Delete Icon */}
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Slide {String(activeSlideIdx + 1).padStart(2, '0')}
                </span>

                {slides.length > 1 && (
                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    onClick={() => {
                      const updated = slides.filter((_, sIdx) => sIdx !== activeSlideIdx);
                      const nextActive = Math.min(activeSlideIdx, updated.length - 1);
                      updateSection({ slideItems: updated, activeSlideIndex: Math.max(0, nextActive) });
                    }}
                    title="현재 슬라이드 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* < 1 / 3 > Pill Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px', height: '38px' }}>
                <button
                  type="button"
                  disabled={activeSlideIdx <= 0}
                  style={{ width: '30px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: 'none', background: 'transparent', cursor: activeSlideIdx <= 0 ? 'not-allowed' : 'pointer', color: activeSlideIdx <= 0 ? '#cbd5e1' : '#334155' }}
                  onClick={() => {
                    const prevIdx = Math.max(0, activeSlideIdx - 1);
                    updateSection({ activeSlideIndex: prevIdx });
                  }}
                  title="이전 슬라이드"
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', padding: '0 6px', minWidth: '40px', textAlign: 'center', fontFamily: 'monospace', userSelect: 'none' }}>
                  {slides.length > 0 ? `${activeSlideIdx + 1} / ${slides.length}` : '0 / 0'}
                </span>
                <button
                  type="button"
                  disabled={activeSlideIdx >= slides.length - 1}
                  style={{ width: '30px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: 'none', background: 'transparent', cursor: activeSlideIdx >= slides.length - 1 ? 'not-allowed' : 'pointer', color: activeSlideIdx >= slides.length - 1 ? '#cbd5e1' : '#334155' }}
                  onClick={() => {
                    const nextIdx = Math.min(slides.length - 1, activeSlideIdx + 1);
                    updateSection({ activeSlideIndex: nextIdx });
                  }}
                  title="다음 슬라이드"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Current Active Slide Form Fields */}
          {slides[activeSlideIdx] && (() => {
            const slide = slides[activeSlideIdx];
            const idx = activeSlideIdx;
            const slideNum = idx + 1;

            return (
              <>
                {/* X-1. 타이틀 설정 Group */}
                <div className="property-group flex flex-col gap-3.5">
                  <label className="group-title">{slideNum}-1. 타이틀 설정</label>
                  
                  <div className="input-block">
                    <label className="input-label" style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      슬라이드 제목
                    </label>
                    <input
                      type="text"
                      style={{ height: '40px', fontSize: '13.5px', fontWeight: 500 }}
                      className="w-full border border-slate-300 rounded px-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                      value={slide.title || ''}
                      onChange={(e) => {
                        const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, title: e.target.value } : item);
                        updateSection({ slideItems: updated });
                      }}
                      placeholder="슬라이드 제목"
                    />
                  </div>

                  {/* 타이틀 하단 여백 */}
                  {(() => {
                    const titleVarId = section.slideTitleMarginVarId;
                    const presets = (themeSettings?.spacingPresets && themeSettings.spacingPresets.length > 0) ? themeSettings.spacingPresets : DEFAULT_SPACING_PRESETS;
                    const activePreset = presets.find(p => p.id === titleVarId);
                    const resolvedVal = activePreset ? activePreset.value : (section.slideTitleMarginBottom ?? 16);
                    const isLinked = !!activePreset;

                    return (
                      <div className="flex items-center justify-between py-1">
                        {/* Left Side: Label + Pure Blue/Gray Link Icon (No bg, No border) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }} className="select-none">
                            타이틀 하단 여백
                          </span>

                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={() => {
                              if (isLinked) {
                                updateSection({ slideTitleMarginVarId: undefined, slideTitleMarginBottom: resolvedVal });
                              } else {
                                const currentPx = section.slideTitleMarginBottom ?? 16;
                                const matched = presets.find(p => p.value === currentPx) || presets.find(p => p.id === 'space-md') || presets[0];
                                if (matched) {
                                  updateSection({ slideTitleMarginVarId: matched.id, slideTitleMarginBottom: matched.value });
                                }
                              }
                            }}
                            title={isLinked ? `테마 간격 변수 연동 중 (${activePreset?.name.split(' ')[0]} ${resolvedVal}px) - 클릭하여 해제` : '개별 픽셀 고정 모드 - 클릭하여 테마 변수 연동'}
                          >
                            <Link size={16} style={{ color: isLinked ? '#0284c7' : '#94a3b8', strokeWidth: isLinked ? 2.5 : 2 }} />
                          </button>
                        </div>

                        {/* Right Side: Clean Standard Input or Select */}
                        <div>
                          {isLinked ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <select
                                style={{ width: '100px', height: '40px', textAlign: 'center', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}
                                className="border border-slate-300 rounded px-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer bg-white"
                                value={titleVarId}
                                onChange={(e) => {
                                  const found = presets.find(p => p.id === e.target.value);
                                  if (found) {
                                    updateSection({ slideTitleMarginVarId: found.id, slideTitleMarginBottom: found.value });
                                  }
                                }}
                                title="테마 간격 변수 선택 (XS 8, S 12, M 16, L 20, XL 28, XXL 48)"
                              >
                                {presets.map(p => {
                                  const shortName = p.name.split(' ')[0] || p.name;
                                  return (
                                    <option key={p.id} value={p.id}>
                                      {shortName} {p.value}
                                    </option>
                                  );
                                })}
                              </select>
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', width: '24px', textAlign: 'right' }}>
                                px
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                min={0}
                                max={200}
                                step={2}
                                style={{ width: '100px', height: '40px', textAlign: 'right', fontSize: '13.5px', fontWeight: 600 }}
                                className="border border-slate-300 rounded px-2.5 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                                value={section.slideTitleMarginBottom ?? 16}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) {
                                    updateSection({ slideTitleMarginVarId: undefined, slideTitleMarginBottom: Math.max(0, val) });
                                  }
                                }}
                              />
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', width: '24px', textAlign: 'right' }}>
                                px
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* X-2. 설명 문구 설정 Group */}
                <div className="property-group flex flex-col gap-3.5">
                  <label className="group-title">{slideNum}-2. 설명 문구 설정</label>

                  <div className="input-block">
                    <label className="input-label" style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      설명 문구
                    </label>
                    <textarea
                      style={{ fontSize: '13.5px', fontWeight: 500 }}
                      className="p-3 rounded border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-y min-h-[64px]"
                      value={slide.description || ''}
                      onChange={(e) => {
                        const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, description: e.target.value } : item);
                        updateSection({ slideItems: updated });
                      }}
                      placeholder="슬라이드 설명 문구"
                    />
                  </div>

                  {/* 설명문구 하단 여백 */}
                  {(() => {
                    const descVarId = section.slideDescMarginVarId;
                    const presets = (themeSettings?.spacingPresets && themeSettings.spacingPresets.length > 0) ? themeSettings.spacingPresets : DEFAULT_SPACING_PRESETS;
                    const activePreset = presets.find(p => p.id === descVarId);
                    const resolvedVal = activePreset ? activePreset.value : (section.slideDescMarginBottom ?? 28);
                    const isLinked = !!activePreset;

                    return (
                      <div className="flex items-center justify-between py-1">
                        {/* Left Side: Label + Pure Blue/Gray Link Icon (No bg, No border) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }} className="select-none">
                            설명문구 하단 여백
                          </span>

                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={() => {
                              if (isLinked) {
                                updateSection({ slideDescMarginVarId: undefined, slideDescMarginBottom: resolvedVal });
                              } else {
                                const currentPx = section.slideDescMarginBottom ?? 28;
                                const matched = presets.find(p => p.value === currentPx) || presets.find(p => p.id === 'space-xl') || presets[0];
                                if (matched) {
                                  updateSection({ slideDescMarginVarId: matched.id, slideDescMarginBottom: matched.value });
                                }
                              }
                            }}
                            title={isLinked ? `테마 간격 변수 연동 중 (${activePreset?.name.split(' ')[0]} ${resolvedVal}px) - 클릭하여 해제` : '개별 픽셀 고정 모드 - 클릭하여 테마 변수 연동'}
                          >
                            <Link size={16} style={{ color: isLinked ? '#0284c7' : '#94a3b8', strokeWidth: isLinked ? 2.5 : 2 }} />
                          </button>
                        </div>

                        {/* Right Side: Clean Standard Input or Select */}
                        <div>
                          {isLinked ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <select
                                style={{ width: '100px', height: '40px', textAlign: 'center', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}
                                className="border border-slate-300 rounded px-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer bg-white"
                                value={descVarId}
                                onChange={(e) => {
                                  const found = presets.find(p => p.id === e.target.value);
                                  if (found) {
                                    updateSection({ slideDescMarginVarId: found.id, slideDescMarginBottom: found.value });
                                  }
                                }}
                                title="테마 간격 변수 선택 (XS 8, S 12, M 16, L 20, XL 28, XXL 48)"
                              >
                                {presets.map(p => {
                                  const shortName = p.name.split(' ')[0] || p.name;
                                  return (
                                    <option key={p.id} value={p.id}>
                                      {shortName} {p.value}
                                    </option>
                                  );
                                })}
                              </select>
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', width: '24px', textAlign: 'right' }}>
                                px
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                min={0}
                                max={200}
                                step={2}
                                style={{ width: '100px', height: '40px', textAlign: 'right', fontSize: '13.5px', fontWeight: 600 }}
                                className="border border-slate-300 rounded px-2.5 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                                value={section.slideDescMarginBottom ?? 28}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) {
                                    updateSection({ slideDescMarginVarId: undefined, slideDescMarginBottom: Math.max(0, val) });
                                  }
                                }}
                              />
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', width: '24px', textAlign: 'right' }}>
                                px
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* X-3. 버튼 및 이동 링크 설정 Group */}
                <div className="property-group flex flex-col gap-3.5">
                  <label className="group-title">{slideNum}-3. 버튼 및 이동 링크 설정</label>

                  {/* 버튼 텍스트 */}
                  <div className="flex items-center justify-between gap-3">
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }} className="select-none min-w-[90px]">
                      버튼 텍스트
                    </span>
                    <input
                      type="text"
                      style={{ height: '40px', fontSize: '13.5px', fontWeight: 500, width: '180px' }}
                      className="border border-slate-300 rounded px-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                      value={slide.btnText || ''}
                      onChange={(e) => {
                        const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, btnText: e.target.value } : item);
                        updateSection({ slideItems: updated });
                      }}
                      placeholder="자세히 보기"
                    />
                  </div>

                  {/* 연결 링크 방식 */}
                  <div className="flex items-center justify-between gap-3">
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }} className="select-none min-w-[90px]">
                      연결 링크 방식
                    </span>
                    <select
                      style={{ height: '40px', fontSize: '13.5px', fontWeight: 500, width: '180px' }}
                      className="border border-slate-300 rounded px-2.5 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                      value={slide.linkType || 'url'}
                      onChange={(e) => {
                        const val = e.target.value as 'url' | 'page';
                        const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, linkType: val } : item);
                        updateSection({ slideItems: updated });
                      }}
                    >
                      <option value="url">외부 URL 이동</option>
                      {pages && pages.length > 0 && <option value="page">내부 페이지 이동</option>}
                    </select>
                  </div>

                  {/* 이동할 페이지 */}
                  {slide.linkType === 'page' && pages && (
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }} className="select-none min-w-[90px]">
                        이동할 페이지
                      </span>
                      <select
                        style={{ height: '40px', fontSize: '13.5px', fontWeight: 500, width: '180px' }}
                        className="border border-slate-300 rounded px-2.5 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                        value={slide.linkPageId || ''}
                        onChange={(e) => {
                          const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, linkPageId: e.target.value } : item);
                          updateSection({ slideItems: updated });
                        }}
                      >
                        <option value="">페이지 선택...</option>
                        {pages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.fileName})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 이동할 URL */}
                  {slide.linkType === 'url' && (
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }} className="select-none min-w-[90px]">
                        이동할 URL
                      </span>
                      <input
                        type="text"
                        style={{ height: '40px', fontSize: '13.5px', fontWeight: 500, width: '180px' }}
                        className="border border-slate-300 rounded px-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                        value={slide.linkUrl === '#' ? '' : (slide.linkUrl || '')}
                        onChange={(e) => {
                          const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, linkUrl: e.target.value } : item);
                          updateSection({ slideItems: updated });
                        }}
                        placeholder="https://example.com"
                      />
                    </div>
                  )}
                </div>

                {/* X-4. 배경 미디어 설정 Group */}
                <div className="property-group flex flex-col gap-3">
                  <span className="group-title">{slideNum}-4. 배경 미디어 설정</span>

                  {/* Media Type Tabs */}
                  <div className="align-buttons-row">
                    <button
                      type="button"
                      className={`align-btn ${(!slide.mediaType || slide.mediaType === 'image') ? 'active' : ''}`}
                      onClick={() => {
                        const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, mediaType: 'image' as const } : item);
                        updateSection({ slideItems: updated });
                      }}
                    >
                      이미지
                    </button>
                    <button
                      type="button"
                      className={`align-btn ${slide.mediaType === 'video' ? 'active' : ''}`}
                      onClick={() => {
                        const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, mediaType: 'video' as const, videoSrc: item.videoSrc || SLIDE_VIDEO_PRESETS[0].url, videoName: item.videoName || SLIDE_VIDEO_PRESETS[0].name } : item);
                        updateSection({ slideItems: updated });
                      }}
                    >
                      MP4 비디오
                    </button>
                    <button
                      type="button"
                      className={`align-btn ${slide.mediaType === 'youtube' ? 'active' : ''}`}
                      onClick={() => {
                        const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, mediaType: 'youtube' as const, youtubeUrl: item.youtubeUrl || 'https://www.youtube.com/watch?v=dQU4R_37R4s' } : item);
                        updateSection({ slideItems: updated });
                      }}
                    >
                      유튜브
                    </button>
                  </div>

                    {/* IMAGE TAB CONTENT */}
                    {(!slide.mediaType || slide.mediaType === 'image') && (
                      <>
                        <div className="flex gap-3 items-center">
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-300 flex-shrink-0 bg-slate-100 relative shadow-inner">
                            <img src={slide.imageSrc} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              현재 파일: {getDisplayImageName(slide, idx)}
                            </span>
                            <div className="flex gap-1.5 mt-0.5">
                              <label className="px-2.5 py-1 bg-sky-600 text-white rounded text-[11px] font-bold cursor-pointer hover:bg-sky-700 transition-colors shadow-sm inline-flex items-center gap-1">
                                이미지 업로드
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, imageSrc: reader.result as string, imageName: file.name } : item);
                                      updateSection({ slideItems: updated });
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2.5">
                          <span className="font-semibold text-slate-700 text-[11.5px]">샘플 이미지 (10종)</span>
                          <div className="grid grid-cols-5 gap-1.5">
                            {SLIDE_IMAGE_PRESETS.map((preset, pIdx) => {
                              const currentName = getDisplayImageName(slide, idx);
                              const isPresetActive = slide.imageSrc === preset.url || currentName === preset.name;
                              return (
                                <button
                                  key={pIdx}
                                  type="button"
                                  className={`h-7 rounded border flex items-center justify-center text-[10.5px] font-bold transition-all ${
                                    isPresetActive
                                      ? 'border-sky-600 bg-sky-600 text-white shadow-sm ring-1 ring-sky-300'
                                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                                  }`}
                                  onClick={() => {
                                    const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, imageSrc: preset.url, imageName: preset.name } : item);
                                    updateSection({ slideItems: updated });
                                  }}
                                  title={preset.name}
                                >
                                  ex{pIdx + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {/* MP4 VIDEO TAB CONTENT */}
                    {slide.mediaType === 'video' && (
                      <>
                        {/* Paused Static MP4 Video Preview (No Poster Image) */}
                        <div className="flex gap-3 items-center pb-2 border-b border-slate-100">
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-300 flex-shrink-0 bg-slate-900 relative shadow-inner">
                            <video
                              key={slide.videoSrc || SLIDE_VIDEO_PRESETS[0].url}
                              src={slide.videoSrc || SLIDE_VIDEO_PRESETS[0].url}
                              muted
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              비디오: {slide.videoName || 'sample1_ocean.mp4'}
                            </span>
                            <span className="text-[10.5px] text-slate-500 font-medium">
                              MP4 비디오 정지 화면 미리보기
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="font-semibold text-slate-700 text-[11.5px]">샘플 MP4 동영상 배경 (4종)</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {SLIDE_VIDEO_PRESETS.map((vPreset, vpIdx) => {
                              const isVideoActive = slide.videoSrc === vPreset.url;
                              return (
                                <button
                                  key={vpIdx}
                                  type="button"
                                  className={`p-1.5 rounded border text-left text-[11px] font-bold transition-all ${
                                    isVideoActive
                                      ? 'border-sky-600 bg-sky-50 text-sky-700 ring-1 ring-sky-300'
                                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300'
                                  }`}
                                  onClick={() => {
                                    const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, videoSrc: vPreset.url, videoName: vPreset.name } : item);
                                    updateSection({ slideItems: updated });
                                  }}
                                >
                                  샘플 비디오 {vpIdx + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700 text-[11px]">MP4 동영상 파일 업로드</span>
                          </div>
                          <label className="w-full py-2 bg-sky-600 text-white rounded text-xs font-bold cursor-pointer hover:bg-sky-700 transition-colors shadow-sm text-center flex items-center justify-center gap-1.5">
                            MP4 / WebM 비디오 파일 업로드
                            <input
                              type="file"
                              accept="video/mp4,video/webm"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, videoSrc: reader.result as string, videoName: file.name } : item);
                                  updateSection({ slideItems: updated });
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      </>
                    )}

                    {/* YOUTUBE TAB CONTENT */}
                    {slide.mediaType === 'youtube' && (() => {
                      const ytId = extractYouTubeId(slide.youtubeUrl) || slide.youtubeId || 'dQU4R_37R4s';
                      return (
                        <div className="flex flex-col gap-2.5">
                          {/* Live YouTube Thumbnail Preview */}
                          <div className="flex gap-3 items-center pb-1 border-b border-slate-100">
                            <div className="w-24 h-16 rounded-lg overflow-hidden border border-red-300 flex-shrink-0 bg-slate-900 relative shadow-sm">
                              <img
                                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                                alt="YouTube Thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] px-1 py-0.5 rounded font-extrabold tracking-wider">
                                YOUTUBE
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <span className="text-xs font-bold text-slate-800 truncate">
                                유튜브 ID: {ytId}
                              </span>
                              <span className="text-[10.5px] text-red-600 font-medium">
                                고화질 유튜브 썸네일 미리보기
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700 text-[11.5px]">유튜브(YouTube) 주소 입력</span>
                            <span className="text-[10.5px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              ID: {ytId}
                            </span>
                          </div>
                          <input
                            type="text"
                            className="h-8 text-xs px-2.5 rounded border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            value={slide.youtubeUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const parsedYtId = extractYouTubeId(val);
                              const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, youtubeUrl: val, youtubeId: parsedYtId || undefined } : item);
                              updateSection({ slideItems: updated });
                            }}
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                          <span className="text-[10.5px] text-slate-500">
                            예시: https://www.youtube.com/watch?v=dQU4R_37R4s 또는 https://youtu.be/...
                          </span>
                        </div>
                      );
                    })()}

                    {/* OVERLAY OPACITY SLIDER */}
                    <div className="flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 text-[11.5px]">배경 어둡기 (오버레이)</span>
                        <span className="text-xs font-bold text-sky-700">
                          {slide.overlayOpacity !== undefined ? slide.overlayOpacity : 55}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        step={5}
                        className="accent-sky-600"
                        value={slide.overlayOpacity !== undefined ? slide.overlayOpacity : 55}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const updated = slides.map((item, sIdx) => sIdx === idx ? { ...item, overlayOpacity: val } : item);
                          updateSection({ slideItems: updated });
                        }}
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      );
    }

  if (!activeElement && activeSectionId && showSectionDetail) {
    const section = sections.find(s => s.id === activeSectionId);
    if (!section) {
      return (
        <div className="properties-panel">
          <div className="panel-header">속성 설정</div>
          <div className="properties-empty">
            <span className="empty-text">섹션을 찾을 수 없습니다.</span>
          </div>
        </div>
      );
    }

    const updateSection = (fields: Partial<Section>) => {
      setSections(prev =>
        prev.map(s => (s.id === activeSectionId ? { ...s, ...fields } : s))
      );
    };

    if (section.sharedType === 'header') {
      const menuItems = section.headerMenuItems || [];
      
      const handleMenuItemChange = (itemId: string, field: 'name' | 'fileName', value: string) => {
        const updated = menuItems.map(item => 
          item.id === itemId ? { ...item, [field]: value } : item
        );
        updateSection({ headerMenuItems: updated });
      };

      const handleAddMenuItem = () => {
        const newItem = {
          id: `menu_${Date.now()}`,
          name: '새 메뉴',
          fileName: 'index.html'
        };
        updateSection({ headerMenuItems: [...menuItems, newItem] });
      };

      const handleRemoveMenuItem = (itemId: string) => {
        updateSection({ headerMenuItems: menuItems.filter(item => item.id !== itemId) });
      };

      return (
        <div className="properties-panel">
          <div className="panel-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  setActiveElement(null);
                  setShowSectionDetail(false);
                }}
                title="사용 컴포넌트 목록으로 돌아가기"
              >
                <ChevronLeft size={22} />
              </button>
              <span className="font-bold text-base text-slate-900">공통 헤더 컴포넌트</span>
            </div>
          </div>

          <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
            
            {/* 0-1. Base settings colors (Placed at VERY TOP) */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">헤더 기본 설정</label>
              <div className="input-block">
                <span className="input-label">기본 배경색</span>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={section.backgroundColor.startsWith('#') && section.backgroundColor.length === 7 ? section.backgroundColor : '#1e3a8a'}
                    onChange={(e) => updateSection({ backgroundColor: e.target.value })}
                  />
                  <input
                    type="text"
                    value={section.backgroundColor}
                    onChange={(e) => updateSection({ backgroundColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 0-2. Header Overlay & Scroll Background Settings */}
            <div className="property-group flex flex-col gap-3">
              <label className="group-title">편집 미리보기 상태 확인</label>
              <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: '36px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    borderRight: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    backgroundColor: (previewHeaderState === 'top' || (!previewHeaderState && section.headerTransparentAtTop !== false && activePageId === 'main')) ? '#0284c7' : '#ffffff',
                    color: (previewHeaderState === 'top' || (!previewHeaderState && section.headerTransparentAtTop !== false && activePageId === 'main')) ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setPreviewHeaderState?.('top')}
                >
                  상단 스크롤 (투명)
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: '36px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: (previewHeaderState === 'scrolled' || (!previewHeaderState && (section.headerTransparentAtTop === false || activePageId !== 'main'))) ? '#0284c7' : '#ffffff',
                    color: (previewHeaderState === 'scrolled' || (!previewHeaderState && (section.headerTransparentAtTop === false || activePageId !== 'main'))) ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setPreviewHeaderState?.('scrolled')}
                >
                  스크롤 다운 (배경색 적용)
                </button>
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                편집 해제 시 본래 실행 설정으로 자동 복원됩니다.
              </span>

              <label className="group-title mt-2">상단 고정 및 스크롤 배경 설정</label>
              
              <div 
                onClick={() => updateSection({ headerTransparentAtTop: section.headerTransparentAtTop === false ? true : false })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>스크롤 전 투명 배경</span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>최상단 스크롤 시 메인 슬라이드 위에 투명 오버레이</span>
                </div>
                <div style={{
                  width: '42px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: section.headerTransparentAtTop !== false ? '#0284c7' : '#cbd5e1',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: section.headerTransparentAtTop !== false ? '20px' : '2px',
                    transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </div>
              </div>

              {activePageId !== 'main' && (
                <div style={{ padding: '8px 10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px' }}>
                  <span style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 500 }}>
                    안내: 서브 페이지는 본문 콘텐츠 가림 방지를 위해 기본적으로 일반 배경색 헤더가 적용됩니다.
                  </span>
                </div>
              )}

              {section.headerTransparentAtTop !== false && (
                <div className="grid-input-item mt-1">
                  <span className="input-label">스크롤 후 배경색</span>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={(section.headerScrollBgColor || '#1e3a8a').startsWith('#') ? (section.headerScrollBgColor || '#1e3a8a') : '#1e3a8a'}
                      onChange={(e) => updateSection({ headerScrollBgColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={section.headerScrollBgColor || '#1e3a8a'}
                      onChange={(e) => updateSection({ headerScrollBgColor: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 0. Section Width (Guideline) settings */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">가로폭</label>
              <div className="align-buttons-row">
                {(['100%', '80%', '60%'] as const).map((width) => {
                  const isActive = (section.guidelineWidth || '80%') === width;
                  return (
                    <button
                      key={width}
                      type="button"
                      className={`align-btn ${isActive ? 'active' : ''}`}
                      onClick={() => updateSection({ guidelineWidth: width })}
                      onMouseEnter={() => setHoveredGuidelineWidth?.(width)}
                      onMouseLeave={() => setHoveredGuidelineWidth?.(null)}
                    >
                      {width}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1. Show/Hide Elements Toggle Switches */}
            {(() => {
              const visibleCount = (section.headerShowLogo !== false ? 1 : 0) + (section.headerShowMenu !== false ? 1 : 0) + (section.headerShowBtn !== false ? 1 : 0);
              return (
                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">헤더 구성 요소</label>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {[
                      { key: 'headerShowLogo', label: '브랜드 로고', val: section.headerShowLogo !== false },
                      { key: 'headerShowMenu', label: '네비게이션 메뉴', val: section.headerShowMenu !== false },
                      { key: 'headerShowBtn', label: 'CTA 버튼', val: section.headerShowBtn !== false },
                    ].map((item, idx, arr) => {
                      const isLastRemaining = item.val && visibleCount <= 1;
                      return (
                        <div 
                          key={item.key}
                          onClick={() => {
                            if (isLastRemaining) return;
                            updateSection({ [item.key]: !item.val });
                          }}
                          title={isLastRemaining ? '최소 1개의 요소는 화면에 표시되어야 합니다' : ''}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 0px',
                            borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #f1f5f9',
                            cursor: isLastRemaining ? 'not-allowed' : 'pointer',
                            opacity: isLastRemaining ? 0.6 : 1,
                            userSelect: 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#334155' }}>{item.label}</span>
                          <div style={{
                            width: '42px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: item.val ? '#0284c7' : '#cbd5e1',
                            position: 'relative',
                            transition: 'background-color 0.2s ease',
                          }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              position: 'absolute',
                              top: '2px',
                              left: item.val ? '20px' : '2px',
                              transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* 1-2. Brand Logo styling */}
            {section.headerShowLogo !== false && (
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">브랜드 로고 설정</label>
                
                <div className="input-block">
                  <span className="input-label">로고 표시 타입</span>
                  <select
                    value={section.headerLogoType || 'text'}
                    onChange={(e) => updateSection({ headerLogoType: e.target.value as any })}
                  >
                    <option value="text">텍스트 브랜드명</option>
                    <option value="image">이미지 로고 파일</option>
                  </select>
                </div>

                {section.headerLogoType === 'image' ? (
                  <>
                    <div className="input-block">
                      <span className="input-label">로고 이미지 등록</span>
                      <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label className="image-upload-label" style={{ flex: 1, textAlign: 'center', padding: '6px', background: '#0284c7', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                            파일 선택
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateSection({
                                    headerLogoImg: reader.result as string,
                                    headerLogoImgName: file.name,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          {section.headerLogoImg && (
                            <button
                              className="del-el-btn"
                              style={{ padding: '6px', height: 'auto', flex: 'none' }}
                              onClick={() => updateSection({ headerLogoImg: undefined, headerLogoImgName: undefined })}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                        {section.headerLogoImgName && (
                          <span className="text-[10px] text-gray-400 truncate" style={{ fontSize: '10px', color: '#9ca3af', display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            선택됨: {section.headerLogoImgName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="input-block mt-1">
                      <span className="input-label">로고 너비 (Width): {section.headerLogoWidth || 120}px</span>
                      <input
                        type="range"
                        min="30"
                        max="300"
                        value={section.headerLogoWidth || 120}
                        onChange={(e) => updateSection({ headerLogoWidth: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="input-block">
                      <span className="input-label">로고 텍스트</span>
                      <input
                        type="text"
                        value={section.headerLogoText || 'CORPORATE'}
                        onChange={(e) => updateSection({ headerLogoText: e.target.value })}
                      />
                    </div>
                    <div className="grid-inputs-row">
                      <div className="grid-input-item">
                        <span className="input-label">글자 크기</span>
                        <input
                          type="text"
                          value={section.headerLogoSize || '20px'}
                          onChange={(e) => updateSection({ headerLogoSize: e.target.value })}
                        />
                      </div>
                      <div className="grid-input-item">
                        <span className="input-label">글자 색상</span>
                        <div className="color-picker-wrapper">
                          <input
                            type="color"
                            value={section.headerLogoColor?.startsWith('#') ? section.headerLogoColor : '#ffffff'}
                            onChange={(e) => updateSection({ headerLogoColor: e.target.value })}
                          />
                          <input
                            type="text"
                            value={section.headerLogoColor || '#ffffff'}
                            onChange={(e) => updateSection({ headerLogoColor: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {/* Logo Font Selector */}
                <div className="input-block mt-2">
                  <span className="input-label">글꼴</span>
                  <FontCustomSelect
                    currentFontName={section.headerLogoFont || 'Inter'}
                    onSelectFont={(fontName) => {
                      updateSection({ headerLogoFont: fontName });
                      setPreviewHeaderLogoFont?.(null);
                    }}
                    onHoverFont={(fontName) => {
                      setPreviewHeaderLogoFont?.(fontName);
                    }}
                  />
                </div>
              </div>
            )}

            {/* 2. Alignment Layout presets */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">배치 스타일</label>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { value: 'spread-center', label: '양끝 정렬 및 메뉴 중앙' },
                  { value: 'spread-between', label: '양끝 분할 정렬' },
                  { value: 'left', label: '좌측 밀착 정렬' },
                  { value: 'center', label: '가로 중앙 정렬' },
                  { value: 'right', label: '우측 밀착 정렬' },
                  { value: 'even-space', label: '균등 간격 정렬' },
                ].map((opt, idx, arr) => {
                  const currentLayout = section.headerLayout || 'spread-center';
                  const isSelected = currentLayout === opt.value;
                  const isLast = idx === arr.length - 1;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => updateSection({ headerLayout: opt.value as any })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 8px',
                        margin: '0 -8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                        borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Left Check Icon Container */}
                      <div style={{ width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSelected && (
                          <Check size={18} strokeWidth={2.5} style={{ color: '#0284c7' }} />
                        )}
                      </div>

                      {/* Label Text */}
                      <span style={{
                        fontSize: '13.5px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#0284c7' : '#334155',
                        letterSpacing: '-0.2px',
                        flex: 1,
                      }}>
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Spacing & Margin Settings */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">헤더 여백 및 간격 설정</label>
              <div className="input-block">
                <span className="input-label">상하 여백 (Padding Y): {section.headerPaddingY ?? 16}px</span>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  value={section.headerPaddingY ?? 16}
                  onChange={(e) => updateSection({ headerPaddingY: parseInt(e.target.value) })}
                />
              </div>
              <div className="input-block mt-1">
                <span className="input-label">요소 간격 (Gap): {section.headerGap ?? 40}px</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={section.headerGap ?? 40}
                  onChange={(e) => updateSection({ headerGap: parseInt(e.target.value) })}
                />
              </div>
              {section.headerShowMenu !== false && (
                <div className="input-block mt-1">
                  <span className="input-label">메뉴 내부 간격: {section.headerMenuGap ?? 24}px</span>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="2"
                    value={section.headerMenuGap ?? 24}
                    onChange={(e) => updateSection({ headerMenuGap: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>

            {/* 4. Menu Link list */}
            {section.headerShowMenu !== false && (
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">메뉴 링크 개별 설정</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {menuItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', border: '1px solid var(--figma-border)', borderRadius: '4px' }}>
                      <input
                        type="text"
                        style={{ flex: 1, padding: '4px 6px', fontSize: '11px' }}
                        placeholder="이름"
                        value={item.name}
                        onChange={(e) => handleMenuItemChange(item.id, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        style={{ flex: 1.5, padding: '4px 6px', fontSize: '11px' }}
                        placeholder="파일명.html"
                        value={item.fileName}
                        onChange={(e) => handleMenuItemChange(item.id, 'fileName', e.target.value)}
                      />
                      <button
                        className="del-el-btn"
                        style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleRemoveMenuItem(item.id)}
                        title="메뉴 삭제"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddMenuItem}
                    style={{
                      background: 'var(--figma-bg)',
                      border: '1px dashed var(--figma-border)',
                      color: 'var(--figma-text)',
                      padding: '6px',
                      fontSize: '11px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    + 메뉴 링크 추가
                  </button>
                </div>
                
                <div className="grid-inputs-row mt-2">
                  <div className="grid-input-item">
                    <span className="input-label">글자 크기</span>
                    <select
                      style={{ height: '40px', fontSize: '13.5px', fontWeight: 500 }}
                      className="border border-slate-300 rounded px-2.5 outline-none bg-white w-full"
                      value={section.headerMenuSize || '15px'}
                      onChange={(e) => updateSection({ headerMenuSize: e.target.value })}
                    >
                      <option value="14px">14px</option>
                      <option value="15px">15px (권장)</option>
                      <option value="16px">16px (크게)</option>
                      <option value="18px">18px (매우 크게)</option>
                      <option value="20px">20px (대형)</option>
                    </select>
                  </div>
                  <div className="grid-input-item">
                    <span className="input-label">글자 색상</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={section.headerMenuColor?.startsWith('#') ? section.headerMenuColor : '#cbd5e1'}
                        onChange={(e) => updateSection({ headerMenuColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={section.headerMenuColor || '#cbd5e1'}
                        onChange={(e) => updateSection({ headerMenuColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                {/* Menu Font Selector */}
                <div className="input-block mt-2">
                  <span className="input-label">메뉴 글꼴 (Font Family)</span>
                  <FontCustomSelect
                    currentFontName={section.headerMenuFont || 'Inter'}
                    onSelectFont={(fontName) => updateSection({ headerMenuFont: fontName })}
                  />
                </div>
              </div>
            )}

            {/* 5. Button settings */}
            {section.headerShowBtn !== false && (
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">액션 버튼 설정</label>
                <div className="input-block">
                  <span className="input-label">버튼 텍스트</span>
                  <input
                    type="text"
                    value={section.headerBtnText || '문의하기'}
                    onChange={(e) => updateSection({ headerBtnText: e.target.value })}
                  />
                </div>
                
                <div className="grid-inputs-row">
                  <div className="grid-input-item">
                    <span className="input-label">배경색</span>
                    <div className="color-picker-wrapper">
                      {(() => {
                        const defaultBg = section.headerBtnBgColor === 'var(--theme-secondary)' || !section.headerBtnBgColor
                          ? (themeSettings?.secondaryColor || '#3b82f6')
                          : section.headerBtnBgColor;
                        return (
                          <>
                            <input
                              type="color"
                              value={defaultBg.startsWith('#') && defaultBg.length === 7 ? defaultBg : '#3b82f6'}
                              onChange={(e) => updateSection({ headerBtnBgColor: e.target.value })}
                            />
                            <input
                              type="text"
                              value={section.headerBtnBgColor || 'var(--theme-secondary)'}
                              onChange={(e) => updateSection({ headerBtnBgColor: e.target.value })}
                            />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="grid-input-item">
                    <span className="input-label">글자색</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={section.headerBtnTextColor?.startsWith('#') ? section.headerBtnTextColor : '#ffffff'}
                        onChange={(e) => updateSection({ headerBtnTextColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={section.headerBtnTextColor || '#ffffff'}
                        onChange={(e) => updateSection({ headerBtnTextColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="input-block">
                  <span className="input-label">둥글기 (Border-Radius: {section.headerBtnRadius ?? 4}px)</span>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={section.headerBtnRadius ?? 4}
                    onChange={(e) => updateSection({ headerBtnRadius: parseInt(e.target.value) })}
                  />
                </div>

                {/* Header Button Specs */}
                <div className="grid-inputs-row mt-2">
                  <div className="grid-input-item">
                    <span className="input-label">버튼 규격 크기</span>
                    <select
                      value={section.headerBtnSize || 'medium'}
                      onChange={(e) => updateSection({ headerBtnSize: e.target.value as any })}
                    >
                      <option value="small">Small (소형)</option>
                      <option value="medium">Medium (중형)</option>
                      <option value="large">Large (대형)</option>
                    </select>
                  </div>
                  <div className="grid-input-item">
                    <span className="input-label">버튼 스타일 종류</span>
                    <select
                      value={section.headerBtnVariant || 'filled'}
                      onChange={(e) => updateSection({ headerBtnVariant: e.target.value as any })}
                    >
                      <option value="filled">Filled (채우기)</option>
                      <option value="outlined">Outlined (테두리)</option>
                      <option value="ghost">Ghost (투명)</option>
                    </select>
                  </div>
                </div>
                
                <div className="input-block mt-2">
                  <span className="input-label">버튼 글꼴 (Font Family)</span>
                  <FontCustomSelect
                    currentFontName={section.headerBtnFont || 'Inter'}
                    onSelectFont={(fontName) => updateSection({ headerBtnFont: fontName })}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      );
    }

    if (section.sharedType === 'footer') {
      const company = section.footerCompany || '(주) 코퍼레이트';
      const representative = section.footerRepresentative || '홍길동';
      const address = section.footerAddress || '서울특별시 강남구 테헤란로 501, 15층 (삼성동, 코퍼레이트타워)';
      const tel = section.footerTel || '1588-0000';
      const bizNum = section.footerBizNum || '123-45-67890';
      const copyright = section.footerCopyright || 'Copyright © Corporate Inc. All rights reserved.';
      const layout = section.footerLayout || 'left-corporate';

      const textColor = section.footerTextColor || '#0f172a';
      const subTextColor = section.footerSubTextColor || '#475569';
      const textFont = section.footerTextFont || 'Inter';
      const paddingY = section.footerPaddingY !== undefined ? section.footerPaddingY : 36;

      return (
        <div className="properties-panel">
          <div className="panel-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  setActiveElement(null);
                  setShowSectionDetail(false);
                }}
                title="사용 컴포넌트 목록으로 돌아가기"
              >
                <ChevronLeft size={22} />
              </button>
              <span className="font-bold text-base text-slate-900">공통 푸터 컴포넌트</span>
            </div>
          </div>

          <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
            {/* 1. Layout Style Preset */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">레이아웃 스타일</label>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { value: 'left-corporate', label: '기업 좌측형' },
                  { value: 'stacked-center', label: '중앙 정렬형' },
                  { value: 'split-between', label: '양분 분할형' },
                  { value: 'simple-center', label: '심플 한줄형' },
                ].map((opt, idx, arr) => {
                  const isSelected = layout === opt.value;
                  const isLast = idx === arr.length - 1;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => updateSection({ footerLayout: opt.value as any })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 8px',
                        margin: '0 -8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                        borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Left Check Icon Container */}
                      <div style={{ width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSelected && (
                          <Check size={18} strokeWidth={2.5} style={{ color: '#0284c7' }} />
                        )}
                      </div>

                      {/* Label Text */}
                      <span style={{
                        fontSize: '13.5px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#0284c7' : '#334155',
                        letterSpacing: '-0.2px',
                        flex: 1,
                      }}>
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Guideline Width */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">가로폭</label>
              <div className="align-buttons-row">
                {(['100%', '80%', '60%'] as const).map((width) => {
                  const isActive = (section.guidelineWidth || '80%') === width;
                  return (
                    <button
                      key={width}
                      type="button"
                      className={`align-btn ${isActive ? 'active' : ''}`}
                      onClick={() => updateSection({ guidelineWidth: width })}
                      onMouseEnter={() => setHoveredGuidelineWidth?.(width)}
                      onMouseLeave={() => setHoveredGuidelineWidth?.(null)}
                    >
                      {width}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Company Name (Only shown for layouts that render Company Name) */}
            {(layout === 'stacked-center' || layout === 'split-between') && (
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">회사명 / 브랜드 상호</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => updateSection({ footerCompany: e.target.value })}
                  placeholder="(주) 코퍼레이트"
                />
              </div>
            )}

            {/* 4. Business Info (Only shown for layouts that render Representative, Tel, Address, BizNum) */}
            {layout !== 'simple-center' && (
              <>
                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">대표자 & 연락처 (TEL)</label>
                  <div className="grid-inputs-row">
                    <div className="grid-input-item">
                      <span className="input-label">대표자명</span>
                      <input
                        type="text"
                        value={representative}
                        onChange={(e) => updateSection({ footerRepresentative: e.target.value })}
                        placeholder="홍길동"
                      />
                    </div>
                    <div className="grid-input-item">
                      <span className="input-label">전화번호 (TEL)</span>
                      <input
                        type="text"
                        value={tel}
                        onChange={(e) => updateSection({ footerTel: e.target.value })}
                        placeholder="1588-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">주소 & 사업자등록번호</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => updateSection({ footerAddress: e.target.value })}
                      placeholder="서울특별시 강남구 테헤란로 501..."
                    />
                    <input
                      type="text"
                      value={bizNum}
                      onChange={(e) => updateSection({ footerBizNum: e.target.value })}
                      placeholder="123-45-67890"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 5. Copyright (Shown for all layouts) */}

            {/* 6. Copyright (Shown for all layouts) */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">카피라이트 (Copyright)</label>
              <input
                type="text"
                value={copyright}
                onChange={(e) => updateSection({ footerCopyright: e.target.value })}
                placeholder="Copyright © Corporate Inc. All rights reserved."
              />
            </div>

            {/* 8. Color & Typography Styling */}
            <div className="property-group flex flex-col gap-3">
              <label className="group-title">텍스트 & 색상 스타일</label>
              <div className="grid-inputs-row">
                <div className="grid-input-item">
                  <span className="input-label">주 글자색 (라벨/제목)</span>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={textColor.startsWith('#') ? textColor : '#0f172a'}
                      onChange={(e) => updateSection({ footerTextColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => updateSection({ footerTextColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-input-item">
                  <span className="input-label">보조 글자색 (본문/카피라이트)</span>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={subTextColor.startsWith('#') ? subTextColor : '#475569'}
                      onChange={(e) => updateSection({ footerSubTextColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={subTextColor}
                      onChange={(e) => updateSection({ footerSubTextColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Font Selector */}
              <div className="input-block mt-1">
                <span className="input-label">글꼴 (Font Family)</span>
                <FontCustomSelect
                  currentFontName={textFont}
                  onSelectFont={(fontName) => updateSection({ footerTextFont: fontName })}
                  onHoverFont={() => {}}
                />
              </div>
            </div>

            {/* 9. Footer Section Base Settings (Padding & Background) */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">섹션 스타일</label>
              <div className="grid-inputs-row">
                <div className="grid-input-item" style={{ flex: '1.5 1 0%' }}>
                  <span className="input-label">상하 여백 (Padding Y): {paddingY}px</span>
                  <input
                    type="range"
                    min="12"
                    max="100"
                    step="2"
                    value={paddingY}
                    onChange={(e) => updateSection({ footerPaddingY: parseInt(e.target.value) || 12 })}
                  />
                </div>
                
                <div className="grid-input-item">
                  <span className="input-label">배경색</span>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={section.backgroundColor?.startsWith('#') ? section.backgroundColor : '#f8fafc'}
                      onChange={(e) => updateSection({ backgroundColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={section.backgroundColor || '#f8fafc'}
                      onChange={(e) => updateSection({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      );
    }

    let currentSectionTitle = section.sectionTitle || '섹션';
    if (section.sharedType === 'header') currentSectionTitle = '공통 헤더';
    else if (section.sharedType === 'footer') currentSectionTitle = '공통 푸터';
    else if (section.sectionPresetType === 'main-slide' || section.id === 'sec-main-slide') currentSectionTitle = '메인 슬라이드';
    else if (section.sectionPresetType === 'features-grid') currentSectionTitle = '주요 특징';
    else if (section.sectionPresetType === 'promo-banner') currentSectionTitle = '고정 배경 배너';
    else if (section.sectionPresetType === 'card-slider') currentSectionTitle = '카드 슬라이드';
    else if (!section.sectionTitle) {
      let bodyCount = 0;
      for (const s of sections) {
        if (s.sharedType !== 'header' && s.sharedType !== 'footer') {
          bodyCount++;
          if (s.id === section.id) {
            currentSectionTitle = `섹션 ${bodyCount}`;
            break;
          }
        }
      }
    }

    const isMainSlide = section.sectionPresetType === 'main-slide' || section.id === 'sec-main-slide';

    return (
      <div className="properties-panel">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }}
              onClick={() => {
                setActiveElement(null);
                setShowSectionDetail(false);
              }}
              title="사용 컴포넌트 목록으로 돌아가기"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="font-bold text-base text-slate-900">{currentSectionTitle}</span>
          </div>
        </div>

        <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
          
          {/* Preset 1: main-slide Accordion Editor */}
          {section.sectionPresetType === 'main-slide' && (
            <div className="property-group flex flex-col gap-3">
              <label className="group-title">슬라이드 기본 설정</label>

              {/* 1. 무한 루프 */}
              <div className="flex items-center justify-between py-0.5">
                <span className="text-[13.5px] font-medium text-slate-700 select-none">
                  무한 루프
                </span>
                <ToggleSwitch
                  checked={section.loop !== false}
                  onChange={(checked) => updateSection({ loop: checked })}
                />
              </div>

              {/* 2. 드래그 전환 */}
              <div className="flex items-center justify-between py-0.5">
                <span className="text-[13.5px] font-medium text-slate-700 select-none">
                  드래그 전환
                </span>
                <ToggleSwitch
                  checked={section.enableDrag !== false}
                  onChange={(checked) => updateSection({ enableDrag: checked })}
                />
              </div>

              {/* 3. 자동 슬라이드 */}
              <div className="flex items-center justify-between py-0.5">
                <span className="text-[13.5px] font-medium text-slate-700 select-none">
                  자동 슬라이드
                </span>
                <ToggleSwitch
                  checked={section.autoPlay !== false}
                  onChange={(checked) => updateSection({ autoPlay: checked })}
                />
              </div>

              {/* 4. 자동 전환 간격 */}
              {(section.autoPlay !== false) && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[13.5px] font-medium text-slate-700 select-none">
                    자동 전환 간격
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      step={0.5}
                      style={{ width: '88px', height: '32px', textAlign: 'right', fontSize: '13.5px', fontWeight: 600 }}
                      value={((section.autoPlayInterval || 4000) / 1000)}
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        if (rawVal === '') return;
                        const val = parseFloat(rawVal);
                        if (!isNaN(val)) {
                          const clamped = Math.min(30, Math.max(1, val));
                          updateSection({ autoPlayInterval: Math.round(clamped * 1000) });
                        }
                      }}
                    />
                    <span className="text-[13.5px] font-semibold text-slate-700 w-[24px] text-right">
                      초
                    </span>
                  </div>
                </div>
              )}

              {/* 5. 동영상 배경 전환 방식 */}
              {(section.autoPlay !== false) && (
                <div className="flex flex-col pt-2.5 pb-1 mt-1 border-t border-slate-200/80">
                  <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 500, color: '#334155', marginBottom: '8px', userSelect: 'none' }}>
                    동영상 배경 전환 방식
                  </span>
                  <div className="align-buttons-row">
                    <button
                      type="button"
                      className={`align-btn ${section.slideAutoPlayMode !== 'video-end' ? 'active' : ''}`}
                      onClick={() => updateSection({ slideAutoPlayMode: 'fixed' })}
                    >
                      고정 시간 적용
                    </button>
                    <button
                      type="button"
                      className={`align-btn ${section.slideAutoPlayMode === 'video-end' ? 'active' : ''}`}
                      onClick={() => updateSection({ slideAutoPlayMode: 'video-end' })}
                    >
                      동영상 완료 시 전환
                    </button>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: '1.5', fontWeight: 500, display: 'block' }}>
                    {section.slideAutoPlayMode === 'video-end'
                      ? '동영상 배경 슬라이드는 비디오 재생이 끝난 후 자동으로 다음 슬라이드로 전환됩니다.'
                      : '동영상이 포함된 슬라이드도 설정된 전환 간격(초)마다 동일하게 전환됩니다.'}
                  </span>
                </div>
              )}

              {/* 6. 슬라이드 전환 효과 */}
              <div className="flex flex-col pt-3 pb-1 mt-1 border-t border-slate-200/80">
                <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 500, color: '#334155', marginBottom: '10px', marginTop: '4px', userSelect: 'none' }}>
                  슬라이드 전환 효과
                </span>
                <div className="align-buttons-row">
                  {[
                    { id: 'zoom', label: '줌' },
                    { id: 'fade', label: '페이드' },
                    { id: 'slide', label: '슬라이드' },
                  ].map((eff) => {
                    const currentEffect = section.slideEffectType || 'zoom';
                    const isSelected = currentEffect === eff.id;
                    return (
                      <button
                        key={eff.id}
                        type="button"
                        className={`align-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => updateSection({ slideEffectType: eff.id as any })}
                      >
                        {eff.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Preset 2: features-grid Accordion Editor */}
          {section.sectionPresetType === 'features-grid' && (
            <div className="property-group flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="group-title">특징 항목 목록 (바둑판 아코디언)</label>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded font-semibold flex items-center gap-1 hover:bg-sky-100"
                  onClick={() => {
                    const items = section.featureItems || [];
                    const newItem = {
                      id: `feat_${Date.now()}`,
                      title: `신규 특징 ${items.length + 1}`,
                      description: '특징에 대한 상세한 설명 내용을 입력해 주세요.',
                      imageSrc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
                      btnText: '자세히 보기 >',
                      linkType: 'url' as const,
                      linkUrl: '#'
                    };
                    updateSection({ featureItems: [...items, newItem] });
                  }}
                >
                  <Plus size={14} /> 특징 항목 추가
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {(section.featureItems || []).map((item, idx) => {
                  const isOpen = openPresetAccordionIndex === idx;
                  return (
                    <div key={item.id || idx} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div
                        className="p-3 bg-slate-50 flex items-center justify-between cursor-pointer select-none border-b border-slate-100"
                        onClick={() => setOpenPresetAccordionIndex(isOpen ? null : idx)}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                          <span>특징 #{idx + 1}</span>
                          <span className="text-slate-500 font-normal truncate max-w-[140px]">{item.title || '제목 없음'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {(section.featureItems || []).length > 1 && (
                            <button
                              type="button"
                              className="p-1 text-slate-400 hover:text-red-500 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = (section.featureItems || []).filter((_, sIdx) => sIdx !== idx);
                                updateSection({ featureItems: updated });
                              }}
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-3 flex flex-col gap-3 text-xs bg-white">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">특징 제목</span>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = (section.featureItems || []).map((f, sIdx) => sIdx === idx ? { ...f, title: e.target.value } : f);
                                updateSection({ featureItems: updated });
                              }}
                              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">설명 문구</span>
                            <textarea
                              rows={3}
                              value={item.description}
                              onChange={(e) => {
                                const updated = (section.featureItems || []).map((f, sIdx) => sIdx === idx ? { ...f, description: e.target.value } : f);
                                updateSection({ featureItems: updated });
                              }}
                              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">이미지 URL</span>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={item.imageSrc}
                                onChange={(e) => {
                                  const updated = (section.featureItems || []).map((f, sIdx) => sIdx === idx ? { ...f, imageSrc: e.target.value } : f);
                                  updateSection({ featureItems: updated });
                                }}
                                className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs"
                              />
                              <label className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-pointer text-xs font-semibold text-slate-700">
                                업로드
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        if (ev.target?.result) {
                                          const updated = (section.featureItems || []).map((f, sIdx) => sIdx === idx ? { ...f, imageSrc: ev.target!.result as string } : f);
                                          updateSection({ featureItems: updated });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">버튼 / 링크 텍스트</span>
                            <input
                              type="text"
                              value={item.btnText || ''}
                              onChange={(e) => {
                                const updated = (section.featureItems || []).map((f, sIdx) => sIdx === idx ? { ...f, btnText: e.target.value } : f);
                                updateSection({ featureItems: updated });
                              }}
                              placeholder="자세히 보기 >"
                              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">연결 링크 방식</span>
                            <select
                              value={item.linkType || 'none'}
                              onChange={(e) => {
                                const updated = (section.featureItems || []).map((f, sIdx) => sIdx === idx ? { ...f, linkType: e.target.value as any } : f);
                                updateSection({ featureItems: updated });
                              }}
                              className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                            >
                              <option value="none">링크 없음</option>
                              <option value="page">내부 페이지 이동</option>
                              <option value="url">외부 URL 이동</option>
                            </select>
                          </div>

                          {item.linkType === 'page' && (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-slate-700">이동할 페이지</span>
                              <select
                                value={item.linkPageId || 'main'}
                                onChange={(e) => {
                                  const updated = (section.featureItems || []).map((f, sIdx) => sIdx === idx ? { ...f, linkPageId: e.target.value } : f);
                                  updateSection({ featureItems: updated });
                                }}
                                className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                              >
                                {(pages || []).map(p => (
                                  <option key={p.id} value={p.id}>{p.name} ({p.fileName})</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {item.linkType === 'url' && (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-slate-700">이동할 URL</span>
                              <input
                                type="text"
                                value={item.linkUrl || ''}
                                onChange={(e) => {
                                  const updated = (section.featureItems || []).map((f, sIdx) => sIdx === idx ? { ...f, linkUrl: e.target.value } : f);
                                  updateSection({ featureItems: updated });
                                }}
                                placeholder="https://example.com"
                                className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preset 3: promo-banner Editor */}
          {section.sectionPresetType === 'promo-banner' && (
            <div className="property-group flex flex-col gap-3">
              <label className="group-title">고정 배경 배너 설정</label>
              
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-700 text-xs">서브 타이틀 (태그)</span>
                <input
                  type="text"
                  value={section.sectionSubTitle || ''}
                  onChange={(e) => updateSection({ sectionSubTitle: e.target.value })}
                  placeholder="Competitive Advantage"
                  className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-700 text-xs">메인 비전 문구</span>
                <textarea
                  rows={2}
                  value={section.sectionTitle || ''}
                  onChange={(e) => updateSection({ sectionTitle: e.target.value })}
                  placeholder="지속 가능한 성장과 함께하는 혁신, 우리는 미래를 준비합니다."
                  className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-700 text-xs">고정 배경 이미지 URL (Parallax)</span>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={section.backgroundImage || ''}
                    onChange={(e) => updateSection({ backgroundImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs"
                  />
                  <label className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-pointer text-xs font-semibold text-slate-700">
                    업로드
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              updateSection({ backgroundImage: ev.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-700 text-xs">CTA 버튼 텍스트</span>
                <input
                  type="text"
                  value={section.ctaBtnText || ''}
                  onChange={(e) => updateSection({ ctaBtnText: e.target.value })}
                  placeholder="자세히 보기 >"
                  className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-700 text-xs">CTA 버튼 연결 링크</span>
                <select
                  value={section.ctaLinkType || 'none'}
                  onChange={(e) => updateSection({ ctaLinkType: e.target.value as any })}
                  className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="none">링크 없음</option>
                  <option value="page">내부 페이지 이동</option>
                  <option value="url">외부 URL 이동</option>
                </select>
              </div>

              {section.ctaLinkType === 'page' && (
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700 text-xs">이동할 페이지</span>
                  <select
                    value={section.ctaLinkPageId || 'main'}
                    onChange={(e) => updateSection({ ctaLinkPageId: e.target.value })}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    {(pages || []).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.fileName})</option>
                    ))}
                  </select>
                </div>
              )}

              {section.ctaLinkType === 'url' && (
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700 text-xs">이동할 URL</span>
                  <input
                    type="text"
                    value={section.ctaLinkUrl || ''}
                    onChange={(e) => updateSection({ ctaLinkUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* Preset 4: card-slider Accordion Editor */}
          {section.sectionPresetType === 'card-slider' && (
            <div className="property-group flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-700 text-xs">섹션 타이틀</span>
                <input
                  type="text"
                  value={section.sectionSubTitle || ''}
                  onChange={(e) => updateSection({ sectionSubTitle: e.target.value })}
                  placeholder="Our Latest News"
                  className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex items-center justify-between mt-1">
                <label className="group-title">뉴스 카드 목록 (기본 5개, 최소 3개)</label>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded font-semibold flex items-center gap-1 hover:bg-sky-100"
                  onClick={() => {
                    const cards = section.cardItems || [];
                    const newCard = {
                      id: `card_${Date.now()}`,
                      tag: 'NEWS',
                      title: `신규 뉴스 소식 ${cards.length + 1}`,
                      date: '2026-07-27',
                      description: '새로운 소식과 관련 정보를 입력하세요.',
                      imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
                      linkType: 'url' as const,
                      linkUrl: '#'
                    };
                    updateSection({ cardItems: [...cards, newCard] });
                  }}
                >
                  <Plus size={14} /> 카드 추가
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {(section.cardItems || []).map((card, idx) => {
                  const isOpen = openPresetAccordionIndex === idx;
                  const canDelete = (section.cardItems || []).length > 3;

                  return (
                    <div key={card.id || idx} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div
                        className="p-3 bg-slate-50 flex items-center justify-between cursor-pointer select-none border-b border-slate-100"
                        onClick={() => setOpenPresetAccordionIndex(isOpen ? null : idx)}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                          <span className="px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px]">{card.tag || 'NEWS'}</span>
                          <span className="text-slate-500 font-normal truncate max-w-[130px]">{card.title || '제목 없음'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {canDelete && (
                            <button
                              type="button"
                              className="p-1 text-slate-400 hover:text-red-500 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = (section.cardItems || []).filter((_, sIdx) => sIdx !== idx);
                                updateSection({ cardItems: updated });
                              }}
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-3 flex flex-col gap-3 text-xs bg-white">
                          <div className="flex gap-2">
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="font-semibold text-slate-700">태그</span>
                              <input
                                type="text"
                                value={card.tag}
                                onChange={(e) => {
                                  const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, tag: e.target.value } : c);
                                  updateSection({ cardItems: updated });
                                }}
                                placeholder="NEWS"
                                className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                              />
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="font-semibold text-slate-700">날짜</span>
                              <input
                                type="text"
                                value={card.date}
                                onChange={(e) => {
                                  const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, date: e.target.value } : c);
                                  updateSection({ cardItems: updated });
                                }}
                                placeholder="2026-07-27"
                                className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">카드 제목</span>
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => {
                                const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, title: e.target.value } : c);
                                updateSection({ cardItems: updated });
                              }}
                              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">요약 설명</span>
                            <textarea
                              rows={2}
                              value={card.description || ''}
                              onChange={(e) => {
                                const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, description: e.target.value } : c);
                                updateSection({ cardItems: updated });
                              }}
                              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">썸네일 이미지 URL</span>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={card.imageSrc}
                                onChange={(e) => {
                                  const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, imageSrc: e.target.value } : c);
                                  updateSection({ cardItems: updated });
                                }}
                                className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs"
                              />
                              <label className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-pointer text-xs font-semibold text-slate-700">
                                업로드
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        if (ev.target?.result) {
                                          const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, imageSrc: ev.target!.result as string } : c);
                                          updateSection({ cardItems: updated });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">연결 링크 방식</span>
                            <select
                              value={card.linkType || 'none'}
                              onChange={(e) => {
                                const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, linkType: e.target.value as any } : c);
                                updateSection({ cardItems: updated });
                              }}
                              className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                            >
                              <option value="none">링크 없음</option>
                              <option value="page">내부 페이지 이동</option>
                              <option value="url">외부 URL 이동</option>
                            </select>
                          </div>

                          {card.linkType === 'page' && (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-slate-700">이동할 페이지</span>
                              <select
                                value={card.linkPageId || 'main'}
                                onChange={(e) => {
                                  const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, linkPageId: e.target.value } : c);
                                  updateSection({ cardItems: updated });
                                }}
                                className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                              >
                                {(pages || []).map(p => (
                                  <option key={p.id} value={p.id}>{p.name} ({p.fileName})</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {card.linkType === 'url' && (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-slate-700">이동할 URL</span>
                              <input
                                type="text"
                                value={card.linkUrl || ''}
                                onChange={(e) => {
                                  const updated = (section.cardItems || []).map((c, sIdx) => sIdx === idx ? { ...c, linkUrl: e.target.value } : c);
                                  updateSection({ cardItems: updated });
                                }}
                                placeholder="https://example.com"
                                className="px-2 py-1.5 border border-slate-300 rounded text-xs"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Width (Guideline Width) */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">가로폭 (배경)</label>
            <div className="align-buttons-row">
              {(['100%', '80%', '60%'] as const).map((width) => {
                const isMainSlide = section.sectionPresetType === 'main-slide' || section.id === 'sec-main-slide';
                const defaultW = isMainSlide ? '100%' : '80%';
                const isActive = (section.guidelineWidth || defaultW) === width;
                return (
                  <button
                    key={width}
                    type="button"
                    className={`align-btn ${isActive ? 'active' : ''}`}
                    onClick={() => updateSection({ guidelineWidth: width })}
                    onMouseEnter={() => setHoveredGuidelineWidth?.(null)}
                    onMouseLeave={() => setHoveredGuidelineWidth?.(null)}
                  >
                    {width}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Height Mode */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">섹션 높이 방식</label>
            <div className="align-buttons-row">
              <button
                type="button"
                className={`align-btn ${section.heightMode !== 'auto' ? 'active' : ''}`}
                onClick={() => updateSection({ heightMode: 'fixed' })}
              >
                고정 높이 (Fixed)
              </button>
              <button
                type="button"
                className={`align-btn ${section.heightMode === 'auto' ? 'active' : ''}`}
                onClick={() => updateSection({ heightMode: 'auto' })}
              >
                자동 높이 (Auto)
              </button>
            </div>
          </div>

          {/* Section Height & Vertical Align */}
          {(section.heightMode !== 'auto') && (() => {
            const pTop = section.paddingTop ?? 40;
            const pBottom = section.paddingBottom ?? 40;
            const isHorizontal = section.flexDirection === 'horizontal';
            const gap = section.flexGap !== undefined ? section.flexGap : 16;

            const elementsCount = section.elements.length;
            let computedLimit = 120;

            if (elementsCount > 0) {
              const maxElHeight = Math.max(...section.elements.map(el => {
                const elHeightStr = (el as any).height || '40px';
                const parsedH = parseInt(elHeightStr, 10) || 40;
                return parsedH;
              }));

              if (isHorizontal) {
                computedLimit = pTop + pBottom + maxElHeight + 20;
              } else {
                const totalElementsH = section.elements.reduce((acc, el) => {
                  const parsedH = parseInt((el as any).height || '40px', 10) || 40;
                  return acc + parsedH;
                }, 0);
                const totalGaps = (elementsCount - 1) * gap;
                computedLimit = pTop + pBottom + totalElementsH + totalGaps + 20;
              }
            }

            const minHeightLimit = Math.max(120, computedLimit);
            const hUnit = section.heightUnit || 'px';
            const isPx = hUnit === 'px';

            let boundedVal = section.height || (isPx ? 400 : 100);
            if (isPx && boundedVal < minHeightLimit) {
              boundedVal = minHeightLimit;
            }

            const isMain = section.sectionPresetType === 'main-slide' || section.id === 'sec-main-slide';
            const isDvhUnit = hUnit === 'dvh' || hUnit === 'vh';

            return (
              <>
                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">섹션 높이 설정</label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Row 1: 픽셀 고정 */}
                    <div 
                      className="sec-height-item"
                      onClick={() => {
                        if (hUnit !== 'px') {
                          const targetPx = isMain ? 680 : 400;
                          updateSection({ heightMode: 'fixed', heightUnit: 'px', height: targetPx });
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {hUnit === 'px' ? (
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #0284c7', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }}></span>
                          </span>
                        ) : (
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #cbd5e1', background: '#ffffff', flexShrink: 0 }}></span>
                        )}
                        <span style={{ fontSize: '13.5px', fontWeight: hUnit === 'px' ? 700 : 500, color: hUnit === 'px' ? '#0f172a' : '#475569', userSelect: 'none' }}>
                          픽셀 고정
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          min={minHeightLimit}
                          max={2000}
                          step={10}
                          value={hUnit === 'px' ? boundedVal : (isMain ? 680 : 400)}
                          disabled={hUnit !== 'px'}
                          onChange={(e) => {
                            const rawVal = e.target.value;
                            if (rawVal === '') {
                              updateSection({ heightMode: 'fixed', heightUnit: 'px', height: 0 });
                              return;
                            }
                            const val = parseInt(rawVal);
                            if (!isNaN(val)) {
                              const clamped = Math.min(3000, Math.max(0, val));
                              updateSection({ heightMode: 'fixed', heightUnit: 'px', height: clamped });
                            }
                          }}
                          onBlur={() => {
                            if (boundedVal < minHeightLimit) {
                              updateSection({ heightMode: 'fixed', heightUnit: 'px', height: minHeightLimit });
                            }
                          }}
                        />
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: hUnit === 'px' ? '#334155' : '#94a3b8', width: '26px', textAlign: 'right' }}>
                          px
                        </span>
                      </div>
                    </div>

                    {/* Row 2: 화면 비율 */}
                    <div 
                      className="sec-height-item"
                      onClick={() => {
                        if (!isDvhUnit) {
                          const targetDvh = isMain ? 100 : 80;
                          updateSection({ heightMode: 'fixed', heightUnit: 'dvh', height: targetDvh });
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isDvhUnit ? (
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #0284c7', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }}></span>
                          </span>
                        ) : (
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #cbd5e1', background: '#ffffff', flexShrink: 0 }}></span>
                        )}
                        <span style={{ fontSize: '13.5px', fontWeight: isDvhUnit ? 700 : 500, color: isDvhUnit ? '#0f172a' : '#475569', userSelect: 'none' }}>
                          화면 비율
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          step={1}
                          value={isDvhUnit ? boundedVal : (isMain ? 100 : 80)}
                          disabled={!isDvhUnit}
                          onChange={(e) => {
                            const rawVal = e.target.value;
                            if (rawVal === '') {
                              updateSection({ heightMode: 'fixed', heightUnit: 'dvh', height: 0 });
                              return;
                            }
                            const val = parseInt(rawVal);
                            if (!isNaN(val)) {
                              const clamped = Math.min(100, Math.max(0, val));
                              updateSection({ heightMode: 'fixed', heightUnit: 'dvh', height: clamped });
                            }
                          }}
                          onBlur={() => {
                            if (boundedVal < 10) {
                              updateSection({ heightMode: 'fixed', heightUnit: 'dvh', height: 20 });
                            }
                          }}
                        />
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: isDvhUnit ? '#334155' : '#94a3b8', width: '26px', textAlign: 'right' }}>
                          dvh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 내부 요소 수직 정렬 */}
                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">내부 요소 수직 정렬</label>
                  <div className="align-buttons-row">
                    {[
                      { value: 'start', label: '위쪽' },
                      { value: 'center', label: '가운데' },
                      { value: 'end', label: '아래쪽' },
                    ].map((opt) => {
                      const currentVert = section.verticalAlign || 'center';
                      const isSelected = currentVert === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={`align-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => updateSection({ verticalAlign: opt.value as any })}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 내부 요소 수평 정렬 */}
                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">{isMainSlide ? '내부 요소 수평 정렬' : '요소 배치 정렬'}</label>
                  <div className="align-buttons-row">
                    {[
                      { value: 'start', label: isMainSlide ? '좌측' : '시작' },
                      { value: 'center', label: '중앙' },
                      { value: 'end', label: isMainSlide ? '우측' : '끝' },
                    ].map((opt) => {
                      const currentAlign = section.flexAlign || 'start';
                      const isSelected = currentAlign === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={`align-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => updateSection({ flexAlign: opt.value as any })}
                          onMouseEnter={() => setPreviewFlexAlign?.(opt.value)}
                          onMouseLeave={() => setPreviewFlexAlign?.(null)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Section Padding Controls */}
          {(() => {
            const defaultPad = isMainSlide ? 0 : (themeSettings?.defaultSectionPadding ?? 40);
            return (
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">섹션 여백 설정</label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Row 1: 상단 여백 */}
                  <div 
                    className="sec-height-item"
                    onMouseEnter={() => setActivePaddingGuide({ sectionId: section.id, type: 'top' })}
                    onMouseLeave={() => setActivePaddingGuide(null)}
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#334155', userSelect: 'none' }}>
                      상단 여백
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        step={4}
                        value={section.paddingTop ?? defaultPad}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          if (rawVal === '') {
                            updateSection({ paddingTop: 0 });
                            return;
                          }
                          const val = parseInt(rawVal);
                          if (!isNaN(val)) {
                            const clamped = Math.min(300, Math.max(0, val));
                            updateSection({ paddingTop: clamped });
                          }
                        }}
                        onFocus={() => setActivePaddingGuide({ sectionId: section.id, type: 'top' })}
                        onBlur={() => setActivePaddingGuide(null)}
                      />
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', width: '22px', textAlign: 'right' }}>
                        px
                      </span>
                    </div>
                  </div>

                  {/* Row 2: 하단 여백 */}
                  <div 
                    className="sec-height-item"
                    onMouseEnter={() => setActivePaddingGuide({ sectionId: section.id, type: 'bottom' })}
                    onMouseLeave={() => setActivePaddingGuide(null)}
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#334155', userSelect: 'none' }}>
                      하단 여백
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        step={4}
                        value={section.paddingBottom ?? defaultPad}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          if (rawVal === '') {
                            updateSection({ paddingBottom: 0 });
                            return;
                          }
                          const val = parseInt(rawVal);
                          if (!isNaN(val)) {
                            const clamped = Math.min(300, Math.max(0, val));
                            updateSection({ paddingBottom: clamped });
                          }
                        }}
                        onFocus={() => setActivePaddingGuide({ sectionId: section.id, type: 'bottom' })}
                        onBlur={() => setActivePaddingGuide(null)}
                      />
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', width: '22px', textAlign: 'right' }}>
                        px
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Flex Layout Options: Hide for main-slide */}
          {!isMainSlide && (
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">흐름 정렬 방향</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                    section.flexDirection !== 'horizontal'
                      ? ''
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  style={section.flexDirection !== 'horizontal' ? {
                    backgroundColor: 'var(--theme-primary, #10b981)',
                    color: '#ffffff',
                    borderColor: 'var(--theme-primary, #10b981)',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                    fontWeight: '700'
                  } : {}}
                  onClick={() => updateSection({ flexDirection: 'vertical' })}
                >
                  세로 흐름 (Column)
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                    section.flexDirection === 'horizontal'
                      ? ''
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  style={section.flexDirection === 'horizontal' ? {
                    backgroundColor: 'var(--theme-primary, #10b981)',
                    color: '#ffffff',
                    borderColor: 'var(--theme-primary, #10b981)',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                    fontWeight: '700'
                  } : {}}
                  onClick={() => updateSection({ flexDirection: 'horizontal' })}
                >
                  가로 흐름 (Row)
                </button>
              </div>
            </div>
          )}

          {/* 요소 간격: Hide for main-slide */}
          {!isMainSlide && (
            <div className="property-group flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="group-title">요소 간격</label>
                <label className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer font-normal" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={section.flexGap === undefined}
                    onChange={(e) => updateSection({ flexGap: e.target.checked ? undefined : (themeSettings?.defaultFlexGap ?? 16) })}
                    style={{ width: '13px', height: '13px', margin: 0, marginRight: '4px' }}
                  />
                  기본값 상속
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  disabled={section.flexGap === undefined}
                  value={section.flexGap ?? (themeSettings?.defaultFlexGap ?? 16)}
                  onChange={(e) => updateSection({ flexGap: parseInt(e.target.value) })}
                />
                <span className="text-xs font-semibold w-12 text-right">{section.flexGap ?? (themeSettings?.defaultFlexGap ?? 16)}px</span>
              </div>
              <p className="text-[10px] text-gray-500" style={{ margin: 0, marginTop: '2px' }}>
                * 흐름 배치 모드에서는 마지막 요소를 제외하고 균등하게 사이 간격이 조절됩니다.
              </p>
            </div>
          )}

          {/* Background Color */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">배경 색상 (Background Color)</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={section.backgroundColor.startsWith('#') && section.backgroundColor.length === 7 ? section.backgroundColor : '#ffffff'}
                onChange={(e) => updateSection({ backgroundColor: e.target.value })}
              />
              <input
                type="text"
                value={section.backgroundColor}
                onChange={(e) => updateSection({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Background Image Source or Upload: Hide for main-slide */}
          {!isMainSlide && (
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">배경 이미지 설정</label>
              {section.backgroundImageName ? (
                <div className="flex items-center justify-between p-2 rounded border text-xs" style={{ background: 'var(--figma-bg)', border: '1px solid var(--figma-border)' }}>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="font-semibold truncate max-w-[160px]">{section.backgroundImageName.replace(/^section-[a-zA-Z0-9]+-bg-/, '')}</span>
                    <span className="text-[10px] text-muted-foreground" style={{ opacity: 0.6 }}>(업로드됨)</span>
                  </div>
                  <button
                    className="del-el-btn p-1"
                    onClick={() => updateSection({ backgroundImage: undefined, backgroundImageName: undefined })}
                    title="이미지 삭제"
                  >
                    <Trash2 size={12} style={{ color: 'var(--figma-danger)' }} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={section.backgroundImage || ''}
                    onChange={(e) => updateSection({ backgroundImage: e.target.value || undefined, backgroundImageName: undefined })}
                    placeholder="외부 이미지 URL 또는 파일 업로드"
                  />
                  
                  <label className="upload-btn-label" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    border: '1px dashed var(--figma-border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--figma-text)',
                    background: 'var(--figma-bg)',
                    textAlign: 'center'
                  }}>
                    <span>이미지 파일 업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          const cleanName = `section-${section.id}-bg-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                          updateSection({
                            backgroundImage: base64,
                            backgroundImageName: cleanName
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Background Image Options: Hide for main-slide */}
          {!isMainSlide && section.backgroundImage && (
            <div className="flex flex-col gap-5">
              {/* Background Position */}
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">배경 위치 (background-position)</label>
                <select
                  value={section.backgroundPosition || 'center'}
                  onChange={(e) => updateSection({ backgroundPosition: e.target.value })}
                >
                  <option value="center">center (가운데)</option>
                  <option value="top">top (위)</option>
                  <option value="bottom">bottom (아래)</option>
                  <option value="left">left (왼쪽)</option>
                  <option value="right">right (오른쪽)</option>
                  <option value="top left">top left (왼쪽 위)</option>
                  <option value="top right">top right (오른쪽 위)</option>
                </select>
              </div>

              {/* Background Size */}
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">배경 크기 (background-size)</label>
                <select
                  value={section.backgroundSize || 'cover'}
                  onChange={(e) => updateSection({ backgroundSize: e.target.value })}
                >
                  <option value="cover">cover (꽉 채우기 - 비율유지)</option>
                  <option value="contain">contain (비율 맞춤)</option>
                  <option value="auto">auto (원본 크기)</option>
                  <option value="100% 100%">100% 100% (비율 왜곡 채우기)</option>
                </select>
              </div>

              {/* Background Repeat */}
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">배경 반복 (background-repeat)</label>
                <select
                  value={section.backgroundRepeat || 'no-repeat'}
                  onChange={(e) => updateSection({ backgroundRepeat: e.target.value })}
                >
                  <option value="no-repeat">no-repeat (반복 없음)</option>
                  <option value="repeat">repeat (바둑판 반복)</option>
                  <option value="repeat-x">repeat-x (가로 반복)</option>
                  <option value="repeat-y">repeat-y (세로 반복)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activePageId === 'sitemap') {
    return (
      <div className="properties-panel">
        <div className="panel-header">
          <span style={{ fontSize: '15.5px', fontWeight: 700, color: '#0f172a' }}>사이트맵 (Site Map)</span>
        </div>
        <div className="properties-body p-5">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
            <span className="font-bold text-sm text-slate-800">시스템 자동 연동 페이지</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              사이트맵은 프로젝트 내의 모든 페이지(HTML) 목록을 실시간으로 자동 취합하여 생성하는 시스템 전용 페이지입니다.
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[11.5px] text-slate-500">
              * 메인 페이지와 함께 삭제가 불가능하도록 관리됩니다.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeElement) {
    let bodySectionIdx = 0;
    return (
      <div className="properties-panel">
        <div className="panel-header">
          <span style={{ fontSize: '15.5px', fontWeight: 700, color: '#0f172a' }}>페이지 구성</span>
        </div>
        
        <div className="properties-body flex-1 overflow-auto flex flex-col" style={{ padding: 0 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
          }}>
            {sections.map((sec, idx) => {
              let label = '';
              if (sec.sharedType === 'header') {
                label = '공통 헤더';
              } else if (sec.sharedType === 'footer') {
                label = '공통 푸터';
              } else if (sec.sectionPresetType === 'main-slide' || sec.id === 'sec-main-slide') {
                label = '메인 슬라이드';
              } else if (sec.sectionPresetType === 'features-grid') {
                label = '주요 특징';
              } else if (sec.sectionPresetType === 'promo-banner') {
                label = '고정 배경 배너';
              } else if (sec.sectionPresetType === 'card-slider') {
                label = '카드 슬라이드';
              } else {
                bodySectionIdx++;
                label = sec.sectionTitle || `섹션 ${bodySectionIdx}`;
              }
            
              const isFocused = (hoveredSectionId ? hoveredSectionId === sec.id : activeSectionId === sec.id);
              const isLast = idx === sections.length - 1;
            
              return (
                <div
                  key={sec.id}
                  onClick={() => {
                    setHoveredSectionId?.(null);
                    setActiveSectionId(sec.id);
                    setActiveElement(null);
                    setShowSectionDetail(true);
                    const targetSecEl = document.getElementById(`section-${sec.id}`) || document.querySelector(`.section-${sec.id}`);
                    if (targetSecEl) {
                      targetSecEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  onMouseEnter={() => {
                    setHoveredSectionId?.(sec.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredSectionId?.(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 22px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: isFocused ? '#f0f9ff' : '#ffffff',
                    borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: isFocused ? '#e0f2fe' : '#f1f5f9',
                    color: isFocused ? '#0284c7' : '#64748b',
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    flex: 1,
                    fontSize: '14px',
                    fontWeight: isFocused ? 700 : 600,
                    color: isFocused ? '#0369a1' : '#1e293b',
                    letterSpacing: '-0.2px',
                  }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Section Add Button */}
          <div style={{ width: '100%', backgroundColor: '#ffffff' }}>
            <button
              onClick={() => {
                const newSecId = `s_${Date.now()}`;
                const newSection: Section = {
                  id: newSecId,
                  height: 350,
                  backgroundColor: '#ffffff',
                  elements: [],
                };
                setSections(prev => {
                  const footerIdx = prev.findIndex(s => s.sharedType === 'footer');
                  if (footerIdx !== -1) {
                    const copy = [...prev];
                    copy.splice(footerIdx, 0, newSection);
                    return copy;
                  }
                  return [...prev, newSection];
                });
                setActiveSectionId(newSecId);
                setActiveElement(null);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '15px 22px',
                borderRadius: '0px',
                borderTop: '1px solid #e2e8f0',
                borderBottom: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f172a';
                e.currentTarget.style.color = '#ffffff';
                const iconEl = e.currentTarget.querySelector('.plus-icon-svg') as HTMLElement;
                if (iconEl) iconEl.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.color = '#0f172a';
                const iconEl = e.currentTarget.querySelector('.plus-icon-svg') as HTMLElement;
                if (iconEl) iconEl.style.color = '#0f172a';
              }}
            >
              <Plus className="plus-icon-svg" size={16} strokeWidth={2.2} style={{ color: '#0f172a', transition: 'color 0.15s ease' }} />
              <span>섹션 추가</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { sectionId, elementId } = activeElement;
  const section = sections.find(s => s.id === sectionId);
  const element = section?.elements.find(e => e.id === elementId);

  if (!section || !element) {
    return (
      <div className="properties-panel">
        <div className="panel-header">속성 설정</div>
        <div className="properties-empty">
          <span className="empty-text">요소를 찾을 수 없습니다.</span>
        </div>
      </div>
    );
  }

  // Update helper
  const updateElement = (fields: Partial<EditorElement>) => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        
        // 1. Update element properties
        const updatedElements = s.elements.map(el =>
          el.id === elementId ? { ...el, ...fields } : el
        );
        
        // 2. Resolve grid collisions if layout parameters changed
        const isLayoutChange = 'gridX' in fields || 'gridY' in fields || 'gridW' in fields || 'gridH' in fields;
        const finalElements = isLayoutChange ? resolveCollisions(updatedElements, elementId) : updatedElements;
        
        let nextHeight = s.height;
        
        // 3. Auto-adjust section height if custom margins push the boundaries
        if (s.heightMode !== 'auto' && ('marginBottom' in fields || 'marginRight' in fields)) {
          const isHorizontal = s.flexDirection === 'horizontal';
          const gap = s.flexGap !== undefined ? s.flexGap : 16;
          const pTop = s.paddingTop ?? 40;
          const pBottom = s.paddingBottom ?? 40;
          
          const getElementHeight = (el: EditorElement): number => {
            let baseHeight = 24;
            if (el.type === 'title') {
              baseHeight = 36;
            } else if (el.type === 'button') {
              const size = el.btnSize || 'medium';
              baseHeight = size === 'small' ? 32 : size === 'large' ? 48 : 40;
            } else if (el.type === 'image') {
              baseHeight = 180;
            } else if (el.type === 'three-column') {
              baseHeight = 160;
            }
            const mBottom = el.marginBottom ?? 0;
            return baseHeight + mBottom;
          };
          
          let minHeightLimit = 150;
          if (finalElements.length > 0) {
            if (isHorizontal) {
              const maxElHeight = finalElements.reduce((max, el) => Math.max(max, getElementHeight(el)), 0);
              minHeightLimit = maxElHeight + pTop + pBottom;
            } else {
              const totalElementsHeight = finalElements.reduce((sum, el) => sum + getElementHeight(el), 0);
              const totalGaps = (finalElements.length - 1) * gap;
              minHeightLimit = totalElementsHeight + totalGaps + pTop + pBottom;
            }
          }
          
          if (s.height < minHeightLimit) {
            nextHeight = minHeightLimit;
          }
        }
        
        return {
          ...s,
          height: nextHeight,
          elements: finalElements,
        };
      })
    );
  };

  // Delete element helper
  const deleteElement = () => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          elements: s.elements.filter(el => el.id !== elementId),
        };
      })
    );
    setActiveElement(null);
  };



  // --- Alignment & Width Filling Shortcuts ---
  const alignToLeftMargin = () => {
    updateElement({ gridX: 0 });
  };

  const alignToRightMargin = () => {
    updateElement({ gridX: 12 - element.gridW });
  };

  const alignToCenter = () => {
    const centerCol = Math.round((12 - element.gridW) / 2);
    updateElement({ gridX: Math.max(0, centerCol) });
  };
  return (
    <div className="properties-panel">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }}
            onClick={() => {
              setActiveElement(null);
              setShowSectionDetail(true);
            }}
            title="상위 섹션 설정으로 돌아가기"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="font-bold text-base text-slate-900">속성 설정 ({element.type})</span>
        </div>
      </div>

      <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
        
        {/* If Flex layout, show ordering and margins instead of Grid coordinates */}
        {section.layoutMode === 'flex' ? (
          <>


            {/* Margins */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">개별 여백 조절 (Margins)</label>
              
              {section.flexDirection !== 'horizontal' ? (
                <div className="input-block">
                  <span className="input-label">하단 여백 (Margin Bottom): {element.marginBottom ?? 0}px</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="4"
                    value={element.marginBottom ?? 0}
                    onChange={(e) => updateElement({ marginBottom: parseInt(e.target.value) })}
                  />
                </div>
              ) : (
                <div className="input-block">
                  <span className="input-label">우측 여백 (Margin Right): {element.marginRight ?? 0}px</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="4"
                    value={element.marginRight ?? 0}
                    onChange={(e) => updateElement({ marginRight: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 1. Layout & Alignment Shortcuts (User requirement) */}
            <div className="property-group">
              <label className="group-title">레이아웃 및 정렬 단축</label>
              <div className="shortcut-grid">
                <button className="shortcut-btn" onClick={alignToLeftMargin} title="가이드 좌측 밀착">
                  <MoveLeft size={14} />
                  <span>좌측 밀착</span>
                </button>
                <button className="shortcut-btn" onClick={alignToRightMargin} title="가이드 우측 밀착">
                  <MoveRight size={14} />
                  <span>우측 밀착</span>
                </button>
                <button className="shortcut-btn center-btn" onClick={alignToCenter} title="가이드 중앙 정렬">
                  <AlignCenter size={14} />
                  <span>가로 중앙</span>
                </button>
              </div>
            </div>

            {/* 2. Grid Coordinates info */}
            <div className="property-group">
              <label className="group-title">그리드 위치 및 크기 (12컬럼 기준)</label>
              <div className="grid-inputs-row">
                <div className="grid-input-item">
                  <span className="input-label">컬럼 시작 (X)</span>
                  <input
                    type="number"
                    min="0"
                    max={12 - element.gridW}
                    value={element.gridX}
                    onChange={(e) => updateElement({ gridX: Math.max(0, Math.min(11, parseInt(e.target.value) || 0)) })}
                  />
                </div>
                <div className="grid-input-item">
                  <span className="input-label">컬럼 너비 (W)</span>
                  <input
                    type="number"
                    min="1"
                    max={12 - element.gridX}
                    value={element.gridW}
                    onChange={(e) => updateElement({ gridW: Math.max(1, Math.min(12, parseInt(e.target.value) || 1)) })}
                  />
                </div>
              </div>
              <div className="grid-inputs-row mt-2">
                <div className="grid-input-item">
                  <span className="input-label">행 시작 (Y)</span>
                  <input
                    type="number"
                    min="0"
                    value={element.gridY}
                    onChange={(e) => updateElement({ gridY: Math.max(0, parseInt(e.target.value) || 0) })}
                  />
                </div>
                <div className="grid-input-item">
                  <span className="input-label">행 높이 (H)</span>
                  <input
                    type="number"
                    min="1"
                    value={element.gridH}
                    onChange={(e) => updateElement({ gridH: Math.max(1, parseInt(e.target.value) || 1) })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Width Mode Settings (Stretch vs Fit Content vs Fixed) */}
        <div className="property-group flex flex-col gap-2">
          <label className="group-title">가로 크기 설정</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 py-1.5 px-2 rounded text-xs border font-medium transition-all ${
                element.widthMode !== 'fit-content' && element.widthMode !== 'fixed'
                  ? ''
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              style={element.widthMode !== 'fit-content' && element.widthMode !== 'fixed' ? {
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderColor: '#0284c7',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
                fontWeight: '700'
              } : {}}
              onClick={() => updateElement({ gridX: 0, gridW: 12, widthMode: 'stretch' })}
              title="12컬럼 폭 전체를 가득 채우고 반응형 영역으로 설정합니다 (Stretch)"
            >
              채우기
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 px-2 rounded text-xs border font-medium transition-all ${
                element.widthMode === 'fit-content'
                  ? ''
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              style={element.widthMode === 'fit-content' ? {
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderColor: '#0284c7',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
                fontWeight: '700'
              } : {}}
              onClick={() => updateElement({ widthMode: 'fit-content' })}
              title="글자 내용의 폭만큼 너비를 자동으로 맞춥니다 (Hug Contents)"
            >
              콘텐츠 맞춤
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 px-2 rounded text-xs border font-medium transition-all ${
                element.widthMode === 'fixed'
                  ? ''
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              style={element.widthMode === 'fixed' ? {
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderColor: '#0284c7',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
                fontWeight: '700'
              } : {}}
              onClick={() => updateElement({ widthMode: 'fixed', fixedWidth: element.fixedWidth || 150 })}
              title="지정한 고정 크기로 너비를 고정합니다"
            >
              고정 너비
            </button>
          </div>
        </div>

        {/* Conditional Width Mode Customizations (Padding X / Fixed Width) */}
        {element.widthMode === 'fit-content' && element.type === 'button' && (
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">버튼 좌우 여백 (Padding X)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="60"
                step="2"
                value={element.paddingX ?? 24}
                onChange={(e) => updateElement({ paddingX: parseInt(e.target.value) })}
              />
              <span className="text-xs font-semibold w-12 text-right">{element.paddingX ?? 24}px</span>
            </div>
          </div>
        )}

        {element.widthMode === 'fixed' && (
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">고정 너비 설정</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="400"
                step="10"
                value={element.fixedWidth ?? 150}
                onChange={(e) => updateElement({ fixedWidth: parseInt(e.target.value) })}
              />
              <span className="text-xs font-semibold w-12 text-right">{element.fixedWidth ?? 150}px</span>
            </div>
          </div>
        )}

        {/* 3. Text Controls (for Title, Text, Button) */}
        {(element.type === 'title' || element.type === 'text' || element.type === 'button') && (
          <div className="property-group flex flex-col gap-3">
            <label className="group-title">텍스트 설정</label>

            {/* Content text */}
            <div className="input-block">
              <span className="input-label">내용</span>
              <textarea
                rows={3}
                value={element.content}
                onChange={(e) => updateElement({ content: e.target.value })}
              />
            </div>

            {/* Font Preset selector */}
            <div className="input-block">
              <span className="input-label">글자 스타일 프리셋</span>
              <select
                value={element.fontPresetId || ''}
                onChange={(e) => updateElement({ fontPresetId: e.target.value || undefined })}
              >
                <option value="">직접 지정 (Custom)</option>
                {(themeSettings?.fontPresets || []).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.fontSize})</option>
                ))}
              </select>
            </div>

            {element.fontPresetId && element.fontPresetId !== '' ? (
              <div className="p-2 rounded text-[11px] leading-relaxed" style={{ background: 'var(--figma-bg)', border: '1px solid var(--figma-border)', color: 'var(--figma-text-muted)', fontSize: '11px' }}>
                글꼴, 크기, 색상이 글로벌 프리셋 <strong>({element.fontPresetId})</strong>에 의해 자동 적용되고 있습니다. 상단 <strong>[기본 스타일]</strong> 버튼을 눌러 일괄 수정하시거나 프리셋을 '직접 지정'으로 변경하세요.
              </div>
            ) : (
              <>
                {/* Font Family selector */}
                <div className="input-block">
                  <span className="input-label">글꼴 (Google Fonts)</span>
                  <FontCustomSelect
                    currentFontName={element.fontFamily || 'Inter'}
                    onSelectFont={(fontName) => updateElement({ fontFamily: fontName })}
                  />
                </div>

                {/* Font Size & Color */}
                <div className="grid-inputs-row">
                  <div className="grid-input-item">
                    <span className="input-label">글자 크기 (px/rem)</span>
                    <input
                      type="text"
                      value={element.fontSize}
                      onChange={(e) => updateElement({ fontSize: e.target.value })}
                    />
                  </div>
                  <div className="grid-input-item">
                    <span className="input-label">글자 색상</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={element.color && element.color.startsWith('#') && element.color.length === 7 ? element.color : '#000000'}
                        onChange={(e) => updateElement({ color: e.target.value })}
                      />
                      <input
                        type="text"
                        value={element.color || ''}
                        onChange={(e) => updateElement({ color: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Text & Button Alignment */}
            <div className="input-block">
              <span className="input-label">{element.type === 'button' ? '버튼 및 내용 정렬' : '정렬'}</span>
              <div className="align-buttons-row">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    className={`align-btn ${element.align === align ? 'active' : ''}`}
                    onClick={() => updateElement({ align })}
                  >
                    {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                    <span style={{ textTransform: 'capitalize' }}>{align === 'left' ? '좌측' : align === 'center' ? '중앙' : '우측'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Button-specific styling */}
        {element.type === 'button' && (
          <div className="property-group flex flex-col gap-3">
            <label className="group-title">버튼 스타일 설정</label>

            {/* Button colors */}
            <div className="grid-inputs-row">
              <div className="grid-input-item">
                <span className="input-label">배경 색상</span>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={element.btnBgColor?.startsWith('#') ? element.btnBgColor : '#18a0fb'}
                    onChange={(e) => updateElement({ btnBgColor: e.target.value })}
                  />
                  <input
                    type="text"
                    value={element.btnBgColor || '#18a0fb'}
                    onChange={(e) => updateElement({ btnBgColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid-input-item">
                <span className="input-label">글자 색상</span>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={element.btnTextColor?.startsWith('#') ? element.btnTextColor : '#ffffff'}
                    onChange={(e) => updateElement({ btnTextColor: e.target.value })}
                  />
                  <input
                    type="text"
                    value={element.btnTextColor || '#ffffff'}
                    onChange={(e) => updateElement({ btnTextColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Button size and variant specifications */}
            <div className="grid-inputs-row">
              <div className="grid-input-item">
                <span className="input-label">버튼 규격 크기</span>
                <select
                  value={element.btnSize || 'medium'}
                  onChange={(e) => updateElement({ btnSize: e.target.value as any })}
                >
                  <option value="small">Small (소형)</option>
                  <option value="medium">Medium (중형)</option>
                  <option value="large">Large (대형)</option>
                </select>
              </div>
              <div className="grid-input-item">
                <span className="input-label">버튼 스타일 종류</span>
                <select
                  value={element.btnVariant || 'filled'}
                  onChange={(e) => updateElement({ btnVariant: e.target.value as any })}
                >
                  <option value="filled">Filled (채우기)</option>
                  <option value="outlined">Outlined (테두리)</option>
                  <option value="ghost">Ghost (투명)</option>
                </select>
              </div>
            </div>

            {/* Button border radius */}
            <div className="input-block">
              <span className="input-label">버튼 둥글기 (Border-Radius: {element.borderRadius ?? 6}px)</span>
              <input
                type="range"
                min="0"
                max="30"
                value={element.borderRadius ?? 6}
                onChange={(e) => updateElement({ borderRadius: parseInt(e.target.value) })}
              />
            </div>

            {/* SVG Icon Pack */}
            <div className="input-block">
              <span className="input-label">SVG 아이콘 추가</span>
              <select
                value={element.iconType || 'none'}
                onChange={(e) => updateElement({ iconType: e.target.value as any })}
              >
                <option value="none">아이콘 없음</option>
                {ICON_TEMPLATES.map(t => (
                  <option key={t.type} value={t.type}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Icon position */}
            {element.iconType && element.iconType !== 'none' && (
              <div className="input-block">
                <span className="input-label">아이콘 위치</span>
                <div className="align-buttons-row">
                  {(['before', 'after'] as const).map((pos) => (
                    <button
                      key={pos}
                      className={`align-btn ${element.iconPosition === pos ? 'active' : ''}`}
                      onClick={() => updateElement({ iconPosition: pos })}
                    >
                      <span>{pos === 'before' ? '텍스트 앞' : '텍스트 뒤'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔗 Button Link & Click Action Control */}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="group-title mb-0 flex items-center gap-1.5 text-xs text-[#0f172a] font-bold">
                  <ExternalLink size={13} className="text-[#18a0fb]" />
                  <span>버튼 클릭 동작 설정</span>
                </label>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold border border-blue-100">
                  {element.linkType === 'page' ? '페이지 이동' : element.linkType === 'url' ? '외부 링크' : '동작 없음'}
                </span>
              </div>

              <div className="input-block">
                <span className="input-label font-semibold text-slate-700">클릭 시 실행할 동작</span>
                <select
                  value={element.linkType || 'none'}
                  onChange={(e) => updateElement({ linkType: e.target.value as any })}
                  className="w-full"
                >
                  <option value="none">없음 (일반 디자인 버튼)</option>
                  <option value="page">페이지 이동 (내부 연결)</option>
                  <option value="url">외부 웹사이트 링크</option>
                </select>
              </div>

              {/* Action: Internal Page Navigation */}
              {element.linkType === 'page' && (
                <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="input-block">
                    <span className="input-label font-semibold text-slate-700">이동할 페이지 선택</span>
                    <select
                      value={element.linkPageId || (pages && pages[0]?.id) || 'main'}
                      onChange={(e) => updateElement({ linkPageId: e.target.value })}
                      className="w-full bg-white"
                    >
                      {(pages || []).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.fileName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {onNavigatePage && (
                    <button
                      type="button"
                      className="w-full py-2 px-3 rounded-md bg-[#18a0fb] hover:bg-[#0c8ce9] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                      onClick={() => {
                        const targetId = element.linkPageId || (pages && pages[0]?.id) || 'main';
                        const targetPage = (pages || []).find(p => p.id === targetId);
                        onNavigatePage(targetId);
                        alert(`'${targetPage?.name || '페이지'}' (${targetPage?.fileName || 'html'})로 성공적으로 이동했습니다!`);
                      }}
                    >
                      <ArrowRight size={14} />
                      <span>연결된 페이지로 지금 이동 확인</span>
                    </button>
                  )}
                </div>
              )}

              {/* Action: External URL */}
              {element.linkType === 'url' && (
                <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="input-block">
                    <span className="input-label font-semibold text-slate-700">이동할 웹사이트 URL</span>
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={element.linkUrl || ''}
                      onChange={(e) => updateElement({ linkUrl: e.target.value })}
                      className="w-full bg-white"
                    />
                  </div>

                  <div className="input-block">
                    <span className="input-label font-semibold text-slate-700 font-sans">열기 방식</span>
                    <select
                      value={element.linkTarget || '_blank'}
                      onChange={(e) => updateElement({ linkTarget: e.target.value as any })}
                      className="w-full bg-white"
                    >
                      <option value="_blank">새 탭에서 열기 (_blank)</option>
                      <option value="_self">현재 창에서 이동 (_self)</option>
                    </select>
                  </div>

                  {element.linkUrl && (
                    <button
                      type="button"
                      className="w-full py-1.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      onClick={() => window.open(element.linkUrl, element.linkTarget || '_blank')}
                    >
                      <ExternalLink size={14} />
                      <span>외부 링크 바로 테스트</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Image-specific styling */}
        {element.type === 'image' && (
          <div className="property-group flex flex-col gap-3">
            <label className="group-title">이미지 설정</label>

            {/* Image Source or Upload */}
            <div className="input-block">
              <span className="input-label">이미지 파일</span>
              {element.imageName ? (
                <div className="flex items-center justify-between p-2 rounded border text-xs mt-1" style={{ background: 'var(--figma-bg)', border: '1px solid var(--figma-border)' }}>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="font-semibold truncate max-w-[160px]">{element.imageName.replace(/^element-[a-zA-Z0-9]+-/, '')}</span>
                    <span className="text-[10px] text-muted-foreground" style={{ opacity: 0.6 }}>(업로드됨)</span>
                  </div>
                  <button
                    className="del-el-btn p-1"
                    onClick={() => updateElement({ src: '', imageName: undefined })}
                    title="이미지 삭제"
                  >
                    <Trash2 size={12} style={{ color: 'var(--figma-danger)' }} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-1">
                  <input
                    type="text"
                    value={element.src || ''}
                    onChange={(e) => updateElement({ src: e.target.value, imageName: undefined })}
                    placeholder="외부 이미지 URL 또는 파일 업로드"
                  />
                  
                  <label className="upload-btn-label" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    border: '1px dashed var(--figma-border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--figma-text)',
                    background: 'var(--figma-bg)',
                    textAlign: 'center'
                  }}>
                    <span>이미지 파일 업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          const cleanName = `element-${element.id}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                          updateElement({
                            src: base64,
                            imageName: cleanName
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Image border radius */}
            <div className="input-block">
              <span className="input-label">모서리 둥글기 (Border-Radius: {element.borderRadius ?? 0}px)</span>
              <input
                type="range"
                min="0"
                max="50"
                value={element.borderRadius ?? 0}
                onChange={(e) => updateElement({ borderRadius: parseInt(e.target.value) })}
              />
            </div>

            {/* Image box shadow preset */}
            <div className="input-block">
              <span className="input-label">그림자 효과 (Box-Shadow)</span>
              <select
                value={element.boxShadow || 'none'}
                onChange={(e) => updateElement({ boxShadow: e.target.value })}
              >
                <option value="none">없음 (None)</option>
                <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)">약하게 (Light)</option>
                <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)">보통 (Medium)</option>
                <option value="0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)">강하게 (Dark)</option>
              </select>
            </div>
          </div>
        )}

        {/* 6. Three-column box specific styling */}
        {element.type === 'three-column' && (() => {
          const titlePreset = (themeSettings?.fontPresets || []).find(p => p.id === element.colTitlePresetId);
          const titlePresetName = titlePreset ? titlePreset.name : '';

          const textPreset = (themeSettings?.fontPresets || []).find(p => p.id === element.colTextPresetId);
          const textPresetName = textPreset ? textPreset.name : '';

          return (
            <div className="property-group flex flex-col gap-3">
              <label className="group-title">3열 글상자 설정</label>

              {/* Align controls for columns */}
              <div className="input-block">
                <span className="input-label">정렬</span>
                <div className="align-buttons-row">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      className={`align-btn ${element.align === align ? 'active' : ''}`}
                      onClick={() => updateElement({ align })}
                    >
                      {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                      <span style={{ textTransform: 'capitalize' }}>{align === 'left' ? '좌측' : align === 'center' ? '중앙' : '우측'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gaps */}
              <div className="input-block">
                <span className="input-label">열 간격 (Column Gap: {element.colGap ?? 24}px)</span>
                <input
                  type="range"
                  min="12"
                  max="64"
                  step="4"
                  value={element.colGap ?? 24}
                  onChange={(e) => updateElement({ colGap: parseInt(e.target.value) })}
                />
              </div>

              <div className="input-block">
                <span className="input-label">열 내부 간격 (Content Gap: {element.colContentGap ?? 8}px)</span>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={element.colContentGap ?? 8}
                  onChange={(e) => updateElement({ colContentGap: parseInt(e.target.value) })}
                />
              </div>

              <div className="divider" style={{ margin: '8px 0', borderBottom: '1px solid var(--figma-border)' }}></div>

              {/* Global column styling */}
              <div className="flex flex-col gap-3 p-2 rounded" style={{ background: 'var(--figma-bg)', border: '1px solid var(--figma-border)' }}>
                <span className="font-semibold text-xs text-blue-400">전체 스타일 설정</span>
                
                {/* Title Font Preset (Figma style) */}
                <div className="input-block">
                  <span className="input-label">타이틀 텍스트 스타일</span>
                  {element.colTitlePresetId ? (
                    <div className="preset-linked-pill flex items-center justify-between p-1.5 px-2.5 rounded border" style={{ background: 'rgba(24, 160, 251, 0.05)', borderColor: 'rgba(24, 160, 251, 0.3)' }}>
                      <div className="flex items-center gap-2">
                        <Grid size={11} style={{ color: 'var(--figma-accent)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--figma-accent)' }}>{titlePresetName || element.colTitlePresetId}</span>
                      </div>
                      <button 
                        className="del-el-btn p-0.5 hover:bg-gray-700 rounded transition-all"
                        onClick={() => updateElement({ colTitlePresetId: undefined })}
                        title="스타일 연결 해제 (Detach style)"
                      >
                        <X size={11} style={{ color: 'var(--figma-text-muted)' }} />
                      </button>
                    </div>
                  ) : (
                    <div className="preset-unlinked-wrapper flex flex-col gap-2">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            updateElement({ colTitlePresetId: e.target.value });
                          }
                        }}
                        style={{ fontSize: '11.5px', background: 'var(--figma-bg)', border: '1px solid var(--figma-border)', color: 'var(--figma-text)', padding: '6px', borderRadius: '4px' }}
                      >
                        <option value="">스타일 프리셋 연결... (Link Style)</option>
                        {(themeSettings?.fontPresets || []).map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.fontSize})</option>
                        ))}
                      </select>
                      
                      {/* Title custom styling */}
                      <div className="grid-inputs-row">
                        <div className="grid-input-item">
                          <span className="input-label">글자 크기</span>
                          <input
                            type="text"
                            value={element.colTitleSize || '18px'}
                            onChange={(e) => updateElement({ colTitleSize: e.target.value })}
                          />
                        </div>
                        <div className="grid-input-item">
                          <span className="input-label">글자 색상</span>
                          <div className="color-picker-wrapper">
                            <input
                              type="color"
                              value={element.colTitleColor?.startsWith('#') && element.colTitleColor.length === 7 ? element.colTitleColor : '#000000'}
                              onChange={(e) => updateElement({ colTitleColor: e.target.value })}
                            />
                            <input
                              type="text"
                              value={element.colTitleColor || ''}
                              onChange={(e) => updateElement({ colTitleColor: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Font Preset (Figma style) */}
                <div className="input-block mt-1">
                  <span className="input-label">본문 텍스트 스타일</span>
                  {element.colTextPresetId ? (
                    <div className="preset-linked-pill flex items-center justify-between p-1.5 px-2.5 rounded border" style={{ background: 'rgba(24, 160, 251, 0.05)', borderColor: 'rgba(24, 160, 251, 0.3)' }}>
                      <div className="flex items-center gap-2">
                        <Grid size={11} style={{ color: 'var(--figma-accent)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--figma-accent)' }}>{textPresetName || element.colTextPresetId}</span>
                      </div>
                      <button 
                        className="del-el-btn p-0.5 hover:bg-gray-700 rounded transition-all"
                        onClick={() => updateElement({ colTextPresetId: undefined })}
                        title="스타일 연결 해제 (Detach style)"
                      >
                        <X size={11} style={{ color: 'var(--figma-text-muted)' }} />
                      </button>
                    </div>
                  ) : (
                    <div className="preset-unlinked-wrapper flex flex-col gap-2">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            updateElement({ colTextPresetId: e.target.value });
                          }
                        }}
                        style={{ fontSize: '11.5px', background: 'var(--figma-bg)', border: '1px solid var(--figma-border)', color: 'var(--figma-text)', padding: '6px', borderRadius: '4px' }}
                      >
                        <option value="">스타일 프리셋 연결... (Link Style)</option>
                        {(themeSettings?.fontPresets || []).map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.fontSize})</option>
                        ))}
                      </select>
                      
                      {/* Text custom styling */}
                      <div className="grid-inputs-row">
                        <div className="grid-input-item">
                          <span className="input-label">글자 크기</span>
                          <input
                            type="text"
                            value={element.colTextSize || '14px'}
                            onChange={(e) => updateElement({ colTextSize: e.target.value })}
                          />
                        </div>
                        <div className="grid-input-item">
                          <span className="input-label">글자 색상</span>
                          <div className="color-picker-wrapper">
                            <input
                              type="color"
                              value={element.colTextColor?.startsWith('#') && element.colTextColor.length === 7 ? element.colTextColor : '#000000'}
                              onChange={(e) => updateElement({ colTextColor: e.target.value })}
                            />
                            <input
                              type="text"
                              value={element.colTextColor || ''}
                              onChange={(e) => updateElement({ colTextColor: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Icon Style */}
                <div className="grid-inputs-row">
                  <div className="grid-input-item">
                    <span className="input-label">아이콘 색상</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={element.colIconColor?.startsWith('#') && element.colIconColor.length === 7 ? element.colIconColor : '#000000'}
                        onChange={(e) => updateElement({ colIconColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={element.colIconColor || ''}
                        onChange={(e) => updateElement({ colIconColor: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid-input-item flex flex-col justify-end">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                      <input
                        type="checkbox"
                        checked={!!element.colShowIconBg}
                        onChange={(e) => updateElement({ colShowIconBg: e.target.checked })}
                      />
                      <span>원배경 사용</span>
                    </label>
                  </div>
                </div>

                {/* Icon Bg Color */}
                {element.colShowIconBg && (
                  <div className="input-block">
                    <span className="input-label">원배경 색상</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={element.colIconBgColor?.startsWith('#') && element.colIconBgColor.length === 7 ? element.colIconBgColor : '#e0e7ff'}
                        onChange={(e) => updateElement({ colIconBgColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={element.colIconBgColor || ''}
                        onChange={(e) => updateElement({ colIconBgColor: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="divider" style={{ margin: '8px 0', borderBottom: '1px solid var(--figma-border)' }}></div>

              {/* Column 1 Controls */}
              <div className="flex flex-col gap-2 p-2 rounded" style={{ background: 'var(--figma-bg)', border: '1px solid var(--figma-border)' }}>
                <span className="font-semibold text-xs text-blue-400">1열 설정</span>
                <div className="input-block">
                  <span className="input-label">아이콘</span>
                  <select
                    value={element.col1Icon || 'none'}
                    onChange={(e) => updateElement({ col1Icon: e.target.value as any })}
                  >
                    <option value="none">아이콘 없음</option>
                    {ICON_TEMPLATES.map(t => (
                      <option key={t.type} value={t.type}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-block">
                  <span className="input-label">타이틀</span>
                  <input
                    type="text"
                    value={element.col1Title || ''}
                    onChange={(e) => updateElement({ col1Title: e.target.value })}
                    placeholder="1열 타이틀"
                  />
                </div>
                <div className="input-block">
                  <span className="input-label">본문 내용</span>
                  <textarea
                    rows={3}
                    value={element.col1Text || ''}
                    onChange={(e) => updateElement({ col1Text: e.target.value })}
                    placeholder="1열 본문"
                  />
                </div>
              </div>

              {/* Column 2 Controls */}
              <div className="flex flex-col gap-2 p-2 rounded mt-2" style={{ background: 'var(--figma-bg)', border: '1px solid var(--figma-border)' }}>
                <span className="font-semibold text-xs text-blue-400">2열 설정</span>
                <div className="input-block">
                  <span className="input-label">아이콘</span>
                  <select
                    value={element.col2Icon || 'none'}
                    onChange={(e) => updateElement({ col2Icon: e.target.value as any })}
                  >
                    <option value="none">아이콘 없음</option>
                    {ICON_TEMPLATES.map(t => (
                      <option key={t.type} value={t.type}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-block">
                  <span className="input-label">타이틀</span>
                  <input
                    type="text"
                    value={element.col2Title || ''}
                    onChange={(e) => updateElement({ col2Title: e.target.value })}
                    placeholder="2열 타이틀"
                  />
                </div>
                <div className="input-block">
                  <span className="input-label">본문 내용</span>
                  <textarea
                    rows={3}
                    value={element.col2Text || ''}
                    onChange={(e) => updateElement({ col2Text: e.target.value })}
                    placeholder="2열 본문"
                  />
                </div>
              </div>

              {/* Column 3 Controls */}
              <div className="flex flex-col gap-2 p-2 rounded mt-2" style={{ background: 'var(--figma-bg)', border: '1px solid var(--figma-border)' }}>
                <span className="font-semibold text-xs text-blue-400">3열 설정</span>
                <div className="input-block">
                  <span className="input-label">아이콘</span>
                  <select
                    value={element.col3Icon || 'none'}
                    onChange={(e) => updateElement({ col3Icon: e.target.value as any })}
                  >
                    <option value="none">아이콘 없음</option>
                    {ICON_TEMPLATES.map(t => (
                      <option key={t.type} value={t.type}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-block">
                  <span className="input-label">타이틀</span>
                  <input
                    type="text"
                    value={element.col3Title || ''}
                    onChange={(e) => updateElement({ col3Title: e.target.value })}
                    placeholder="3열 타이틀"
                  />
                </div>
                <div className="input-block">
                  <span className="input-label">본문 내용</span>
                  <textarea
                    rows={3}
                    value={element.col3Text || ''}
                    onChange={(e) => updateElement({ col3Text: e.target.value })}
                    placeholder="3열 본문"
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Legal Document Property Panel */}
        {element.type === 'legal-doc' && (
              <div className="property-group flex flex-col gap-4">
                <label className="group-title">약관 문서 설정</label>

                {/* Color pickers */}
                <div className="grid-inputs-row">
                  <div className="grid-input-item">
                    <span className="input-label">조항 제목 색상</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={element.legalHeaderColor?.startsWith('#') ? element.legalHeaderColor : '#0f172a'}
                        onChange={(e) => updateElement({ legalHeaderColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={element.legalHeaderColor || '#0f172a'}
                        onChange={(e) => updateElement({ legalHeaderColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-input-item">
                    <span className="input-label">번호 강조 색상</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={element.legalNumberColor?.startsWith('#') ? element.legalNumberColor : '#0284c7'}
                        onChange={(e) => updateElement({ legalNumberColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={element.legalNumberColor || '#0284c7'}
                        onChange={(e) => updateElement({ legalNumberColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Articles Manager */}
                <div className="input-block flex flex-col gap-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="input-label font-bold text-slate-800">조항 목록 관리</span>
                    <button
                      type="button"
                      className="px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded text-xs font-semibold border border-sky-200 transition-all flex items-center gap-1"
                      onClick={() => {
                        const current = element.legalArticles || [];
                        const nextArtNum = current.length + 1;
                        const nextId = `art-${Date.now()}`;
                        const newArticle: any = {
                          id: nextId,
                          title: `Article ${nextArtNum}. 새로운 조항 제목`,
                          clauses: [
                            {
                              id: `c-${Date.now()}-1`,
                              num: `${nextArtNum}.1`,
                              content: '새로운 조항에 들어갈 상세 내용을 입력하세요.',
                            }
                          ]
                        };
                        updateElement({ legalArticles: [...current, newArticle] });
                        setExpandedArticleId(nextId);
                      }}
                    >
                      <Plus size={13} />
                      <span>조항 추가</span>
                    </button>
                  </div>

                  <div className="articles-list flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {(element.legalArticles || []).map((art, idx) => {
                      const isExpanded = expandedArticleId === art.id || (expandedArticleId === null && idx === 0);

                      return (
                        <div
                          key={art.id || idx}
                          className={`article-item-card rounded-lg border transition-all ${
                            isExpanded ? 'border-sky-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80'
                          }`}
                        >
                          {/* Accordion Item Header Bar */}
                          <div
                            className="flex items-center justify-between p-2 px-2.5 cursor-pointer select-none"
                            onClick={() => setExpandedArticleId(isExpanded ? '' : art.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200/90 text-slate-800">
                                #{idx + 1} 조항
                              </span>
                              {art.num && (
                                <span className="text-xs font-extrabold text-sky-600">
                                  [{art.num}]
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-all"
                                onClick={() => setExpandedArticleId(isExpanded ? '' : art.id)}
                                title={isExpanded ? '접기' : '펼치기'}
                              >
                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                              </button>
                              <button
                                type="button"
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                onClick={() => {
                                  const updated = (element.legalArticles || []).filter(a => a.id !== art.id);
                                  updateElement({ legalArticles: updated });
                                }}
                                title="조항 삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Accordion Item Content (Expanded Fields) */}
                          {isExpanded && (
                            <div className="p-3 pt-2 border-t border-slate-100 flex flex-col gap-3 bg-white rounded-b-lg">
                              {/* 1. Article Title Header */}
                              <div className="input-block">
                                <span className="input-label font-bold text-slate-800">조 대표 제목 (Article Title)</span>
                                <input
                                  type="text"
                                  value={art.title || ''}
                                  onChange={(e) => {
                                    const updated = (element.legalArticles || []).map(a => a.id === art.id ? { ...a, title: e.target.value } : a);
                                    updateElement({ legalArticles: updated });
                                  }}
                                  className="w-full p-2 rounded border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500 font-semibold"
                                  placeholder="예: Article 1. Rules and Institution"
                                />
                              </div>

                              {/* 2. Clauses List (항 목록: 1.1, 1.2, 1.3) Manager */}
                              <div className="clauses-block pt-2 border-t border-slate-100 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <span className="input-label font-bold text-sky-800">항(Clause) 목록 (1.1, 1.2, 1.3...)</span>
                                  <button
                                    type="button"
                                    className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded text-[11px] font-semibold transition-all border border-sky-200 flex items-center gap-1"
                                    onClick={() => {
                                      const currentClauses = (art.clauses && art.clauses.length > 0)
                                        ? art.clauses
                                        : [{ id: `c-${Date.now()}-0`, num: art.num || '1.1', content: art.content || '', subItems: art.subItems }];

                                      const artIndex = idx + 1;
                                      const nextClauseNum = `${artIndex}.${currentClauses.length + 1}`;

                                      const newClause = {
                                        id: `c-${Date.now()}`,
                                        num: nextClauseNum,
                                        content: '새로운 항 본문 내용을 입력하세요.',
                                      };

                                      const updatedArticles = (element.legalArticles || []).map(a => 
                                        a.id === art.id ? { ...a, clauses: [...currentClauses, newClause] } : a
                                      );
                                      updateElement({ legalArticles: updatedArticles });
                                    }}
                                  >
                                    <Plus size={12} />
                                    <span>항 추가 (1.2, 1.3...)</span>
                                  </button>
                                </div>

                                {/* List of Clauses inside Article */}
                                {(() => {
                                  const clauses = (art.clauses && art.clauses.length > 0)
                                    ? art.clauses
                                    : [{ id: `c-${art.id}-default`, num: art.num || `${idx + 1}.1`, content: art.content || '', subItems: art.subItems }];

                                  return (
                                    <div className="flex flex-col gap-3">
                                      {clauses.map((clause, cIdx) => (
                                        <div key={clause.id || cIdx} className="clause-card p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col gap-2 relative">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10.5px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                                              #{cIdx + 1} 항
                                            </span>
                                            {clauses.length > 1 && (
                                              <button
                                                type="button"
                                                className="text-[11px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-0.5"
                                                onClick={() => {
                                                  const updatedClauses = clauses.filter((_, i) => i !== cIdx);
                                                  const updatedArticles = (element.legalArticles || []).map(a => 
                                                    a.id === art.id ? { ...a, clauses: updatedClauses } : a
                                                  );
                                                  updateElement({ legalArticles: updatedArticles });
                                                }}
                                              >
                                                <Trash2 size={11} />
                                                <span>항 삭제</span>
                                              </button>
                                            )}
                                          </div>

                                          <div className="grid-inputs-row">
                                            <div className="grid-input-item" style={{ flex: '0 0 70px' }}>
                                              <span className="input-label">항 번호</span>
                                              <input
                                                type="text"
                                                value={clause.num || ''}
                                                onChange={(e) => {
                                                  const updatedClauses = clauses.map((c, i) => i === cIdx ? { ...c, num: e.target.value } : c);
                                                  const updatedArticles = (element.legalArticles || []).map(a => a.id === art.id ? { ...a, clauses: updatedClauses } : a);
                                                  updateElement({ legalArticles: updatedArticles });
                                                }}
                                                className="w-full p-1 px-2 rounded border border-slate-200 text-xs bg-white font-bold text-sky-700"
                                                placeholder="1.1"
                                              />
                                            </div>
                                            <div className="grid-input-item flex-1">
                                              <span className="input-label">항 본문 내용</span>
                                              <textarea
                                                rows={2}
                                                value={clause.content || ''}
                                                onChange={(e) => {
                                                  const updatedClauses = clauses.map((c, i) => i === cIdx ? { ...c, content: e.target.value } : c);
                                                  const updatedArticles = (element.legalArticles || []).map(a => a.id === art.id ? { ...a, clauses: updatedClauses } : a);
                                                  updateElement({ legalArticles: updatedArticles });
                                                }}
                                                className="w-full p-1.5 rounded border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
                                                placeholder="항 내용을 입력하세요."
                                              />
                                            </div>
                                          </div>

                                          {/* Sub-items (하위 세부 호 i., ii.) Editor */}
                                          <div className="subitems-block pt-1.5 border-t border-slate-200/60 flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10.5px] font-bold text-slate-600">하위 세부 호 (i., ii.)</span>
                                              <button
                                                type="button"
                                                className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200 flex items-center gap-0.5 transition-all"
                                                onClick={() => {
                                                  const currentSubs = clause.subItems || [];
                                                  const romanNums = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.'];
                                                  const nextSubNum = romanNums[currentSubs.length] || `${currentSubs.length + 1}.`;
                                                  const newSub = {
                                                    id: `sub-${Date.now()}`,
                                                    num: nextSubNum,
                                                    content: '하위 세부 내용을 입력하세요.',
                                                  };
                                                  const updatedClauses = clauses.map((c, i) => i === cIdx ? { ...c, subItems: [...currentSubs, newSub] } : c);
                                                  const updatedArticles = (element.legalArticles || []).map(a => a.id === art.id ? { ...a, clauses: updatedClauses } : a);
                                                  updateElement({ legalArticles: updatedArticles });
                                                }}
                                              >
                                                <Plus size={10} />
                                                <span>세부 호 추가</span>
                                              </button>
                                            </div>

                                            {(clause.subItems || []).length > 0 && (
                                              <div className="flex flex-col gap-1.5 bg-white p-1.5 rounded border border-slate-200/80">
                                                {(clause.subItems || []).map((sub, sIdx) => (
                                                  <div key={sub.id || sIdx} className="flex items-center gap-1.5">
                                                    <input
                                                      type="text"
                                                      value={sub.num || ''}
                                                      onChange={(e) => {
                                                        const updatedSubs = (clause.subItems || []).map((s, i) => i === sIdx ? { ...s, num: e.target.value } : s);
                                                        const updatedClauses = clauses.map((c, i) => i === cIdx ? { ...c, subItems: updatedSubs } : c);
                                                        const updatedArticles = (element.legalArticles || []).map(a => a.id === art.id ? { ...a, clauses: updatedClauses } : a);
                                                        updateElement({ legalArticles: updatedArticles });
                                                      }}
                                                      className="w-10 p-0.5 rounded border border-slate-200 text-[11px] bg-slate-50 text-center font-bold text-slate-600 shrink-0"
                                                      placeholder="i."
                                                    />
                                                    <input
                                                      type="text"
                                                      value={sub.content || ''}
                                                      onChange={(e) => {
                                                        const updatedSubs = (clause.subItems || []).map((s, i) => i === sIdx ? { ...s, content: e.target.value } : s);
                                                        const updatedClauses = clauses.map((c, i) => i === cIdx ? { ...c, subItems: updatedSubs } : c);
                                                        const updatedArticles = (element.legalArticles || []).map(a => a.id === art.id ? { ...a, clauses: updatedClauses } : a);
                                                        updateElement({ legalArticles: updatedArticles });
                                                      }}
                                                      className="flex-1 p-0.5 px-1.5 rounded border border-slate-200 text-[11px] bg-white text-slate-700 min-w-0"
                                                      placeholder="세부 내용"
                                                    />
                                                    <button
                                                      type="button"
                                                      className="p-0.5 text-red-400 hover:text-red-600 rounded transition-all shrink-0"
                                                      onClick={() => {
                                                        const updatedSubs = (clause.subItems || []).filter((_, i) => i !== sIdx);
                                                        const updatedClauses = clauses.map((c, i) => i === cIdx ? { ...c, subItems: updatedSubs } : c);
                                                        const updatedArticles = (element.legalArticles || []).map(a => a.id === art.id ? { ...a, clauses: updatedClauses } : a);
                                                        updateElement({ legalArticles: updatedArticles });
                                                      }}
                                                      title="삭제"
                                                    >
                                                      <X size={12} />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

        {/* Full-width Element Delete Button */}
        <div className="pt-4 mt-2 border-t border-red-100 flex flex-col">
          <button
            type="button"
            className="w-full py-3 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            onClick={deleteElement}
            title="현재 선택된 요소를 삭제합니다"
          >
            <Trash2 size={16} />
            <span>해당 요소 삭제하기</span>
          </button>
        </div>
      </div>

    </div>
  );
};
