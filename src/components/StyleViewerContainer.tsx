import React, { useState } from 'react';
import { ThemeSettings, FontPreset, BaseColorItem, SemanticTokenMapping } from '../types';
import { SUPPORTED_FONTS } from '../utils/fontManager';
import { X, Plus, Trash2, Palette, Sliders, Type } from 'lucide-react';

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

export const StyleViewerContainer: React.FC<StyleViewerContainerProps> = ({
  themeSettings,
  setThemeSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('theme');

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
            <span>🎨 색상 & 테마</span>
          </button>
          
          <button 
            className={`category-item ${activeTab === 'layout' ? 'active' : ''}`}
            onClick={() => setActiveTab('layout')}
          >
            <Sliders size={14} />
            <span>📏 레이아웃 & 간격</span>
          </button>

          <button 
            className={`category-item ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            <Type size={14} />
            <span>✏️ 타이포 프리셋</span>
          </button>
        </div>
      </div>

      {/* 2. Editor pane */}
      <div className="style-guide-editor">
        {/* Editor header tab bar */}
        <div className="editor-tab-bar">
          <div className="editor-tab active">
            <span>
              {activeTab === 'theme' && '🎨 색상 & 테마 설정'}
              {activeTab === 'layout' && '📏 레이아웃 & 간격 설정'}
              {activeTab === 'presets' && '✏️ 타이포그래피 프리셋'}
            </span>
          </div>
          <div className="tab-filler"></div>
        </div>

        {/* Form content viewport */}
        <div className="editor-viewport">
          {/* TAB 1: Theme Colors & Base Font */}
          {activeTab === 'theme' && (() => {
            const baseColorsList: BaseColorItem[] = themeSettings.baseColors || [
              { id: 'base-navy', name: '딥네이비', hex: themeSettings.primaryColor || '#1e3a8a' },
              { id: 'base-slate', name: '슬레이트', hex: themeSettings.secondaryColor || '#4b5563' },
              { id: 'base-sky', name: '스카이블루', hex: themeSettings.accentColor || '#0284c7' },
              { id: 'base-blue-tint', name: '소프트블루', hex: themeSettings.brandLightColor || '#eff6ff' },
              { id: 'base-white', name: '화이트', hex: themeSettings.backgroundColor || '#ffffff' },
              { id: 'base-light-gray', name: '연회색', hex: themeSettings.surfaceColor || '#f8fafc' },
              { id: 'base-dark-slate', name: '다크슬레이트', hex: themeSettings.darkBgColor || '#0f172a' },
              { id: 'base-border-gray', name: '라인회색', hex: themeSettings.borderColor || '#cbd5e1' }
            ];

            const semanticMap: SemanticTokenMapping = themeSettings.semanticMappings || {
              primary: 'base-navy',
              secondary: 'base-slate',
              accent: 'base-sky',
              brandLight: 'base-blue-tint',
              backgroundColor: 'base-white',
              surfaceColor: 'base-light-gray',
              darkBgColor: 'base-dark-slate',
              textColor: 'base-dark-slate',
              subtextColor: 'base-slate',
              borderColor: 'base-border-gray'
            };

            const updateBaseColor = (id: string, newHex: string, newName?: string) => {
              const updatedBases = baseColorsList.map(b => b.id === id ? { ...b, hex: newHex, name: newName ?? b.name } : b);
              
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
              <div className="space-y-6 pb-6">
                {/* SECTION 1: GLOBAL BASE COLOR PALETTE */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        1. 글로벌 베이스 컬러 팔레트
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">시스템의 원천 색상을 설정합니다. 변경 시 연동된 용도/컴포넌트가 일괄 업데이트됩니다.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addCustomBaseColor}
                      className="text-xs font-bold text-sky-600 bg-white hover:bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all hover:border-sky-300 shrink-0"
                    >
                      + 색상 추가
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 mt-3">
                    {baseColorsList.map((base) => (
                      <div
                        key={base.id}
                        className="bg-white border border-slate-200 hover:border-sky-400 p-2.5 rounded-xl flex items-center gap-2.5 shadow-2xs transition-all group"
                      >
                        <div className="relative shrink-0 w-8 h-8 rounded-lg border border-slate-200 shadow-2xs overflow-hidden cursor-pointer" style={{ backgroundColor: base.hex }}>
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            value={base.hex.startsWith('#') && base.hex.length === 7 ? base.hex : '#000000'}
                            onChange={(e) => updateBaseColor(base.id, e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <input
                            type="text"
                            className="text-xs font-bold text-slate-800 bg-transparent border-none outline-none p-0 w-full focus:text-sky-600 transition-colors"
                            value={base.name}
                            onChange={(e) => updateBaseColor(base.id, base.hex, e.target.value)}
                          />
                          <input
                            type="text"
                            className="text-[11px] font-mono text-slate-400 bg-transparent border-none outline-none p-0 w-full uppercase"
                            value={base.hex}
                            onChange={(e) => updateBaseColor(base.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 2: SEMANTIC TOKEN LINKING MAP */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        2. 용도별 베이스 컬러 연동 (Semantic Roles)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">각 디자인 용도가 어떤 베이스 컬러를 사용할지 연결합니다.</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200/80 mt-1">
                    {semanticRoles.map((role) => {
                      const currentBaseId = semanticMap[role.key];
                      const currentBase = baseColorsList.find(b => b.id === currentBaseId) || baseColorsList[0];

                      return (
                        <div key={String(role.key)} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-slate-800">{role.label}</span>
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{role.tag}</span>
                            <span className="text-[11px] text-slate-400 hidden sm:inline ml-1 truncate">{role.desc}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-medium text-slate-400">🔗 연결 ➡️</span>
                            <div className="relative flex items-center bg-white border border-slate-300 hover:border-sky-400 rounded-xl px-2.5 py-1 shadow-2xs transition-all cursor-pointer">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs mr-2 shrink-0"
                                style={{ backgroundColor: currentBase?.hex || '#ffffff' }}
                              ></span>
                              <select
                                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                                value={currentBaseId || ''}
                                onChange={(e) => updateSemanticBinding(role.key, e.target.value)}
                              >
                                {baseColorsList.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name} ({b.hex})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">사이트 기본 글꼴 (Default Font)</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500 transition-colors"
                    value={themeSettings.fontFamily}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                  >
                    {SUPPORTED_FONTS.map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
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
            <div className="form-group-section">
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
