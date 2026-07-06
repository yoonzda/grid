import React, { useState } from 'react';
import { ThemeSettings, FontPreset } from '../types';
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
          {activeTab === 'theme' && (
            <div className="form-group-section">
              <h3 className="section-title">글로벌 테마 색상</h3>
              <p className="section-description">
                브랜드 디자인의 기초가 되는 핵심 테마 팔레트입니다.
              </p>

              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">주 색상 (Primary Color)</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={themeSettings.primaryColor.startsWith('#') && themeSettings.primaryColor.length === 7 ? themeSettings.primaryColor : '#1e3a8a'}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    />
                    <input
                      type="text"
                      value={themeSettings.primaryColor}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-col">
                  <label className="form-label">보조 색상 (Secondary Color)</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={themeSettings.secondaryColor.startsWith('#') && themeSettings.secondaryColor.length === 7 ? themeSettings.secondaryColor : '#4b5563'}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    />
                    <input
                      type="text"
                      value={themeSettings.secondaryColor}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row mt-4">
                <div className="form-col">
                  <label className="form-label">기본 배경색 (Background)</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={themeSettings.backgroundColor.startsWith('#') && themeSettings.backgroundColor.length === 7 ? themeSettings.backgroundColor : '#ffffff'}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    />
                    <input
                      type="text"
                      value={themeSettings.backgroundColor}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-col">
                  <label className="form-label">기본 글자색 (Text Color)</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={themeSettings.textColor.startsWith('#') && themeSettings.textColor.length === 7 ? themeSettings.textColor : '#1f2937'}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    />
                    <input
                      type="text"
                      value={themeSettings.textColor}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row mt-4">
                <div className="form-col w-full">
                  <label className="form-label">사이트 기본 글꼴 (Default Font)</label>
                  <select
                    className="select-font-element"
                    value={themeSettings.fontFamily}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                  >
                    {SUPPORTED_FONTS.map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Gaps & Grid sizes */}
          {activeTab === 'layout' && (
            <div className="form-group-section">
              <h3 className="section-title">글로벌 그리드 레이아웃 설정</h3>
              <p className="section-description">
                웹페이지 격자(Grid) 내의 간격(Gap)과 행의 높이를 정의합니다.
              </p>

              <div className="form-row flex flex-col gap-4">
                <div className="form-col w-full">
                  <label className="form-label flex justify-between">
                    <span>격자 간격 (Grid Column/Row Gap)</span>
                    <span className="value-badge">{themeSettings.gridGap ?? 20}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={themeSettings.gridGap ?? 20}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, gridGap: parseInt(e.target.value) }))}
                    className="form-range"
                  />
                </div>

                <div className="form-col w-full mt-2">
                  <label className="form-label flex justify-between">
                    <span>행 기본 높이 (Grid Row Height)</span>
                    <span className="value-badge">{themeSettings.gridRowHeight ?? 40}px</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={themeSettings.gridRowHeight ?? 40}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, gridRowHeight: parseInt(e.target.value) }))}
                    className="form-range"
                  />
                </div>
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
