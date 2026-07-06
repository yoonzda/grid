import React, { useRef } from 'react';
import { EditorElement } from '../types';
import { getIconSvg } from '../utils/iconTemplates';
import { getFontFamilyByFamilyName } from '../utils/fontManager';

interface ElementWrapperProps {
  element: EditorElement;
  sectionId: string;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent, sectionId: string, element: EditorElement, containerWidth: number) => void;
  onResizeStart: (e: React.MouseEvent, sectionId: string, element: EditorElement, handle: 'r' | 'b' | 'br', containerWidth: number) => void;
  onTextChange?: (sectionId: string, elementId: string, newText: string) => void;
}

export const ElementWrapper: React.FC<ElementWrapperProps> = ({
  element,
  sectionId,
  isActive,
  onClick,
  onDragStart,
  onResizeStart,
  onTextChange,
}) => {
  const isEditingRef = useRef(false);
  const textInputRef = useRef<HTMLDivElement>(null);

  // Trigger drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging if double clicked to edit text
    if (isEditingRef.current) return;
    
    const gridContainer = (e.currentTarget as HTMLElement).closest('.section-grid-container');
    if (gridContainer) {
      const containerWidth = gridContainer.getBoundingClientRect().width;
      onDragStart(e, sectionId, element, containerWidth);
    }
  };

  // Trigger resize start
  const handleResizeMouseDown = (e: React.MouseEvent, handle: 'r' | 'b' | 'br') => {
    e.stopPropagation();
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
    const fontStyle = getFontFamilyByFamilyName(element.fontFamily);
    const textStyle: React.CSSProperties = {
      fontFamily: fontStyle,
      color: element.color,
      fontSize: element.fontSize,
      textAlign: element.align,
      width: '100%',
      outline: 'none',
      wordBreak: 'break-word',
    };

    if (element.type === 'title') {
      return (
        <h2
          ref={textInputRef}
          className="canvas-title-inner"
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
      return (
        <div
          ref={textInputRef}
          className="canvas-text-inner"
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
      return (
        <div className="canvas-image-inner w-full h-full relative overflow-hidden">
          <img
            src={element.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: element.borderRadius,
            }}
            alt="editable"
            draggable="false"
          />
        </div>
      );
    }

    if (element.type === 'button') {
      const iconSvg = getIconSvg(element.iconType);
      return (
        <div
          className="canvas-btn-inner w-full h-full flex items-center justify-center gap-2"
          style={{
            backgroundColor: element.btnBgColor || '#18a0fb',
            color: element.btnTextColor || '#ffffff',
            borderRadius: element.borderRadius ?? 6,
            fontSize: element.fontSize,
            fontFamily: fontStyle,
            fontWeight: 600,
          }}
        >
          {iconSvg && element.iconPosition === 'before' && (
            <span className="btn-icon-wrapper" dangerouslySetInnerHTML={{ __html: iconSvg }} />
          )}
          <span
            ref={textInputRef}
            onBlur={handleBlur}
            onDoubleClick={handleDoubleClick}
            suppressContentEditableWarning
            style={{ outline: 'none' }}
          >
            {element.content}
          </span>
          {iconSvg && element.iconPosition === 'after' && (
            <span className="btn-icon-wrapper" dangerouslySetInnerHTML={{ __html: iconSvg }} />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`editor-element-wrapper relative flex ${isActive ? 'active' : ''}`}
      style={{
        gridColumn: `${element.gridX + 1} / span ${element.gridW}`,
        gridRow: `${element.gridY + 1} / span ${element.gridH}`,
        zIndex: isActive ? 10 : 2,
        cursor: 'move',
        pointerEvents: 'auto',
        borderRadius: element.type === 'button' || element.type === 'image' ? element.borderRadius : 0,
        boxShadow: element.boxShadow || 'none',
        width: element.widthMode === 'fit-content' ? 'fit-content' : '100%',
        justifySelf: element.widthMode === 'fit-content'
          ? (element.align === 'center' ? 'center' : element.align === 'right' ? 'end' : 'start')
          : 'stretch',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Component Core Content */}
      <div className="element-inner-content w-full h-full flex flex-col justify-center">
        {renderContent()}
      </div>

      {/* Resize Handles (Only shown when active) */}
      {isActive && (
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
