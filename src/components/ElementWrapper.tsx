import React, { useRef } from 'react';
import { EditorElement, Page } from '../types';
import { getIconSvg } from '../utils/iconTemplates';
import { getFontFamilyByFamilyName } from '../utils/fontManager';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface ElementWrapperProps {
  element: EditorElement;
  sectionId: string;
  parentLayoutMode?: 'grid' | 'flex';
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.MouseEvent, sectionId: string, element: EditorElement, containerWidth: number) => void;
  onResizeStart?: (e: React.MouseEvent, sectionId: string, element: EditorElement, handle: 'r' | 'b' | 'br', containerWidth: number) => void;
  onTextChange?: (sectionId: string, elementId: string, newText: string) => void;
  pages?: Page[];
  onNavigatePage?: (id: string) => void;
}

export const ElementWrapper: React.FC<ElementWrapperProps> = ({
  element,
  sectionId,
  parentLayoutMode = 'grid',
  isActive,
  onClick,
  onContextMenu,
  onDragStart,
  onResizeStart,
  onTextChange,
  pages,
  onNavigatePage,
}) => {
  const isEditingRef = useRef(false);
  const textInputRef = useRef<HTMLDivElement>(null);

  // Trigger drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);

    // Prevent dragging if double clicked to edit text or dragging is disabled
    if (isEditingRef.current || !onDragStart) return;
    
    const gridContainer = (e.currentTarget as HTMLElement).closest('.section-grid-container');
    if (gridContainer) {
      const containerWidth = gridContainer.getBoundingClientRect().width;
      onDragStart(e, sectionId, element, containerWidth);
    }
  };

  // Trigger resize start
  const handleResizeMouseDown = (e: React.MouseEvent, handle: 'r' | 'b' | 'br') => {
    e.stopPropagation();
    if (!onResizeStart) return;
    const gridContainer = (e.currentTarget as HTMLElement).closest('.section-grid-container');
    if (gridContainer) {
      const containerWidth = gridContainer.getBoundingClientRect().width;
      onResizeStart(e, sectionId, element, handle, containerWidth);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === 'title' || element.type === 'text' || element.type === 'button') {
      isEditingRef.current = true;
      if (textInputRef.current) {
        textInputRef.current.contentEditable = 'true';
        textInputRef.current.focus();
      }
    }
  };

  const handleBlur = () => {
    isEditingRef.current = false;
    if (textInputRef.current) {
      textInputRef.current.contentEditable = 'false';
      const newText = textInputRef.current.innerText || '';
      if (onTextChange) {
        onTextChange(sectionId, element.id, newText);
      }
    }
  };

  const renderContent = () => {
    const fontStyle = element.fontFamily ? getFontFamilyByFamilyName(element.fontFamily) : undefined;
    const hasPreset = !!element.fontPresetId;
    
    const textStyle: React.CSSProperties = {
      fontFamily: hasPreset ? undefined : fontStyle,
      color: hasPreset ? undefined : element.color,
      fontSize: hasPreset ? undefined : element.fontSize,
      textAlign: element.align,
      width: '100%',
      outline: 'none',
      wordBreak: 'break-word',
    };

    if (element.type === 'title') {
      const isHtml = typeof element.content === 'string' && (element.content.trim().startsWith('<') || element.content.includes('<div') || element.content.includes('<p'));

      if (isHtml) {
        return (
          <h2
            ref={textInputRef}
            className={`canvas-title-inner ${hasPreset ? `font-preset-${element.fontPresetId}` : ''}`}
            style={{ ...textStyle, fontWeight: 700, margin: 0 }}
            onBlur={handleBlur}
            onDoubleClick={handleDoubleClick}
            dangerouslySetInnerHTML={{ __html: element.content || '' }}
            suppressContentEditableWarning
          />
        );
      }

      return (
        <h2
          ref={textInputRef}
          className={`canvas-title-inner ${hasPreset ? `font-preset-${element.fontPresetId}` : ''}`}
          style={{ ...textStyle, fontWeight: 700, margin: 0 }}
          onBlur={handleBlur}
          onDoubleClick={handleDoubleClick}
          suppressContentEditableWarning
        >
          {element.content}
        </h2>
      );
    }

    if (element.type === 'text') {
      const isHtml = typeof element.content === 'string' && (element.content.trim().startsWith('<') || element.content.includes('<div') || element.content.includes('<p') || element.content.includes('<ul'));

      if (isHtml) {
        return (
          <div
            ref={textInputRef}
            className={`canvas-text-inner ${hasPreset ? `font-preset-${element.fontPresetId}` : ''}`}
            style={textStyle}
            onBlur={handleBlur}
            onDoubleClick={handleDoubleClick}
            dangerouslySetInnerHTML={{ __html: element.content || '' }}
            suppressContentEditableWarning
          />
        );
      }

      return (
        <div
          ref={textInputRef}
          className={`canvas-text-inner ${hasPreset ? `font-preset-${element.fontPresetId}` : ''}`}
          style={textStyle}
          onBlur={handleBlur}
          onDoubleClick={handleDoubleClick}
          suppressContentEditableWarning
        >
          {element.content}
        </div>
      );
    }

    if (element.type === 'image') {
      const imgSrc = element.imageName ? element.src : (element.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800');
      return (
        <div className="canvas-image-inner w-full h-full">
          <img
            src={imgSrc}
            alt="본문 이미지"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: `${element.borderRadius ?? 0}px`,
              boxShadow: element.boxShadow || 'none',
              display: 'block',
            }}
          />
        </div>
      );
    }

    if (element.type === 'button') {
      const iconSvg = getIconSvg(element.iconType);
      const variant = element.btnVariant || 'filled';
      const size = element.btnSize || 'medium';
      
      let bgColor = element.btnBgColor || 'var(--theme-primary)';
      let textColor = element.btnTextColor || '#ffffff';
      let borderStyle = 'none';
      
      if (variant === 'outlined') {
        bgColor = 'transparent';
        textColor = element.btnBgColor || 'var(--theme-primary)';
        borderStyle = `2px solid ${element.btnBgColor || 'var(--theme-primary)'}`;
      } else if (variant === 'ghost') {
        bgColor = 'transparent';
        textColor = element.btnBgColor || 'var(--theme-primary)';
        borderStyle = 'none';
      }
      
      let padY = '10px';
      let defaultPadX = 20;
      let fSize: string | undefined = element.fontSize || '14px';
      let fFamily: string | undefined = fontStyle;
      
      if (size === 'small') {
        padY = '6px';
        defaultPadX = 12;
        if (!hasPreset) fSize = element.fontSize || '12px';
      } else if (size === 'large') {
        padY = '14px';
        defaultPadX = 28;
        if (!hasPreset) fSize = element.fontSize || '16px';
      }

      if (hasPreset) {
        fSize = undefined;
        fFamily = undefined;
      }
      
      const padX = `${element.paddingX ?? defaultPadX}px`;
      const pad = `${padY} ${padX}`;

      const targetPage = pages && element.linkType === 'page' ? pages.find(p => p.id === (element.linkPageId || 'main')) : undefined;

      return (
        <div
          className={`canvas-btn-inner btn-${variant} btn-${size} ${hasPreset ? `font-preset-${element.fontPresetId}` : ''} relative group`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.align === 'center' ? 'center' : element.align === 'right' ? 'flex-end' : 'flex-start',
            gap: '8px',
            width: '100%',
            height: '100%',
            padding: pad,
            backgroundColor: bgColor,
            color: hasPreset ? undefined : textColor,
            border: borderStyle,
            borderRadius: `${element.borderRadius ?? 6}px`,
            fontSize: fSize,
            fontFamily: fFamily,
            fontWeight: hasPreset ? undefined : 600,
            boxSizing: 'border-box',
            transition: 'background-color 0.2s, opacity 0.2s',
            cursor: element.linkType ? 'pointer' : 'default',
          }}
        >
          {/* Action indicator badge on active element */}
          {isActive && element.linkType === 'page' && targetPage && (
            <div
              className="absolute -top-3 right-2 bg-[#0284c7] text-white text-[10px] px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shadow-md z-30 cursor-pointer hover:bg-[#0369a1] transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (onNavigatePage) {
                  onNavigatePage(targetPage.id);
                  alert(`'${targetPage.name}' (${targetPage.fileName}) 페이지로 이동했습니다!`);
                }
              }}
              title="클릭하여 연결된 페이지로 이동 확인"
            >
              <span>🔗 {targetPage.name} 이동</span>
              <ArrowRight size={10} />
            </div>
          )}

          {isActive && element.linkType === 'url' && element.linkUrl && (
            <div
              className="absolute -top-3 right-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shadow-md z-30 cursor-pointer hover:bg-emerald-700 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                window.open(element.linkUrl, element.linkTarget || '_blank');
              }}
              title="클릭하여 외부 링크 이동 확인"
            >
              <span>🌐 외부 링크</span>
              <ExternalLink size={10} />
            </div>
          )}

          {iconSvg && element.iconPosition === 'before' && (
            <span className="btn-icon-wrapper" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: iconSvg }} />
          )}
          <span
            ref={textInputRef}
            onBlur={handleBlur}
            onDoubleClick={handleDoubleClick}
            suppressContentEditableWarning
            style={{ outline: 'none', textAlign: element.align }}
          >
            {element.content}
          </span>
          {iconSvg && element.iconPosition === 'after' && (
            <span className="btn-icon-wrapper" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: iconSvg }} />
          )}
        </div>
      );
    }
    if (element.type === 'three-column') {
      const col1IconSvg = getIconSvg(element.col1Icon);
      const col2IconSvg = getIconSvg(element.col2Icon);
      const col3IconSvg = getIconSvg(element.col3Icon);

      const hasTitlePreset = !!element.colTitlePresetId;
      const hasTextPreset = !!element.colTextPresetId;

      const titleColor = hasTitlePreset ? undefined : (element.colTitleColor || 'var(--theme-primary)');
      const titleSize = hasTitlePreset ? undefined : (element.colTitleSize || '18px');
      const titleFont = hasTitlePreset ? undefined : fontStyle;

      const textColor = hasTextPreset ? undefined : (element.colTextColor || 'var(--theme-text)');
      const textSize = hasTextPreset ? undefined : (element.colTextSize || '14px');
      const textFont = hasTextPreset ? undefined : fontStyle;

      const iconColor = element.colIconColor || 'var(--theme-primary)';
      const showIconBg = !!element.colShowIconBg;
      const iconBgColor = element.colIconBgColor || 'rgba(24, 160, 251, 0.1)';

      const elAlign = element.align || 'left';

      const renderColumn = (title?: string, text?: string, iconSvg?: string) => {
        return (
          <div className="three-column-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: elAlign === 'left' ? 'flex-start' : elAlign === 'right' ? 'flex-end' : 'center', textAlign: elAlign, minWidth: 0, gap: `${element.colContentGap ?? 8}px` }}>
            {iconSvg && (
              showIconBg ? (
                <div className="three-col-icon-circle" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: iconBgColor,
                  color: iconColor,
                }} dangerouslySetInnerHTML={{ __html: iconSvg.replace(/width="16"/g, 'width="24"').replace(/height="16"/g, 'height="24"') }} />
              ) : (
                <div className="three-col-icon-wrapper" style={{
                  display: 'flex',
                  color: iconColor,
                }} dangerouslySetInnerHTML={{ __html: iconSvg.replace(/width="16"/g, 'width="28"').replace(/height="16"/g, 'height="28"') }} />
              )
            )}
            <h3 
              className={hasTitlePreset ? `font-preset-${element.colTitlePresetId}` : ''}
              style={{ margin: 0, fontSize: titleSize, fontWeight: 700, color: titleColor, fontFamily: titleFont, width: '100%' }}
            >
              {title || '타이틀'}
            </h3>
            <p 
              className={hasTextPreset ? `font-preset-${element.colTextPresetId}` : ''}
              style={{ margin: 0, fontSize: textSize, color: textColor, fontFamily: textFont, lineHeight: 1.5, width: '100%', wordBreak: 'break-word' }}
            >
              {text || '본문 내용을 입력하세요.'}
            </p>
          </div>
        );
      };

      return (
        <div className="canvas-three-column-inner" style={{ display: 'flex', gap: `${element.colGap ?? 24}px`, width: '100%', padding: '12px 0' }}>
          {renderColumn(element.col1Title, element.col1Text, col1IconSvg)}
          {renderColumn(element.col2Title, element.col2Text, col2IconSvg)}
          {renderColumn(element.col3Title, element.col3Text, col3IconSvg)}
        </div>
      );
    }

    if (element.type === 'legal-doc') {
      const articles = element.legalArticles || [];
      const numberColor = element.legalNumberColor || 'var(--theme-primary, #0284c7)';
      const headerColor = element.legalHeaderColor || '#0f172a';

      return (
        <div className="legal-doc-container w-full" style={{ textAlign: element.align || 'left' }}>
          <ul className="legal-chapter-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li className="legal-chapter-item">
              <ul className="legal-article-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {articles.map((art, idx) => {
                  const clausesList = (art.clauses && art.clauses.length > 0)
                    ? art.clauses
                    : [{ id: `${art.id}-c0`, num: art.num || '', content: art.content || '', subItems: art.subItems }];

                  return (
                    <li key={art.id || idx} className="legal-article-item" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <div className="legal-article-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h5 className="legal-article-title" style={{ color: headerColor, margin: 0, fontSize: '15px', fontWeight: 700 }}>
                          {art.title}
                        </h5>
                      </div>

                      <ol className="legal-clause-list" style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {clausesList.map((clause, cIdx) => (
                          <li key={clause.id || cIdx} className="legal-clause-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            {clause.num && (
                              <span className="legal-clause-num" style={{ color: numberColor, fontWeight: 700, minWidth: '28px', flexShrink: 0 }}>
                                {clause.num}
                              </span>
                            )}
                            <div className="legal-clause-body" style={{ flex: 1, fontSize: '13.5px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                              {clause.content}

                              {clause.subItems && clause.subItems.length > 0 && (
                                <ol className="legal-subclause-list" style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {clause.subItems.map((sub, sIdx) => (
                                    <li key={sub.id || sIdx} className="legal-subclause-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#475569' }}>
                                      <span className="legal-subclause-num" style={{ fontWeight: 600, color: '#64748b', minWidth: '20px', flexShrink: 0 }}>{sub.num}</span>
                                      <div className="legal-subclause-body" style={{ flex: 1 }}>{sub.content}</div>
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`editor-element-wrapper relative flex ${isActive ? 'active' : ''}`}
      style={parentLayoutMode === 'flex' ? {
        zIndex: isActive ? 10 : 2,
        cursor: 'default',
        pointerEvents: 'auto',
        borderRadius: element.type === 'button' || element.type === 'image' ? element.borderRadius : 0,
        boxShadow: element.boxShadow || 'none',
        width: element.widthMode === 'fixed' ? `${element.fixedWidth ?? 150}px` : element.widthMode === 'fit-content' ? 'fit-content' : '100%',
        alignSelf: (element.widthMode === 'fit-content' || element.widthMode === 'fixed')
          ? (element.align === 'center' ? 'center' : element.align === 'right' ? 'flex-end' : 'flex-start')
          : 'stretch',
        marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined,
        marginRight: element.marginRight ? `${element.marginRight}px` : undefined,
        height: 'auto',
      } : {
        gridColumn: `${element.gridX + 1} / span ${element.gridW}`,
        gridRow: `${element.gridY + 1} / span ${element.gridH}`,
        zIndex: isActive ? 10 : 2,
        cursor: 'move',
        pointerEvents: 'auto',
        borderRadius: element.type === 'button' || element.type === 'image' ? element.borderRadius : 0,
        boxShadow: element.boxShadow || 'none',
        width: element.widthMode === 'fixed' ? `${element.fixedWidth ?? 150}px` : element.widthMode === 'fit-content' ? 'fit-content' : '100%',
        justifySelf: (element.widthMode === 'fit-content' || element.widthMode === 'fixed')
          ? (element.align === 'center' ? 'center' : element.align === 'right' ? 'end' : 'start')
          : 'stretch',
        height: element.type === 'image' ? '100%' : 'fit-content',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) onContextMenu(e);
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Component Core Content */}
      <div className="element-inner-content w-full h-full flex flex-col justify-center">
        {renderContent()}
      </div>

      {/* Resize Handles (Only shown when active) */}
      {isActive && parentLayoutMode !== 'flex' && (
        <>
          {/* Right side handle */}
          <div
            className="resize-handle handle-r"
            onMouseDown={(e) => handleResizeMouseDown(e, 'r')}
          ></div>
          {/* Bottom side handle */}
          <div
            className="resize-handle handle-b"
            onMouseDown={(e) => handleResizeMouseDown(e, 'b')}
          ></div>
          {/* Bottom-right corner handle */}
          <div
            className="resize-handle handle-br"
            onMouseDown={(e) => handleResizeMouseDown(e, 'br')}
          ></div>
        </>
      )}

      <style>{`
        .editor-element-wrapper {
          border: 1.5px solid transparent;
          transition: border-color 0.15s;
          padding: 0;
        }

        .editor-element-wrapper:hover {
          border-color: rgba(24, 160, 251, 0.4);
        }

        .editor-element-wrapper.active {
          border: 1.5px solid var(--figma-accent) !important;
          box-shadow: 0 2px 6px rgba(24, 160, 251, 0.2);
        }

        .element-inner-content {
          pointer-events: auto;
          width: 100%;
          height: 100%;
        }

        /* Resizing handles styling */
        .resize-handle {
          position: absolute;
          z-index: 50;
        }

        .handle-r {
          top: 0;
          right: -4px;
          width: 8px;
          height: 100%;
          cursor: col-resize;
          background: transparent;
        }

        .handle-b {
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 8px;
          cursor: row-resize;
          background: transparent;
        }

        .handle-br {
          bottom: -4px;
          right: -4px;
          width: 8px;
          height: 8px;
          cursor: nwse-resize;
          background: #ffffff;
          border: 1.5px solid var(--figma-accent);
          border-radius: 2px;
        }

        .btn-icon-wrapper svg {
          display: block;
        }
      `}</style>
    </div>
  );
};
