import React, { useState, useEffect, useRef } from 'react';
import { Section, EditorElement, ThemeSettings, Page, GuidelineWidth } from '../types';
import { SUPPORTED_FONTS, findSupportedFont } from '../utils/fontManager';
import { ICON_TEMPLATES } from '../utils/iconTemplates';
import { AlignLeft, AlignCenter, AlignRight, MoveLeft, MoveRight, Trash2, X, Grid, ExternalLink, ArrowRight, ChevronLeft, Plus, Check, ChevronDown } from 'lucide-react';
import { resolveCollisions } from '../utils/collision';

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
  previewFlexAlign?: string | null;
  setPreviewFlexAlign?: (align: string | null) => void;
  previewHeaderLogoFont?: string | null;
  setPreviewHeaderLogoFont?: (font: string | null) => void;
}

const FontCustomSelect: React.FC<{
  currentFontName: string;
  onSelectFont: (fontName: string) => void;
  onHoverFont: (fontName: string | null) => void;
}> = ({ currentFontName, onSelectFont, onHoverFont }) => {
  const [isOpen, setIsOpen] = useState(false);
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
  }, [currentFontName, isOpen, selectedFont]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onHoverFont(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onHoverFont]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const itemEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (itemEl) {
        itemEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(highlightedIndex + 1, SUPPORTED_FONTS.length - 1);
      setHighlightedIndex(nextIndex);
      onHoverFont(SUPPORTED_FONTS[nextIndex].name);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(highlightedIndex - 1, 0);
      setHighlightedIndex(prevIndex);
      onHoverFont(SUPPORTED_FONTS[prevIndex].name);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (SUPPORTED_FONTS[highlightedIndex]) {
        onSelectFont(SUPPORTED_FONTS[highlightedIndex].name);
        setIsOpen(false);
        onHoverFont(null);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      onHoverFont(null);
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
        onClick={() => setIsOpen(!isOpen)}
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
          onMouseLeave={() => onHoverFont(null)}
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
                  onSelectFont(f.name);
                  setIsOpen(false);
                }}
                onMouseEnter={() => {
                  setHighlightedIndex(idx);
                  onHoverFont(f.name);
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
                {isSelected && <Check size={14} strokeWidth={2.5} style={{ color: '#0284c7' }} />}
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
  previewFlexAlign,
  setPreviewFlexAlign,
  previewHeaderLogoFont: _previewHeaderLogoFont,
  setPreviewHeaderLogoFont,
}) => {
  const [showSectionDetail, setShowSectionDetail] = useState<boolean>(true);

  useEffect(() => {
    if (activeSectionId && !activeElement) {
      setShowSectionDetail(true);
    }
  }, [activeSectionId]);

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
            
            {/* 0. Section Width (Guideline) settings */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">가로폭</label>
              <div className="flex gap-2">
                {(['100%', '80%', '60%'] as const).map((width) => (
                  <button
                    key={width}
                    type="button"
                    className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                      (section.guidelineWidth || '80%') === width
                        ? 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => updateSection({ guidelineWidth: width })}
                    onMouseEnter={() => setHoveredGuidelineWidth?.(width)}
                    onMouseLeave={() => setHoveredGuidelineWidth?.(null)}
                  >
                    {width}
                  </button>
                ))}
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
                          <label className="image-upload-label" style={{ flex: 1, textAlign: 'center', padding: '6px', background: 'var(--theme-primary)', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
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

            {/* 3. Spacing Settings */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">헤더 간격 설정</label>
              <div className="input-block">
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
                    <input
                      type="text"
                      value={section.headerMenuSize || '13px'}
                      onChange={(e) => updateSection({ headerMenuSize: e.target.value })}
                    />
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
                  <select
                    value={section.headerMenuFont || 'Inter'}
                    onChange={(e) => updateSection({ headerMenuFont: e.target.value })}
                  >
                    {SUPPORTED_FONTS.map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
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
                    value={section.headerBtnText || '시작하기'}
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
                  <select
                    value={section.headerBtnFont || 'Inter'}
                    onChange={(e) => updateSection({ headerBtnFont: e.target.value })}
                  >
                    {SUPPORTED_FONTS.map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {/* 6. Base settings height & colors */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">{section.sharedType === 'header' ? '헤더 기본 설정' : '섹션 기본 설정'}</label>
              <div className="grid-inputs-row">
                {section.sharedType === 'header' ? (
                  <div className="grid-input-item" style={{ flex: '1.5 1 0%' }}>
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
                ) : (
                  <div className="grid-input-item">
                    <span className="input-label">섹션 높이 (px)</span>
                    <input
                      type="number"
                      value={section.height}
                      onChange={(e) => updateSection({ height: parseInt(e.target.value) || 70 })}
                    />
                  </div>
                )}
                
                <div className="grid-input-item">
                  <span className="input-label">배경색</span>
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
            </div>

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
      const links = section.footerLinksText || '개인정보처리방침   이용약관';
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

            {/* 5. Policy & Links (Shown for all layouts) */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">상단 약관 & 퀵 링크 문구</label>
              <input
                type="text"
                value={links}
                onChange={(e) => updateSection({ footerLinksText: e.target.value })}
                placeholder="개인정보처리방침   이용약관"
              />
            </div>

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

    const deleteSection = () => {
      if (sections.length <= 1) {
        alert('최소 하나의 섹션은 존재해야 합니다.');
        return;
      }
      setSections(prev => prev.filter(s => s.id !== activeSectionId));
      setActiveSectionId(null);
    };

    const moveSection = (direction: 'up' | 'down') => {
      const index = sections.findIndex(s => s.id === activeSectionId);
      if (index === -1) return;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sections.length) return;
      setSections(prev => {
        const updated = [...prev];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        return updated;
      });
    };

    let currentSectionTitle = '섹션';
    if (section.sharedType === 'header') currentSectionTitle = '공통 헤더 컴포넌트';
    else if (section.sharedType === 'footer') currentSectionTitle = '공통 푸터 컴포넌트';
    else {
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
          {/* Section Width (Guideline Width) */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">가로폭</label>
            <div className="flex gap-2">
              {(['100%', '80%', '60%'] as const).map((width) => (
                <button
                  key={width}
                  type="button"
                  className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                    (section.guidelineWidth || '80%') === width
                      ? ''
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  style={(section.guidelineWidth || '80%') === width ? {
                    backgroundColor: 'var(--theme-primary, #10b981)',
                    color: '#ffffff',
                    borderColor: 'var(--theme-primary, #10b981)',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                    fontWeight: '700'
                  } : {}}
                  onClick={() => updateSection({ guidelineWidth: width })}
                  onMouseEnter={() => setHoveredGuidelineWidth?.(width)}
                  onMouseLeave={() => setHoveredGuidelineWidth?.(null)}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>

          {/* Section Height Mode */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">섹션 높이 방식 (Height Mode)</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                  (section.heightMode || 'fixed') === 'fixed'
                    ? ''
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={(section.heightMode || 'fixed') === 'fixed' ? {
                  backgroundColor: 'var(--theme-primary, #10b981)',
                  color: '#ffffff',
                  borderColor: 'var(--theme-primary, #10b981)',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                  fontWeight: '700'
                } : {}}
                onClick={() => updateSection({ heightMode: 'fixed' })}
              >
                고정 높이 (Fixed)
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                  section.heightMode === 'auto'
                    ? ''
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={section.heightMode === 'auto' ? {
                  backgroundColor: 'var(--theme-primary, #10b981)',
                  color: '#ffffff',
                  borderColor: 'var(--theme-primary, #10b981)',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                  fontWeight: '700'
                } : {}}
                onClick={() => updateSection({ heightMode: 'auto' })}
              >
                자동 높이 (Auto)
              </button>
            </div>
          </div>

          {/* Section Height & Vertical Align */}
          {(section.heightMode || 'fixed') === 'fixed' && (() => {
            // Calculate minimum height limit in pixels to prevent elements overflow (Flex flow based)
            const pTop = section.paddingTop ?? 40;
            const pBottom = section.paddingBottom ?? 40;
            const isHorizontal = section.flexDirection === 'horizontal';
            const gap = section.flexGap !== undefined ? section.flexGap : 16;
            
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
            if (section.elements.length > 0) {
              if (isHorizontal) {
                const maxElHeight = section.elements.reduce((max, el) => Math.max(max, getElementHeight(el)), 0);
                minHeightLimit = maxElHeight + pTop + pBottom;
              } else {
                const totalElementsHeight = section.elements.reduce((sum, el) => sum + getElementHeight(el), 0);
                const totalGaps = (section.elements.length - 1) * gap;
                minHeightLimit = totalElementsHeight + totalGaps + pTop + pBottom;
              }
            } else {
              minHeightLimit = pTop + pBottom + 100;
            }
            
            const hUnit = section.heightUnit || 'px';
            const isPx = hUnit === 'px';

            const minSliderVal = isPx ? Math.max(150, minHeightLimit) : 10;
            const maxSliderVal = isPx ? 1000 : 100;
            const sliderStep = isPx ? 10 : 1;
            
            const currentVal = section.height;
            const boundedVal = isPx ? Math.max(minSliderVal, currentVal) : currentVal;

            return (
              <>
                {/* Height Unit selection tabs */}
                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">높이 단위</label>
                  <div className="flex gap-2">
                    {(['px', 'dvh'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                          hUnit === unit
                            ? ''
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        style={hUnit === unit ? {
                          backgroundColor: 'var(--theme-primary, #10b981)',
                          color: '#ffffff',
                          borderColor: 'var(--theme-primary, #10b981)',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                          fontWeight: '700'
                        } : {}}
                        onClick={() => {
                          const defaultVal = unit === 'px' ? 400 : 80;
                          updateSection({ heightUnit: unit, height: defaultVal });
                        }}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">섹션 높이</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={minSliderVal}
                      max={maxSliderVal}
                      step={sliderStep}
                      value={boundedVal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || minSliderVal;
                        updateSection({ height: val });
                      }}
                    />
                    <span className="text-xs font-semibold w-12 text-right">{boundedVal}{hUnit}</span>
                  </div>
                  {isPx && minHeightLimit > 150 && (
                    <p className="text-[9px] text-[#0369a1] bg-[#f0f9ff] p-1.5 rounded" style={{ margin: 0 }}>
                      ℹ️ 내부 요소 보호를 위해 최소 높이가 {minHeightLimit}px로 제한되어 있습니다.
                    </p>
                  )}
                </div>

                <div className="property-group flex flex-col gap-2">
                  <label className="group-title">내부 요소 수직 정렬</label>
                  <select
                    value={section.verticalAlign || 'center'}
                    onChange={(e) => updateSection({ verticalAlign: e.target.value as any })}
                  >
                    <option value="start">위쪽 정렬 (Start)</option>
                    <option value="center">가운데 정렬 (Center)</option>
                    <option value="end">아래쪽 정렬 (End)</option>
                  </select>
                </div>
              </>
            );
          })()}

          {/* Section Padding Controls */}
          <div 
            className="property-group flex flex-col gap-2"
            onMouseEnter={() => setActivePaddingGuide({ sectionId: section.id, type: 'top' })}
            onMouseLeave={() => setActivePaddingGuide(null)}
          >
            <div className="flex justify-between items-center">
              <label className="group-title">상단 여백</label>
              <label className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer font-normal" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={section.paddingTop === undefined}
                  onChange={(e) => updateSection({ paddingTop: e.target.checked ? undefined : (themeSettings?.defaultSectionPadding ?? 40) })}
                  style={{ width: '13px', height: '13px', margin: 0, marginRight: '4px' }}
                />
                기본값 상속
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="120"
                step="4"
                disabled={section.paddingTop === undefined}
                value={section.paddingTop ?? (themeSettings?.defaultSectionPadding ?? 40)}
                onChange={(e) => updateSection({ paddingTop: parseInt(e.target.value) })}
                onFocus={() => setActivePaddingGuide({ sectionId: section.id, type: 'top' })}
                onBlur={() => setActivePaddingGuide(null)}
              />
              <span className="text-xs font-semibold w-12 text-right">{section.paddingTop ?? (themeSettings?.defaultSectionPadding ?? 40)}px</span>
            </div>
          </div>

          <div 
            className="property-group flex flex-col gap-2"
            onMouseEnter={() => setActivePaddingGuide({ sectionId: section.id, type: 'bottom' })}
            onMouseLeave={() => setActivePaddingGuide(null)}
          >
            <div className="flex justify-between items-center">
              <label className="group-title">하단 여백</label>
              <label className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer font-normal" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={section.paddingBottom === undefined}
                  onChange={(e) => updateSection({ paddingBottom: e.target.checked ? undefined : (themeSettings?.defaultSectionPadding ?? 40) })}
                  style={{ width: '13px', height: '13px', margin: 0, marginRight: '4px' }}
                />
                기본값 상속
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="120"
                step="4"
                disabled={section.paddingBottom === undefined}
                value={section.paddingBottom ?? (themeSettings?.defaultSectionPadding ?? 40)}
                onChange={(e) => updateSection({ paddingBottom: parseInt(e.target.value) })}
                onFocus={() => setActivePaddingGuide({ sectionId: section.id, type: 'bottom' })}
                onBlur={() => setActivePaddingGuide(null)}
              />
              <span className="text-xs font-semibold w-12 text-right">{section.paddingBottom ?? (themeSettings?.defaultSectionPadding ?? 40)}px</span>
            </div>
          </div>

          {/* Flex Layout Options */}
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

          <div className="property-group flex flex-col gap-2">
            <label className="group-title">요소 배치 정렬</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: 'start', label: '시작 정렬 (Start)' },
                { value: 'center', label: '중앙 정렬 (Center)' },
                { value: 'end', label: '끝 정렬 (End)' },
                { value: 'space-between', label: '양끝 정렬 (Between)' },
              ].map((opt) => {
                const currentAlign = section.flexAlign || 'center';
                const isSelected = currentAlign === opt.value;
                const isHovered = previewFlexAlign === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateSection({ flexAlign: opt.value as any })}
                    onMouseEnter={() => setPreviewFlexAlign?.(opt.value)}
                    onMouseLeave={() => setPreviewFlexAlign?.(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 10px',
                      borderRadius: '0px',
                      border: isSelected ? '1.5px solid #0284c7' : isHovered ? '1px solid #7dd3fc' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f0f9ff' : isHovered ? '#f8fafc' : '#ffffff',
                      color: isSelected ? '#0284c7' : '#0f172a',
                      fontSize: '12.5px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

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

          {/* Background Image Source or Upload */}
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

          {/* Background Image Options */}
          {section.backgroundImage && (
            <>
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
            </>
          )}

          {/* Section Ordering Operations */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">섹션 위치 순서 변경</label>
            <div className="flex gap-2">
              <button
                className="align-btn"
                style={{ fontSize: '12px', padding: '8px' }}
                disabled={sections.findIndex(s => s.id === activeSectionId) === 0}
                onClick={() => moveSection('up')}
              >
                위로 이동
              </button>
              <button
                className="align-btn"
                style={{ fontSize: '12px', padding: '8px' }}
                disabled={sections.findIndex(s => s.id === activeSectionId) === sections.length - 1}
                onClick={() => moveSection('down')}
              >
                아래로 이동
              </button>
            </div>
          </div>

          {/* Full-width Section Delete Button */}
          <div className="pt-4 mt-2 border-t border-red-100 flex flex-col">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              onClick={deleteSection}
              title="현재 선택된 섹션을 삭제합니다"
            >
              <Trash2 size={16} />
              <span>해당 섹션 삭제하기</span>
            </button>
          </div>
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
                label = '공통 헤더 컴포넌트';
              } else if (sec.sharedType === 'footer') {
                label = '공통 푸터 컴포넌트';
              } else {
                bodySectionIdx++;
                label = `섹션 ${bodySectionIdx}`;
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
                backgroundColor: 'var(--theme-primary, ' + (themeSettings?.primaryColor || '#1e3a8a') + ')',
                color: '#ffffff',
                borderColor: 'var(--theme-primary, ' + (themeSettings?.primaryColor || '#1e3a8a') + ')',
                boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)',
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
                backgroundColor: 'var(--theme-primary, ' + (themeSettings?.primaryColor || '#1e3a8a') + ')',
                color: '#ffffff',
                borderColor: 'var(--theme-primary, ' + (themeSettings?.primaryColor || '#1e3a8a') + ')',
                boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)',
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
                backgroundColor: 'var(--theme-primary, ' + (themeSettings?.primaryColor || '#1e3a8a') + ')',
                color: '#ffffff',
                borderColor: 'var(--theme-primary, ' + (themeSettings?.primaryColor || '#1e3a8a') + ')',
                boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)',
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
                  <select
                    value={element.fontFamily}
                    onChange={(e) => updateElement({ fontFamily: e.target.value })}
                  >
                    <optgroup label="한글 지원 글꼴 (Korean Fonts)">
                      {SUPPORTED_FONTS.filter(f => f.isKorean).map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="영문 전용 글꼴 (English Fonts)">
                      {SUPPORTED_FONTS.filter(f => !f.isKorean).map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </optgroup>
                  </select>
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
