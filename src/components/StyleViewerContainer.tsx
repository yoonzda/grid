import React, { useState, useEffect } from 'react';
import { ThemeSettings, FontPreset, BaseColorItem, SemanticTokenMapping } from '../types';
import { SUPPORTED_FONTS } from '../utils/fontManager';
import { X, Plus, Trash2, Palette, Sliders, Type, ChevronDown, Check } from 'lucide-react';

interface StyleViewerContainerProps {
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  onClose: () => void;
}

type TabType = 'theme' | 'layout' | 'presets';

// Helper to determine contrast background based on text color brightness (YIQ standard)
const getContrastBgColor = (hex: string): string => {
  let cleanHex = hex.trim().replace('#', '');
  
  // Handle shorthand hex like #fff
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  
  // Handle CSS variable templates or invalid hex values
  if (cleanHex.length !== 6) {
    const lower = hex.toLowerCase();
    if (lower.includes('white') || lower.includes('#fff') || lower.includes('light')) {
      return '#1e1e1e'; // Dark background for white text
    }
    return '#f8fafc'; // Light background by default
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Calculate brightness
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // If text color is bright (yiq > 165), it needs a dark background for contrast.
  // If text color is dark (yiq <= 165), it needs a light background for contrast.
  return yiq > 165 ? '#1e1e1e' : '#f8fafc';
};

// Helper to detect Korean color family name from HEX code
export const detectKoreanColorName = (hex: string): string => {
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return '색상';

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) * 60;
    } else {
      h = ((rNorm - gNorm) / delta + 4) * 60;
    }
  }

  const sPct = s * 100;
  const lPct = l * 100;

  // Pure White & Pure Black
  if (lPct > 95) return '화이트';
  if (lPct < 6) return '블랙';

  // Low Saturation Grayscale check
  if (sPct < 15) {
    if (lPct > 80) return '연회색';
    if (lPct < 25) return '다크슬레이트';
    if (lPct < 45) return '차콜';
    return '회색';
  }

  // Hue classification
  if (h >= 345 || h < 15) {
    if (lPct > 75) return '소프트 핑크';
    if (lPct < 35) return '버건디';
    return '레드';
  }
  if (h >= 15 && h < 45) {
    if (lPct > 75) return '소프트 오렌지';
    if (lPct < 35) return '브라운';
    return '오렌지';
  }
  if (h >= 45 && h < 70) {
    if (lPct > 75) return '소프트 옐로우';
    return '옐로우';
  }
  if (h >= 70 && h < 165) {
    if (lPct > 75) return '소프트 그린';
    if (lPct < 32) return '딥 그린';
    return '그린';
  }
  if (h >= 165 && h < 195) {
    if (lPct > 75) return '민트';
    if (lPct < 32) return '딥 청록';
    return '청록';
  }
  if (h >= 195 && h < 255) {
    if (lPct > 82) return '소프트 블루';
    if (lPct < 32) return '딥네이비';
    if (h < 215) return '스카이블루';
    return '블루';
  }
  if (h >= 255 && h < 285) {
    if (lPct > 75) return '소프트 퍼플';
    if (lPct < 32) return '딥 퍼플';
    return '퍼플';
  }
  if (h >= 285 && h < 345) {
    if (lPct > 75) return '소프트 핑크';
    if (lPct < 35) return '딥 마젠타';
    return '핑크';
  }

  return '색상';
};

export const StyleViewerContainer: React.FC<StyleViewerContainerProps> = ({
  themeSettings,
  setThemeSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  const [openSemanticKey, setOpenSemanticKey] = useState<string | null>(null);

  // Close semantic popover menu when clicking outside
  useEffect(() => {
    if (!openSemanticKey) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.semantic-popover-container')) {
        setOpenSemanticKey(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSemanticKey]);

  // Add new Custom Font Preset
  const handleAddPreset = () => {
    const newId = `preset-${Date.now()}`;
    const newPreset: FontPreset = {
      id: newId,
      name: `새 스타일 프리셋 ${themeSettings.fontPresets.length + 1}`,
      fontSize: '16px',
      fontFamily: themeSettings.fontFamily || 'Inter',
      fontWeight: '400',
      color: themeSettings.textColor || '#1f2937',
    };
    setThemeSettings((prev) => ({
      ...prev,
      fontPresets: [...prev.fontPresets, newPreset],
    }));
  };

  // Delete custom preset
  const handleDeletePreset = (id: string) => {
    setThemeSettings((prev) => ({
      ...prev,
      fontPresets: prev.fontPresets.filter((p) => p.id !== id),
    }));
  };

  // Update preset field
  const handleUpdatePreset = (id: string, field: keyof FontPreset, value: string) => {
    setThemeSettings((prev) => ({
      ...prev,
      fontPresets: prev.fontPresets.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  // Is standard preset (cannot be deleted)
  const isStandardPreset = (id: string) => {
    return ['title-1', 'title-2', 'body-1', 'menu', 'button'].includes(id);
  };

  return (
    <div className="style-guide-container">
      {/* 1. Sidebar (VSCode lookalike categories) */}
      <div className="style-guide-sidebar">
        <div className="sidebar-header-row">
          <span>STYLE GUIDE MANAGER</span>
          <button className="close-drawer-btn" onClick={onClose} title="스타일 가이드 닫기">
            <X size={14} />
          </button>
        </div>

        <div className="category-list">
          <button 
            className={`category-item ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            <Palette size={14} />
            <span>색상</span>
          </button>
          
          <button 
            className={`category-item ${activeTab === 'layout' ? 'active' : ''}`}
            onClick={() => setActiveTab('layout')}
          >
            <Sliders size={14} />
            <span>레이아웃 & 간격</span>
          </button>

          <button 
            className={`category-item ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            <Type size={14} />
            <span>타이포 프리셋</span>
          </button>
        </div>
      </div>

      {/* 2. Editor pane */}
      <div className="style-guide-editor">
        {/* Editor header tab bar */}
        <div className="editor-tab-bar">
          <div className="editor-tab active">
            <span>
              {activeTab === 'theme' && '색상 설정'}
              {activeTab === 'layout' && '레이아웃 & 간격 설정'}
              {activeTab === 'presets' && '타이포그래피 프리셋'}
            </span>
          </div>
          <div className="tab-filler"></div>
        </div>

        {/* Form content viewport */}
        <div className="editor-viewport">
          {/* TAB 1: Theme Colors & Base Font */}
          {activeTab === 'theme' && (() => {
            const rawBases: (BaseColorItem | { id: string; hex: string; name?: string })[] = themeSettings.baseColors || [
              { id: 'base-navy', hex: themeSettings.primaryColor || '#1e3a8a' },
              { id: 'base-slate', hex: themeSettings.secondaryColor || '#475569' },
              { id: 'base-sky', hex: themeSettings.accentColor || '#0284c7' },
              { id: 'base-teal', hex: themeSettings.brandLightColor || '#0d9488' },
              { id: 'base-rose', hex: '#e11d48' },
              { id: 'base-white', hex: themeSettings.backgroundColor || '#ffffff' },
              { id: 'base-light-gray', hex: themeSettings.surfaceColor || '#f1f5f9' },
              { id: 'base-dark-slate', hex: themeSettings.darkBgColor || '#0f172a' }
            ];

            const baseColorsList: BaseColorItem[] = rawBases.map(b => ({
              id: b.id,
              hex: b.hex,
              name: detectKoreanColorName(b.hex)
            }));

            const semanticMap: SemanticTokenMapping = themeSettings.semanticMappings || {
              primary: 'base-navy',
              secondary: 'base-slate',
              accent: 'base-sky',
              brandLight: 'base-teal',
              backgroundColor: 'base-white',
              surfaceColor: 'base-light-gray',
              darkBgColor: 'base-dark-slate',
              textColor: 'base-dark-slate',
              subtextColor: 'base-slate',
              borderColor: 'base-light-gray'
            };

            const updateBaseColor = (id: string, newHex: string, newName?: string) => {
              const autoName = newName !== undefined ? newName : detectKoreanColorName(newHex);
              const updatedBases = baseColorsList.map(b => b.id === id ? { ...b, hex: newHex, name: autoName } : b);
              
              // Recalculate all semantic tokens bound to this base color
              const newPrimary = updatedBases.find(b => b.id === semanticMap.primary)?.hex || themeSettings.primaryColor;
              const newSecondary = updatedBases.find(b => b.id === semanticMap.secondary)?.hex || themeSettings.secondaryColor;
              const newAccent = updatedBases.find(b => b.id === semanticMap.accent)?.hex || themeSettings.accentColor;
              const newBrandLight = updatedBases.find(b => b.id === semanticMap.brandLight)?.hex || themeSettings.brandLightColor;
              const newBg = updatedBases.find(b => b.id === semanticMap.backgroundColor)?.hex || themeSettings.backgroundColor;
              const newSurface = updatedBases.find(b => b.id === semanticMap.surfaceColor)?.hex || themeSettings.surfaceColor;
              const newDarkBg = updatedBases.find(b => b.id === semanticMap.darkBgColor)?.hex || themeSettings.darkBgColor;
              const newText = updatedBases.find(b => b.id === semanticMap.textColor)?.hex || themeSettings.textColor;
              const newSubtext = updatedBases.find(b => b.id === semanticMap.subtextColor)?.hex || themeSettings.subtextColor;
              const newBorder = updatedBases.find(b => b.id === semanticMap.borderColor)?.hex || themeSettings.borderColor;

              setThemeSettings(prev => ({
                ...prev,
                baseColors: updatedBases,
                primaryColor: newPrimary,
                secondaryColor: newSecondary,
                accentColor: newAccent,
                brandLightColor: newBrandLight,
                backgroundColor: newBg,
                surfaceColor: newSurface,
                darkBgColor: newDarkBg,
                textColor: newText,
                subtextColor: newSubtext,
                borderColor: newBorder
              }));
            };

            const updateSemanticBinding = (semanticKey: keyof SemanticTokenMapping, targetBaseId: string) => {
              const updatedMap = { ...semanticMap, [semanticKey]: targetBaseId };
              const targetHex = baseColorsList.find(b => b.id === targetBaseId)?.hex;

              const propMap: Record<keyof SemanticTokenMapping, string> = {
                primary: 'primaryColor',
                secondary: 'secondaryColor',
                accent: 'accentColor',
                brandLight: 'brandLightColor',
                backgroundColor: 'backgroundColor',
                surfaceColor: 'surfaceColor',
                darkBgColor: 'darkBgColor',
                textColor: 'textColor',
                subtextColor: 'subtextColor',
                borderColor: 'borderColor'
              };

              setThemeSettings(prev => ({
                ...prev,
                semanticMappings: updatedMap,
                [propMap[semanticKey]]: targetHex || (prev as any)[propMap[semanticKey]]
              }));
            };

            const addCustomBaseColor = () => {
              const newId = `base-custom-${Date.now()}`;
              const updatedBases = [...baseColorsList, { id: newId, name: '커스텀 색상', hex: '#6366f1' }];
              setThemeSettings(prev => ({ ...prev, baseColors: updatedBases }));
            };

            const semanticRoles: { key: keyof SemanticTokenMapping; label: string; tag: string; desc: string }[] = [
              { key: 'primary', label: '주 색상', tag: 'Primary', desc: '메인 브랜드 / 버튼 / 강조' },
              { key: 'secondary', label: '보조 색상', tag: 'Secondary', desc: '서브 요소 / 보조 그래픽' },
              { key: 'accent', label: '포인트 색상', tag: 'Accent', desc: '포인트 배지 / 시선 집중 요소' },
              { key: 'brandLight', label: '연한 브랜드 배경', tag: 'Brand Light', desc: '은은한 연한 틴트 박스 배경' },
              { key: 'backgroundColor', label: '기본 배경색', tag: 'Canvas Bg', desc: '웹사이트 캔버스 1차 배경' },
              { key: 'surfaceColor', label: '서브 배경색', tag: 'Surface', desc: '카드 및 콘텐츠 구획 2차 배경' },
              { key: 'darkBgColor', label: '어두운 배경색', tag: 'Dark Canvas', desc: '다크 스타일 섹션 배경' },
              { key: 'textColor', label: '주 글자색', tag: 'Text Primary', desc: '메인 타이틀 및 본문 텍스트' },
              { key: 'subtextColor', label: '보조 글자색', tag: 'Text Muted', desc: '보조 설명 문구 및 캡션' },
              { key: 'borderColor', label: '테두리 색상', tag: 'Border', desc: '카드 경계선 및 디바이더' }
            ];

            return (
              <div className="theme-tab-content">
                {/* SECTION 1: GLOBAL BASE COLOR PALETTE */}
                <div className="section-card">
                  <div className="section-card-header">
                    <h4 className="section-card-title">
                      <span className="dot-indicator bg-sky"></span>
                      System Color Palette
                    </h4>
                    <button
                      type="button"
                      onClick={addCustomBaseColor}
                      className="add-base-color-btn"
                    >
                      <Plus size={14} />
                      <span>색상 추가</span>
                    </button>
                  </div>

                  <div className="base-palette-grid">
                    {baseColorsList.map((base) => (
                      <div key={base.id} className="circle-swatch-card">
                        <div className="circle-swatch-dot" style={{ backgroundColor: base.hex }} title="클릭하여 색상 선택">
                          <input
                            type="color"
                            value={base.hex.startsWith('#') && base.hex.length === 7 ? base.hex : '#000000'}
                            onChange={(e) => updateBaseColor(base.id, e.target.value)}
                          />
                        </div>

                        <div className="circle-swatch-info">
                          <input
                            type="text"
                            className="circle-swatch-name"
                            value={base.name}
                            onChange={(e) => updateBaseColor(base.id, base.hex, e.target.value)}
                          />
                          <span className="circle-swatch-hex">
                            {base.hex}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 2: SEMANTIC TOKEN LINKING MAP */}
                <div className="section-card">
                  <div className="section-card-header">
                    <h4 className="section-card-title">
                      <span className="dot-indicator bg-indigo"></span>
                      Semantic Color
                    </h4>
                  </div>

                  <div className="semantic-binding-list">
                    {semanticRoles.map((role) => {
                      const currentBaseId = semanticMap[role.key];
                      const currentBase = baseColorsList.find(b => b.id === currentBaseId) || baseColorsList[0];
                      const isOpen = openSemanticKey === String(role.key);

                      // Helper for category dot color
                      const keyStr = String(role.key);
                      const dotColor = ['primary', 'secondary', 'accent', 'brandLight'].includes(keyStr)
                        ? '#0284c7'
                        : ['backgroundColor', 'surfaceColor', 'darkBgColor'].includes(keyStr)
                        ? '#6366f1'
                        : ['textColor', 'subtextColor'].includes(keyStr)
                        ? '#334155'
                        : '#94a3b8';

                      return (
                        <div key={keyStr} className="semantic-binding-item">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }}></span>
                            <span className="semantic-role-label">{role.label}</span>
                            <span className="text-slate-300 text-xs font-medium">·</span>
                            <span className="semantic-role-subtext">{role.tag}</span>
                          </div>

                          <div className="relative semantic-popover-container">
                            <button
                              type="button"
                              className={`semantic-chip-btn ${isOpen ? 'active' : ''}`}
                              onClick={() => setOpenSemanticKey(isOpen ? null : String(role.key))}
                            >
                              <span
                                className="semantic-chip-swatch"
                                style={{ backgroundColor: currentBase?.hex || '#ffffff' }}
                              ></span>
                              <span className="semantic-chip-name">{currentBase?.name || '선택 안됨'}</span>
                              <ChevronDown size={14} className="text-slate-400 shrink-0" />
                            </button>

                            {isOpen && (
                              <div className="semantic-popover-menu">
                                <div className="popover-menu-title">베이스 색상 연결 선택</div>
                                <div className="popover-menu-list">
                                  {baseColorsList.map((b) => {
                                    const isSelected = b.id === currentBaseId;
                                    return (
                                      <button
                                        key={b.id}
                                        type="button"
                                        className={`popover-menu-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                          updateSemanticBinding(role.key, b.id);
                                          setOpenSemanticKey(null);
                                        }}
                                      >
                                        <span className="popover-item-swatch" style={{ backgroundColor: b.hex }}></span>
                                        <span className="popover-item-name">{b.name}</span>
                                        <span className="popover-item-hex">{b.hex}</span>
                                        {isSelected && <Check size={14} className="text-sky-600 ml-auto shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })()}

          {/* TAB 2: Spacing Variables & Global Layout */}
          {activeTab === 'layout' && (
            <div className="form-group-section">
              <h3 className="section-title">글로벌 기본 레이아웃 & 간격 변수 설정</h3>
              <p className="section-description">
                슬라이드 및 컴포넌트 여백에 공통으로 연동되어 적용되는 테마 간격 변수(Spacing Tokens) 설정입니다.
              </p>

              <div className="flex flex-col gap-3 mt-4">
                {(themeSettings.spacingPresets || []).map((preset) => (
                  <div 
                    key={preset.id}
                    className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 hover:border-sky-300 transition-all"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {preset.name}
                        </span>
                        {preset.description && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {preset.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="2"
                        value={preset.value}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            const clamped = Math.max(0, Math.min(300, val));
                            setThemeSettings(prev => ({
                              ...prev,
                              spacingPresets: (prev.spacingPresets || []).map(sp => 
                                sp.id === preset.id ? { ...sp, value: clamped } : sp
                              )
                            }));
                          }
                        }}
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-right font-bold text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500"
                      />
                      <span className="text-xs font-semibold text-slate-600">px</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Typography Presets */}
          {activeTab === 'presets' && (
            <div className="form-group-section space-y-5">
              {/* GLOBAL DEFAULT FONT SELECTION (KOREAN & ENGLISH SEPARATED) */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  사이트 기본 글꼴 설정 (한글 / 영문 분리)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">한글 기본 글꼴 (Korean Font)</label>
                    <select
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500 cursor-pointer"
                      value={themeSettings.fontFamilyKr || themeSettings.fontFamily || 'Pretendard'}
                      onChange={(e) => setThemeSettings(prev => ({
                        ...prev,
                        fontFamilyKr: e.target.value,
                        fontFamily: e.target.value
                      }))}
                    >
                      {SUPPORTED_FONTS.filter(f => f.isKorean).map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">영문 기본 글꼴 (English Font)</label>
                    <select
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500 cursor-pointer"
                      value={themeSettings.fontFamilyEn || 'Inter'}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, fontFamilyEn: e.target.value }))}
                    >
                      {SUPPORTED_FONTS.filter(f => !f.isKorean).map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 className="section-title" style={{ margin: 0 }}>타이포그래피 프리셋 목록</h3>
                  <p className="section-description" style={{ margin: '4px 0 0 0' }}>
                    각 요소에 일괄 상속할 수 있는 글자 규격 프리셋 모듈 목록입니다.
                  </p>
                </div>
                <button className="add-preset-btn-action" onClick={handleAddPreset}>
                  <Plus size={13} />
                  <span>프리셋 추가</span>
                </button>
              </div>

              <div className="presets-scroll-area flex flex-col gap-3">
                {themeSettings.fontPresets.map((preset) => {
                  const previewBg = getContrastBgColor(preset.color);
                  
                  return (
                    <div key={preset.id} className="preset-card-item">
                      <div className="preset-card-header">
                        <div className="flex items-center gap-2" style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="preset-rename-input"
                            value={preset.name}
                            onChange={(e) => handleUpdatePreset(preset.id, 'name', e.target.value)}
                          />
                          <span className="preset-card-id">({preset.id})</span>
                        </div>

                        {!isStandardPreset(preset.id) && (
                          <button
                            className="del-preset-btn"
                            onClick={() => handleDeletePreset(preset.id)}
                            title="프리셋 삭제"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="preset-card-body">
                        {/* Font Family selector */}
                        <div className="preset-col">
                          <span className="preset-label">글꼴</span>
                          <select
                            value={preset.fontFamily}
                            onChange={(e) => handleUpdatePreset(preset.id, 'fontFamily', e.target.value)}
                          >
                            {SUPPORTED_FONTS.map(f => (
                              <option key={f.name} value={f.name}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Font Size */}
                        <div className="preset-col">
                          <span className="preset-label">크기</span>
                          <input
                            type="text"
                            value={preset.fontSize}
                            onChange={(e) => handleUpdatePreset(preset.id, 'fontSize', e.target.value)}
                          />
                        </div>

                        {/* Font Weight */}
                        <div className="preset-col">
                          <span className="preset-label">두께</span>
                          <select
                            value={preset.fontWeight}
                            onChange={(e) => handleUpdatePreset(preset.id, 'fontWeight', e.target.value)}
                          >
                            <option value="300">Light (300)</option>
                            <option value="400">Regular (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">SemiBold (600)</option>
                            <option value="700">Bold (700)</option>
                            <option value="800">ExtraBold (800)</option>
                          </select>
                        </div>

                        {/* Font Color */}
                        <div className="preset-col">
                          <span className="preset-label">기본 색상</span>
                          <div className="picker-wrapper">
                            <input
                              type="color"
                              value={preset.color.startsWith('#') && preset.color.length === 7 ? preset.color : '#ffffff'}
                              onChange={(e) => handleUpdatePreset(preset.id, 'color', e.target.value)}
                            />
                            <input
                              type="text"
                              value={preset.color}
                              onChange={(e) => handleUpdatePreset(preset.id, 'color', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Contrast Preview row */}
                      <div className="preset-card-preview" style={{
                        fontFamily: `'${preset.fontFamily}', sans-serif`,
                        fontSize: preset.fontSize,
                        color: preset.color,
                        fontWeight: preset.fontWeight as any,
                        marginTop: '8px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: previewBg,
                        border: '1px solid #e5e7eb',
                        transition: 'background-color 0.25s, color 0.25s',
                        textAlign: 'center'
                      }}>
                        동해물과 백두산이 마르고 닳도록 - 123 ABC
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .style-guide-container {
          display: flex;
          width: 100%;
          height: 100%;
          background-color: #ffffff;
          color: #1f2937;
        }

        .style-guide-sidebar {
          width: 200px;
          border-right: 1px solid #e5e7eb;
          background-color: #f9fafb;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .sidebar-header-row {
          height: 35px;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
        }

        .close-drawer-btn {
          background: transparent;
          border: none;
          color: #4b5563;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .close-drawer-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #1f2937;
        }

        .category-list {
          flex: 1;
          padding: 10px 4px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .category-item {
          background: transparent;
          border: none;
          color: #4b5563;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .category-item:hover {
          background: rgba(0, 0, 0, 0.03);
          color: #1f2937;
        }

        .category-item.active {
          background: rgba(24, 160, 251, 0.08);
          color: var(--figma-accent);
        }

        .style-guide-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: #ffffff;
        }

        .editor-tab-bar {
          display: flex;
          height: 35px;
          background-color: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
        }

        .editor-tab {
          padding: 0 16px;
          height: 100%;
          display: flex;
          align-items: center;
          background-color: #ffffff;
          border-right: 1px solid #e5e7eb;
          font-size: 11px;
          font-weight: 600;
          color: #1f2937;
        }

        .tab-filler {
          flex: 1;
          height: 100%;
          background-color: #f3f4f6;
        }

        .editor-viewport {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .form-group-section {
          display: flex;
          flex-direction: column;
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 6px;
        }

        .section-description {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .theme-tab-content {
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
          padding-bottom: 24px !important;
        }

        .section-card {
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .section-card-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding-bottom: 10px !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .section-card-title {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          display: flex !important;
          align-items: center !important;
          gap: 7px !important;
        }

        .dot-indicator {
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          display: inline-block !important;
        }
        .dot-indicator.bg-sky { background: #0284c7 !important; }
        .dot-indicator.bg-indigo { background: #6366f1 !important; }

        .section-card-desc {
          font-size: 11px !important;
          color: #64748b !important;
          margin-top: 2px !important;
        }

        .add-base-color-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          font-size: 11.5px !important;
          font-weight: 700 !important;
          color: #0284c7 !important;
          background: #f0f9ff !important;
          border: 1px solid #bae6fd !important;
          border-radius: 8px !important;
          padding: 4px 10px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          shrink: 0 !important;
        }

        .add-base-color-btn:hover {
          background: #e0f2fe !important;
          border-color: #38bdf8 !important;
        }

        .base-palette-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 14px 18px !important;
          margin-top: 14px !important;
        }

        .circle-swatch-card {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 4px 0 !important;
          box-shadow: none !important;
        }

        .circle-swatch-dot {
          width: 48px !important;
          height: 48px !important;
          border-radius: 50% !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          position: relative !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
        }

        .circle-swatch-dot input[type="color"] {
          position: absolute !important;
          inset: 0 !important;
          opacity: 0 !important;
          width: 100% !important;
          height: 100% !important;
          cursor: pointer !important;
        }

        .circle-swatch-info {
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          flex: 1 !important;
          min-width: 0 !important;
        }

        .circle-swatch-name {
          font-size: 13.5px !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          color: #0f172a !important;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          text-overflow: ellipsis !important;
          overflow: hidden !important;
          white-space: nowrap !important;
        }

        .circle-swatch-name:focus,
        .circle-swatch-name:focus-visible,
        .circle-swatch-name:active {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }

        .circle-swatch-hex {
          font-size: 11px !important;
          font-family: monospace !important;
          font-weight: 600 !important;
          line-height: 1.3 !important;
          color: #64748b !important;
          text-transform: uppercase !important;
          margin-top: 2px !important;
          letter-spacing: 0.3px !important;
        }

        .semantic-binding-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
          margin-top: 6px !important;
        }

        .semantic-binding-item {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 10px 4px !important;
          background: transparent !important;
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
        }

        .semantic-role-label {
          font-size: 13.5px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }

        .semantic-role-subtext {
          font-size: 11.5px !important;
          font-weight: 500 !important;
          color: #64748b !important;
        }

        .semantic-popover-container .semantic-chip-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 5px 10px !important;
          cursor: pointer !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03) !important;
          transition: all 0.2s ease !important;
        }

        .semantic-popover-container .semantic-chip-btn:hover,
        .semantic-popover-container .semantic-chip-btn.active {
          border-color: #0284c7 !important;
          background: #f8fafc !important;
        }

        .semantic-popover-container .semantic-chip-swatch {
          width: 18px !important;
          height: 18px !important;
          border-radius: 50% !important;
          border: 1px solid rgba(0, 0, 0, 0.15) !important;
          flex-shrink: 0 !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08) !important;
        }

        .semantic-popover-container .semantic-chip-name {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }

        .semantic-popover-container .semantic-popover-menu {
          position: absolute !important;
          right: 0 !important;
          top: calc(100% + 6px) !important;
          z-index: 50 !important;
          width: 220px !important;
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 12px !important;
          padding: 8px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08) !important;
        }

        .semantic-popover-container .popover-menu-title {
          font-size: 12.5px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          padding: 6px 8px 10px 8px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          margin-bottom: 6px !important;
        }

        .semantic-popover-container .popover-menu-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 2px !important;
          max-height: 200px !important;
          overflow-y: auto !important;
        }

        .semantic-popover-container .popover-menu-item {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          width: 100% !important;
          padding: 6px 8px !important;
          border-radius: 6px !important;
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          text-align: left !important;
        }

        .semantic-popover-container .popover-menu-item:hover {
          background: #f1f5f9 !important;
        }

        .semantic-popover-container .popover-menu-item.selected {
          background: #f0f9ff !important;
        }

        .semantic-popover-container .popover-item-swatch {
          width: 16px !important;
          height: 16px !important;
          border-radius: 50% !important;
          border: 1px solid rgba(0, 0, 0, 0.15) !important;
          flex-shrink: 0 !important;
        }

        .semantic-popover-container .popover-item-name {
          font-size: 12.5px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }

        .semantic-popover-container .popover-item-hex {
          font-size: 10.5px !important;
          font-family: monospace !important;
          color: #94a3b8 !important;
          text-transform: uppercase !important;
          margin-left: 2px !important;
        }

        .form-row {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        .form-col {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .form-label {
          font-size: 10px;
          font-weight: 700;
          color: #4b5563;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .color-input-wrapper {
          display: flex;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px;
          height: 28px;
          align-items: center;
        }

        .color-input-wrapper input[type="color"] {
          width: 24px;
          height: 18px;
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
        }

        .color-input-wrapper input[type="text"] {
          background: transparent;
          border: none;
          color: #1f2937;
          font-size: 11px;
          width: 80px;
          outline: none;
          padding: 0;
        }

        .select-font-element {
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #1f2937;
          border-radius: 4px;
          padding: 6px;
          font-size: 11px;
          outline: none;
          height: 28px;
        }

        .form-range {
          width: 100%;
          margin: 6px 0;
          cursor: pointer;
        }

        .value-badge {
          background: rgba(24, 160, 251, 0.08);
          color: var(--figma-accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
        }

        .add-preset-btn-action {
          background: var(--figma-accent);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .add-preset-btn-action:hover {
          background: var(--figma-accent-hover);
        }

        .presets-scroll-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preset-card-item {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preset-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding-bottom: 6px;
        }

        .preset-rename-input {
          background: transparent;
          border: none;
          color: #111827;
          font-weight: 700;
          font-size: 12px;
          outline: none;
          width: 150px;
          padding: 2px;
          border-bottom: 1px dashed transparent;
        }

        .preset-rename-input:focus {
          border-bottom-color: var(--figma-accent);
        }

        .preset-card-id {
          font-size: 10px;
          color: #6b7280;
        }

        .del-preset-btn {
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .del-preset-btn:hover {
          background: rgba(242, 78, 30, 0.08);
          color: var(--figma-danger);
        }

        .preset-card-body {
          display: flex;
          gap: 10px;
          width: 100%;
        }

        .preset-col {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .preset-label {
          font-size: 9px;
          color: #4b5563;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .preset-col select, .preset-col input[type="text"] {
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #111827;
          border-radius: 4px;
          padding: 4px 6px;
          font-size: 11px;
          height: 26px;
          outline: none;
        }

        .picker-wrapper {
          display: flex;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 2px 4px;
          align-items: center;
          height: 26px;
        }

        .picker-wrapper input[type="color"] {
          width: 20px;
          height: 16px;
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
        }

        .picker-wrapper input[type="text"] {
          background: transparent;
          border: none;
          color: #111827;
          font-size: 11px;
          width: 60px;
          outline: none;
          padding: 0;
          height: 100%;
        }
      `}</style>
    </div>
  );
};
