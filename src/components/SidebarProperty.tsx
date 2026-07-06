import React from 'react';
import { Section, EditorElement } from '../types';
import { SUPPORTED_FONTS } from '../utils/fontManager';
import { ICON_TEMPLATES } from '../utils/iconTemplates';
import { AlignLeft, AlignCenter, AlignRight, MoveLeft, MoveRight, HelpCircle, Trash2 } from 'lucide-react';

interface SidebarPropertyProps {
  activeElement: { sectionId: string; elementId: string } | null;
  activeSectionId: string | null;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setActiveElement: (val: { sectionId: string; elementId: string } | null) => void;
  setActiveSectionId: (val: string | null) => void;
}

export const SidebarProperty: React.FC<SidebarPropertyProps> = ({
  activeElement,
  activeSectionId,
  sections,
  setSections,
  setActiveElement,
  setActiveSectionId,
}) => {
  if (!activeElement && activeSectionId) {
    const section = sections.find(s => s.id === activeSectionId);
    if (!section) {
      return (
        <div className="properties-panel flex flex-col h-full">
          <div className="panel-header">속성 설정</div>
          <div className="properties-empty flex flex-col items-center justify-center p-6 text-center">
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

    return (
      <div className="properties-panel flex flex-col h-full">
        <div className="panel-header flex items-center justify-between">
          <span>섹션 설정</span>
          <button className="del-el-btn" onClick={deleteSection} title="섹션 삭제">
            <Trash2 size={13} />
          </button>
        </div>

        <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
          {/* Section Height */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">섹션 높이 (Height)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="150"
                max="1000"
                value={section.height}
                onChange={(e) => updateSection({ height: parseInt(e.target.value) || 300 })}
              />
              <span className="text-xs font-semibold w-12 text-right">{section.height}px</span>
            </div>
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
                style={{ fontSize: '11px', padding: '8px' }}
                disabled={sections.findIndex(s => s.id === activeSectionId) === 0}
                onClick={() => moveSection('up')}
              >
                위로 이동
              </button>
              <button
                className="align-btn"
                style={{ fontSize: '11px', padding: '8px' }}
                disabled={sections.findIndex(s => s.id === activeSectionId) === sections.length - 1}
                onClick={() => moveSection('down')}
              >
                아래로 이동
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeElement) {
    return (
      <div className="properties-panel flex flex-col h-full">
        <div className="panel-header">속성 설정</div>
        <div className="properties-empty flex flex-col items-center justify-center p-6 text-center">
          <HelpCircle size={24} className="text-muted mb-2" style={{ opacity: 0.5 }} />
          <span className="empty-text">캔버스에서 요소를 선택하거나 섹션 배경을 선택하면 스타일 조절 옵션이 나타납니다.</span>
        </div>
      </div>
    );
  }

  const { sectionId, elementId } = activeElement;
  const section = sections.find(s => s.id === sectionId);
  const element = section?.elements.find(e => e.id === elementId);

  if (!section || !element) {
    return (
      <div className="properties-panel flex flex-col h-full">
        <div className="panel-header">속성 설정</div>
        <div className="properties-empty flex flex-col items-center justify-center p-6">
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
        return {
          ...s,
          elements: s.elements.map(el =>
            el.id === elementId ? { ...el, ...fields } : el
          ),
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
    <div className="properties-panel flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <span>속성 설정 ({element.type})</span>
        <button className="del-el-btn" onClick={deleteElement} title="요소 삭제">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
        
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

        {/* Width Mode Settings (Stretch vs Fit Content) */}
        <div className="property-group flex flex-col gap-2">
          <label className="group-title">가로 크기 설정 (Width Mode)</label>
          <div className="align-buttons-row">
            <button
              className={`align-btn ${element.widthMode !== 'fit-content' ? 'active' : ''}`}
              onClick={() => updateElement({ gridX: 0, gridW: 12, widthMode: 'stretch' })}
              title="12컬럼 폭 전체를 가득 채우고 반응형 영역으로 설정합니다 (Stretch)"
            >
              <span>컨테이너 채우기</span>
            </button>
            <button
              className={`align-btn ${element.widthMode === 'fit-content' ? 'active' : ''}`}
              onClick={() => updateElement({ widthMode: 'fit-content' })}
              title="글자 내용의 폭만큼 너비를 자동으로 맞춥니다 (Hug Contents)"
            >
              <span>콘텐츠 맞춤</span>
            </button>
          </div>
        </div>

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
                    value={element.color.startsWith('#') ? element.color : '#000000'}
                    onChange={(e) => updateElement({ color: e.target.value })}
                  />
                  <input
                    type="text"
                    value={element.color}
                    onChange={(e) => updateElement({ color: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Text Alignment */}
            {element.type !== 'button' && (
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
                      <span style={{ textTransform: 'capitalize' }}>{align}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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

      </div>

      <style>{`
        .properties-panel {
          width: 280px;
          background-color: var(--figma-panel);
          border-left: 1px solid var(--figma-border);
        }

        .del-el-btn {
          background: transparent;
          border: none;
          color: var(--figma-text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .del-el-btn:hover {
          background: rgba(242, 78, 30, 0.1);
          color: var(--figma-danger);
        }

        .properties-empty {
          height: 100%;
        }

        .empty-text {
          font-size: 11px;
          color: var(--figma-text-muted);
        }

        .property-group {
          border-bottom: 1px solid var(--figma-border);
          padding-bottom: 16px;
        }

        .group-title {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: var(--figma-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }

        /* Layout shortcuts grid */
        .shortcut-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .shortcut-btn {
          background: var(--figma-bg);
          border: 1px solid var(--figma-border);
          color: var(--figma-text);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .shortcut-btn:hover {
          background: rgba(0,0,0,0.03);
          border-color: var(--figma-accent);
        }

        .shortcut-btn.center-btn {
          grid-column: span 2;
          justify-content: center;
        }

        /* Basic inputs */
        .input-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--figma-text-muted);
        }

        input[type="text"],
        input[type="number"],
        select,
        textarea {
          width: 100%;
          background: var(--figma-bg);
          border: 1px solid var(--figma-border);
          color: var(--figma-text);
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 11px;
          outline: none;
          font-family: inherit;
        }

        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus,
        textarea:focus {
          border-color: var(--figma-accent);
        }

        .grid-inputs-row {
          display: flex;
          gap: 8px;
        }

        .grid-input-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .color-picker-wrapper {
          display: flex;
          gap: 4px;
        }

        .color-picker-wrapper input[type="color"] {
          border: 1px solid var(--figma-border);
          padding: 0;
          width: 25px;
          height: 25px;
          border-radius: 4px;
          cursor: pointer;
          background: transparent;
        }

        .color-picker-wrapper input[type="text"] {
          flex: 1;
        }

        /* Align buttons row */
        .align-buttons-row {
          display: flex;
          border: 1px solid var(--figma-border);
          border-radius: 4px;
          overflow: hidden;
        }

        .align-btn {
          flex: 1;
          background: var(--figma-bg);
          border: none;
          border-right: 1px solid var(--figma-border);
          color: var(--figma-text-muted);
          padding: 6px 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .align-btn:last-child {
          border-right: none;
        }

        .align-btn:hover {
          background: rgba(0,0,0,0.02);
        }

        .align-btn.active {
          background: rgba(24, 160, 251, 0.08);
          color: var(--figma-accent);
        }

        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--figma-border);
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--figma-accent);
          cursor: pointer;
          transition: transform 0.1s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};
