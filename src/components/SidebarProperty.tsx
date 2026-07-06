import { Section, EditorElement, ThemeSettings } from '../types';
import { SUPPORTED_FONTS } from '../utils/fontManager';
import { ICON_TEMPLATES } from '../utils/iconTemplates';
import { AlignLeft, AlignCenter, AlignRight, MoveLeft, MoveRight, HelpCircle, Trash2 } from 'lucide-react';
import { resolveCollisions } from '../utils/collision';

interface SidebarPropertyProps {
  activeElement: { sectionId: string; elementId: string } | null;
  activeSectionId: string | null;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setActiveElement: (val: { sectionId: string; elementId: string } | null) => void;
  setActiveSectionId: (val: string | null) => void;
  themeSettings?: ThemeSettings;
}

export const SidebarProperty: React.FC<SidebarPropertyProps> = ({
  activeElement,
  activeSectionId,
  sections,
  setSections,
  setActiveElement,
  setActiveSectionId,
  themeSettings,
}) => {
  if (!activeElement && activeSectionId) {
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
          <div className="panel-header">
            <span>🌐 공통 헤더 컴포넌트 설정</span>
          </div>

          <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
            
            {/* 1. Alignment Layout presets */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">정렬 레이아웃 스타일</label>
              <select
                value={section.headerLayout || 'spread-center'}
                onChange={(e) => updateSection({ headerLayout: e.target.value as any })}
              >
                <option value="spread-center">양끝 정렬 및 메뉴 중앙 (Logo 좌 / Menu 중 / Btn 우)</option>
                <option value="spread-between">양끝 분할 정렬 (요소 자동 밀착 배치)</option>
                <option value="left">좌측 밀착 정렬 (Logo - Menu - Btn)</option>
                <option value="center">가로 중앙 정렬 (Logo, Menu, Btn 모두 중앙)</option>
                <option value="right">우측 밀착 정렬 (Logo - Menu - Btn 우측)</option>
                <option value="even-space">균등 간격 정렬 (균일 공간 배분)</option>
              </select>
            </div>

            {/* 1-2. Spacing Settings */}
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

            {/* 2. Show/Hide Elements Checkboxes */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">구성요소 노출 제어</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={section.headerShowLogo !== false}
                    onChange={(e) => updateSection({ headerShowLogo: e.target.checked })}
                  />
                  <span>로고 브랜드 노출</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={section.headerShowMenu !== false}
                    onChange={(e) => updateSection({ headerShowMenu: e.target.checked })}
                  />
                  <span>네비게이션 메뉴 노출</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={section.headerShowBtn !== false}
                    onChange={(e) => updateSection({ headerShowBtn: e.target.checked })}
                  />
                  <span>CTA 액션 버튼 노출</span>
                </label>
              </div>
            </div>

            {/* 3. Brand Logo styling */}
            {section.headerShowLogo !== false && (
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">로고 브랜드 설정</label>
                
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
                  <span className="input-label">로고 글꼴 (Font Family)</span>
                  <select
                    value={section.headerLogoFont || 'Inter'}
                    onChange={(e) => updateSection({ headerLogoFont: e.target.value })}
                  >
                    {SUPPORTED_FONTS.map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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
                      <input
                        type="color"
                        value={section.headerBtnBgColor?.startsWith('#') ? section.headerBtnBgColor : '#10b981'}
                        onChange={(e) => updateSection({ headerBtnBgColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={section.headerBtnBgColor || '#10b981'}
                        onChange={(e) => updateSection({ headerBtnBgColor: e.target.value })}
                      />
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
      <div className="properties-panel">
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

          {/* Layout Mode (Grid vs Flex) */}
          <div className="property-group flex flex-col gap-2">
            <label className="group-title">레이아웃 배치 방식</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                  section.layoutMode !== 'flex'
                    ? 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => updateSection({ layoutMode: 'grid' })}
              >
                자유 배치 (Grid)
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                  section.layoutMode === 'flex'
                    ? 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => updateSection({ layoutMode: 'flex' })}
              >
                흐름 배치 (Flex Flow)
              </button>
            </div>
          </div>

          {/* Flex Layout Options */}
          {section.layoutMode === 'flex' && (
            <>
              <div className="property-group flex flex-col gap-2">
                <label className="group-title">흐름 정렬 방향</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                      section.flexDirection !== 'horizontal'
                        ? 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => updateSection({ flexDirection: 'vertical' })}
                  >
                    세로 흐름 (Column)
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-1.5 px-3 rounded text-xs border font-medium transition-all ${
                      section.flexDirection === 'horizontal'
                        ? 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => updateSection({ flexDirection: 'horizontal' })}
                  >
                    가로 흐름 (Row)
                  </button>
                </div>
              </div>

              <div className="property-group flex flex-col gap-2">
                <label className="group-title">흐름 정렬 방식</label>
                <select
                  value={section.flexAlign || 'center'}
                  onChange={(e) => updateSection({ flexAlign: e.target.value as any })}
                >
                  <option value="start">시작 정렬 (Start)</option>
                  <option value="center">중앙 정렬 (Center)</option>
                  <option value="end">끝 정렬 (End)</option>
                  <option value="space-between">양끝 정렬 (Space Between)</option>
                </select>
              </div>

              <div className="property-group flex flex-col gap-2">
                <label className="group-title">요소 간격 (등간격 Gap: {section.flexGap ?? 16}px)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="2"
                    value={section.flexGap ?? 16}
                    onChange={(e) => updateSection({ flexGap: parseInt(e.target.value) })}
                  />
                  <span className="text-xs font-semibold w-12 text-right">{section.flexGap ?? 16}px</span>
                </div>
                <p className="text-[10px] text-gray-500" style={{ margin: 0, marginTop: '2px' }}>
                  * 흐름 배치 모드에서는 마지막 요소를 제외하고 균등하게 사이 간격이 조절됩니다.
                </p>
              </div>
            </>
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
      <div className="properties-panel">
        <div className="panel-header">레이아웃 아웃라인</div>
        
        <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
          <div className="property-group" style={{ border: 'none', padding: 0 }}>
            <span className="group-title" style={{ marginBottom: '12px' }}>페이지 사용 컴포넌트 목록</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sections.map((sec, idx) => {
                const label = sec.sharedType === 'header' 
                  ? '🌐 공통 헤더 컴포넌트' 
                  : (sec.sharedType === 'footer' ? '🌐 공통 푸터 컴포넌트' : `📄 섹션 ${idx + 1} (${sec.height}px)`);
                
                const isFocused = activeSectionId === sec.id;
                
                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      setActiveElement(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: isFocused ? 'rgba(24, 160, 251, 0.08)' : 'var(--figma-bg)',
                      border: isFocused ? '1px solid var(--figma-accent)' : '1px solid var(--figma-border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isFocused ? 'var(--figma-accent)' : 'var(--figma-text)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isFocused) {
                        e.currentTarget.style.borderColor = 'var(--figma-accent)';
                        e.currentTarget.style.backgroundColor = 'rgba(24, 160, 251, 0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isFocused) {
                        e.currentTarget.style.borderColor = 'var(--figma-border)';
                        e.currentTarget.style.backgroundColor = 'var(--figma-bg)';
                      }
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>
                      {sec.sharedType === 'header' || sec.sharedType === 'footer' ? '📦' : '🧩'}
                    </span>
                    <span style={{ flex: 1 }}>{label}</span>
                    <span style={{ fontSize: '10px', opacity: 0.5 }}>설정 &gt;</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="properties-empty" style={{ flex: 'none', padding: '16px 8px', marginTop: '20px', borderTop: '1px solid var(--figma-border)' }}>
            <HelpCircle size={20} className="help-icon" style={{ marginBottom: '8px' }} />
            <span className="empty-text" style={{ fontSize: '10.5px', maxWidth: '240px' }}>
              캔버스의 요소를 더블클릭하면 텍스트를 인라인으로 편집할 수 있으며, 드래그하여 레이아웃 순서와 크기를 조정할 수 있습니다.
            </span>
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
        
        return {
          ...s,
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

  // Reorder element in section flow
  const moveElementOrder = (direction: 'up' | 'down') => {
    const elementsList = [...(section.elements || [])];
    const index = elementsList.findIndex(e => e.id === elementId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= elementsList.length) return;
    
    // Swap elements
    const temp = elementsList[index];
    elementsList[index] = elementsList[targetIndex];
    elementsList[targetIndex] = temp;
    
    setSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, elements: elementsList } : s))
    );
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
        <span>속성 설정 ({element.type})</span>
        <button className="del-el-btn" onClick={deleteElement} title="요소 삭제">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="properties-body flex-1 overflow-auto p-4 flex flex-col gap-5">
        
        {/* If Flex layout, show ordering and margins instead of Grid coordinates */}
        {section.layoutMode === 'flex' ? (
          <>
            {/* Element Ordering Controls */}
            <div className="property-group flex flex-col gap-2">
              <label className="group-title">섹션 내 배치 순서 이동</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-1.5 px-3 rounded text-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                  onClick={() => moveElementOrder('up')}
                  title="이전 위치로 요소를 한 칸 이동합니다"
                >
                  순서 올리기 (Move Up/Left)
                </button>
                <button
                  type="button"
                  className="flex-1 py-1.5 px-3 rounded text-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                  onClick={() => moveElementOrder('down')}
                  title="다음 위치로 요소를 한 칸 이동합니다"
                >
                  순서 내리기 (Move Down/Right)
                </button>
              </div>
            </div>

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
                        value={element.color.startsWith('#') && element.color.length === 7 ? element.color : '#000000'}
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

    </div>
  );
};
