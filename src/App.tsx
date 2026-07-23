import { useState, useEffect } from 'react';
import { Section, Page, ThemeSettings, ExportFileName, GeneratedFiles, EditorElement } from './types';
import { EditorContainer } from './components/EditorContainer';
import { CodeViewerContainer } from './components/CodeViewerContainer';
import { StyleViewerContainer } from './components/StyleViewerContainer';
import { generateCode } from './utils/exporter';
import { BUSINESS_TEMPLATE, BUSINESS_THEME, MODERN_TEMPLATE, MODERN_THEME } from './utils/templates';
import './App.css';
import JSZip from 'jszip';
import { updateGoogleFontsInDOM } from './utils/fontManager';

// App root component for GRID design system builder
const compactSectionElements = (elements: EditorElement[]): EditorElement[] => {
  if (elements.length === 0) return elements;
  const minY = elements.reduce((min, el) => Math.min(min, el.gridY), Infinity);
  if (minY > 0 && minY !== Infinity) {
    return elements.map(el => ({ ...el, gridY: el.gridY - minY }));
  }
  return elements;
};

const ensurePresets = (pagesList: Page[]): Page[] => {
  const processed: Page[] = pagesList.map(p => ({
    ...p,
    sections: p.sections.map(sec => {
      const isHeaderOrFooter = sec.sharedType === 'header' || sec.sharedType === 'footer';
      const isShared = sec.isShared || isHeaderOrFooter;
      
      const mappedElements = sec.elements.map(el => {
        if (el.fontPresetId) return el;
        let fontPresetId: string | undefined = undefined;
        if (el.type === 'title') {
          fontPresetId = 'title-1';
        } else if (el.type === 'text') {
          if (el.id === 'el-footer-text' || sec.sharedType === 'footer') {
            fontPresetId = 'footer';
          } else {
            fontPresetId = 'body-1';
          }
        } else if (el.type === 'button') {
          fontPresetId = 'button';
        }
        return { ...el, fontPresetId };
      });

      if (sec.sharedType === 'footer') {
        return {
          ...sec,
          heightMode: 'auto',
          footerLayout: sec.footerLayout || 'left-corporate',
          footerCompany: sec.footerCompany || '(주) 코퍼레이트',
          footerRepresentative: sec.footerRepresentative || '홍길동',
          footerAddress: sec.footerAddress || '서울특별시 강남구 테헤란로 501, 15층 (삼성동, 코퍼레이트타워)',
          footerTel: sec.footerTel || '1588-0000',
          footerBizNum: sec.footerBizNum || '123-45-67890',
          footerLinksText: sec.footerLinksText || '개인정보처리방침   이용약관',
          footerCopyright: sec.footerCopyright || 'Copyright © Corporate Inc. All rights reserved.',
          footerShowChannelBadge: sec.footerShowChannelBadge !== undefined ? sec.footerShowChannelBadge : true,
          footerTextColor: sec.footerTextColor || '#0f172a',
          footerSubTextColor: sec.footerSubTextColor || '#475569',
          footerTextFont: sec.footerTextFont || 'Inter',
          footerPaddingY: sec.footerPaddingY !== undefined ? sec.footerPaddingY : 36,
          elements: [],
        };
      }

      return {
        ...sec,
        layoutMode: 'flex',
        flexDirection: sec.flexDirection || 'vertical',
        flexGap: sec.flexGap !== undefined ? sec.flexGap : 16,
        flexAlign: sec.flexAlign || 'center',
        heightMode: isHeaderOrFooter ? 'auto' : (sec.heightMode || 'fixed'),
        paddingTop: sec.paddingTop !== undefined ? sec.paddingTop : (isHeaderOrFooter ? 16 : 40),
        paddingBottom: sec.paddingBottom !== undefined ? sec.paddingBottom : (isHeaderOrFooter ? 16 : 40),
        verticalAlign: sec.verticalAlign || 'center',
        elements: isShared ? mappedElements : compactSectionElements(mappedElements)
      };
    })
  }));

  let sitemapPage = processed.find((p: Page) => p.id === 'sitemap');
  if (!sitemapPage) {
    sitemapPage = {
      id: 'sitemap',
      name: '사이트맵',
      fileName: 'siteMap.html',
      isSystem: true,
      sections: []
    };
  }

  const otherPages = processed.filter((p: Page) => p.id !== 'sitemap');
  return [sitemapPage, ...otherPages];
};

function App() {
  const [activeTemplate, setActiveTemplate] = useState<'business' | 'modern'>('business');
  const [themeSettings, rawSetThemeSettings] = useState<ThemeSettings>(BUSINESS_THEME);

  const setThemeSettings = (updateAction: React.SetStateAction<ThemeSettings>) => {
    rawSetThemeSettings(prev => {
      const next = typeof updateAction === 'function' ? updateAction(prev) : updateAction;
      
      const primaryChanged = next.primaryColor !== prev.primaryColor;
      const secondaryChanged = next.secondaryColor !== prev.secondaryColor;
      const textChanged = next.textColor !== prev.textColor;
      const fontChanged = next.fontFamily !== prev.fontFamily;
      
      let updatedPresets = next.fontPresets;
      
      if (primaryChanged) {
        updatedPresets = updatedPresets.map(p => 
          p.color.toLowerCase() === prev.primaryColor.toLowerCase()
            ? { ...p, color: next.primaryColor }
            : p
        );
      }
      
      if (secondaryChanged) {
        updatedPresets = updatedPresets.map(p => 
          p.color.toLowerCase() === prev.secondaryColor.toLowerCase()
            ? { ...p, color: next.secondaryColor }
            : p
        );
      }

      if (textChanged) {
        updatedPresets = updatedPresets.map(p => 
          p.color.toLowerCase() === prev.textColor.toLowerCase()
            ? { ...p, color: next.textColor }
            : p
        );
      }

      if (fontChanged) {
        updatedPresets = updatedPresets.map(p => 
          p.fontFamily === prev.fontFamily
            ? { ...p, fontFamily: next.fontFamily }
            : p
        );
      }
      
      return {
        ...next,
        fontPresets: updatedPresets
      };
    });
  };
  const [pages, setPages] = useState<Page[]>(() => ensurePresets(BUSINESS_TEMPLATE));
  const [activePageId, setActivePageId] = useState<string>('main');

  const [activeElementState, setActiveElementState] = useState<{ sectionId: string; elementId: string } | null>(null);
  const [activeSectionId, setActiveSectionIdState] = useState<string | null>(null);

  const setActiveSectionId = (id: string | null) => {
    setActiveSectionIdState(id);
    setActiveElementState(null);
  };

  const setActiveElement = (el: { sectionId: string; elementId: string } | null) => {
    setActiveElementState(el);
    if (el) {
      setActiveSectionIdState(el.sectionId);
    }
  };

  const activeElement = activeElementState;
  const [activePaddingGuide, setActivePaddingGuide] = useState<{ sectionId: string; type: 'top' | 'bottom' | 'both' } | null>(null);
  const [activeFile, setActiveFile] = useState<ExportFileName>('index.html');
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);
  const [isStyleViewerOpen, setIsStyleViewerOpen] = useState(false);
  
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles>({
    'index.html': '',
    'style.css': '',
    'variables.css': '',
  });

  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const sections = activePage?.sections || [];

  // Intercept setSections to synchronize header/footer shared sections across all pages
  const setSections = (updateAction: React.SetStateAction<Section[]>) => {
    setPages(prevPages => {
      const pageIndex = prevPages.findIndex(p => p.id === activePageId);
      if (pageIndex === -1) return prevPages;

      const oldSections = prevPages[pageIndex].sections;
      const newSections = typeof updateAction === 'function' ? updateAction(oldSections) : updateAction;

      const processedSections = newSections.map(sec => {
        const isHeaderOrFooter = sec.sharedType === 'header' || sec.sharedType === 'footer';
        if (sec.isShared || isHeaderOrFooter) return sec;
        return {
          ...sec,
          layoutMode: 'flex',
          elements: compactSectionElements(sec.elements)
        };
      });

      let finalPages = prevPages.map(p => {
        if (p.id === activePageId) {
          return { ...p, sections: processedSections };
        }
        return p;
      });

      // Synchronize any shared section (e.g. header, footer) that changed
      newSections.forEach(newSec => {
        if (newSec.isShared && newSec.sharedType) {
          finalPages = finalPages.map(p => {
            if (p.id === activePageId) return p; // Skip current active page (already updated)
            return {
              ...p,
              sections: p.sections.map(s => {
                if (s.isShared && s.sharedType === newSec.sharedType) {
                  return {
                    ...s,
                    height: newSec.height,
                    backgroundColor: newSec.backgroundColor,
                    backgroundImage: newSec.backgroundImage,
                    backgroundImageName: newSec.backgroundImageName,
                    backgroundPosition: newSec.backgroundPosition,
                    backgroundSize: newSec.backgroundSize,
                    backgroundRepeat: newSec.backgroundRepeat,
                    elements: newSec.elements,
                    guidelineWidth: newSec.guidelineWidth,
                  };
                }
                return s;
              })
            };
          });
        }
      });

      return finalPages;
    });
  };

  // Add Page Action
  const addPage = (name: string, rawFileName: string) => {
    let cleanFileName = rawFileName.trim().toLowerCase().replace(/[^a-z0-9.-]/g, '_');
    if (!cleanFileName.endsWith('.html')) {
      cleanFileName += '.html';
    }

    if (pages.some(p => p.fileName === cleanFileName)) {
      alert('이미 존재하는 파일명입니다.');
      return false;
    }

    // Capture current shared header and footer elements
    const currentHeader = activePage.sections.find(s => s.isShared && s.sharedType === 'header');
    const currentFooter = activePage.sections.find(s => s.isShared && s.sharedType === 'footer');

    const defaultHeader = currentHeader ? { ...currentHeader } : {
      id: 'sec-header',
      height: 70,
      backgroundColor: 'var(--theme-primary)',
      isShared: true,
      sharedType: 'header' as const,
      elements: []
    };

    const defaultFooter = currentFooter ? { ...currentFooter } : {
      id: 'sec-footer',
      height: 100,
      backgroundColor: '#111827',
      isShared: true,
      sharedType: 'footer' as const,
      elements: []
    };

    const newPageId = `page_${Date.now()}`;
    const newPage: Page = {
      id: newPageId,
      name: name.trim(),
      fileName: cleanFileName,
      sections: [
        { ...defaultHeader, id: `header-${Date.now()}` },
        {
          id: `sec-${Date.now()}`,
          height: 400,
          backgroundColor: '#ffffff',
          elements: []
        },
        { ...defaultFooter, id: `footer-${Date.now()}` }
      ]
    };

    setPages(prev => [...prev, newPage]);
    setActivePageId(newPageId);
    return true;
  };

  // Handle Template Changes
  const handleTemplateChange = (templateKey: 'business' | 'modern') => {
    if (window.confirm('템플릿을 변경하시면 작성 중이던 기존 데이터가 모두 초기화됩니다. 변경하시겠습니까?')) {
      setActiveTemplate(templateKey);
      if (templateKey === 'business') {
        setPages(ensurePresets(BUSINESS_TEMPLATE));
        setThemeSettings(BUSINESS_THEME);
      } else {
        setPages(ensurePresets(MODERN_TEMPLATE));
        setThemeSettings(MODERN_THEME);
      }
      setActivePageId('main');
      setActiveElement(null);
      setActiveSectionId(null);
    }
  };

  // Re-generate HTML/CSS on sections, theme settings change
  useEffect(() => {
    const code = generateCode(pages, themeSettings);
    setGeneratedFiles(code);
    
    // Auto switch active files in VSCode pane if active file is deleted
    if (!code[activeFile]) {
      setActiveFile('index.html');
    }
  }, [pages, themeSettings]);

  // Synchronize Google Fonts dynamic imports in document head
  useEffect(() => {
    const activeFonts: string[] = [themeSettings.fontFamily];
    pages.forEach(p => {
      p.sections.forEach(sec => {
        sec.elements.forEach(el => {
          if (el.fontFamily) {
            activeFonts.push(el.fontFamily);
          }
        });
      });
    });
    updateGoogleFontsInDOM(activeFonts);
  }, [pages, themeSettings]);

  // Export ZIP bundle containing all generated pages, CSS files, and uploaded images
  const handleExport = async () => {
    try {
      const zip = new JSZip();
      
      // Pack all dynamic page HTML files
      Object.keys(generatedFiles).forEach(fileName => {
        zip.file(fileName, generatedFiles[fileName]);
      });

      // Pack uploaded images if any into 'images/' folder
      const imagesFolder = zip.folder('images');
      if (imagesFolder) {
        pages.forEach(page => {
          page.sections.forEach(sec => {
            if (sec.backgroundImage && sec.backgroundImage.startsWith('data:image/') && sec.backgroundImageName) {
              const base64Data = sec.backgroundImage.split(',')[1];
              imagesFolder.file(sec.backgroundImageName, base64Data, { base64: true });
            }
            sec.elements.forEach(el => {
              if (el.type === 'image' && el.src && el.src.startsWith('data:image/') && el.imageName) {
                const base64Data = el.src.split(',')[1];
                imagesFolder.file(el.imageName, base64Data, { base64: true });
              }
            });
          });
        });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'website-export.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      // Fallback
      const blob = new Blob([generatedFiles[activeFile]], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = activeFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="app-split-container">
      {/* Dynamic Theme Styles Injection */}
      <style>{`
        :root {
          --theme-primary: ${themeSettings.primaryColor};
          --theme-secondary: ${themeSettings.secondaryColor};
          --theme-bg: ${themeSettings.backgroundColor};
          --theme-text: ${themeSettings.textColor};
          --font-default: '${themeSettings.fontFamily}', sans-serif;
          
          /* Layout Global Settings */
          --theme-default-flex-gap: ${themeSettings.defaultFlexGap ?? 16}px;
          --theme-default-section-padding: ${themeSettings.defaultSectionPadding ?? 40}px;

          /* Font Presets */
          ${(themeSettings.fontPresets || []).map(p => `
          --theme-font-preset-${p.id}-size: ${p.fontSize};
          --theme-font-preset-${p.id}-font: '${p.fontFamily}', sans-serif;
          --theme-font-preset-${p.id}-weight: ${p.fontWeight};
          --theme-font-preset-${p.id}-color: ${p.color};
          `).join('\n')}
        }
        .canvas-grid-root,
        .canvas-grid-root button,
        .canvas-grid-root select,
        .canvas-grid-root input,
        .canvas-grid-root textarea {
          font-family: '${themeSettings.fontFamily}', sans-serif;
        }

        /* Preset class rules */
        ${(themeSettings.fontPresets || []).map(p => `
        .font-preset-${p.id} {
          font-size: var(--theme-font-preset-${p.id}-size) !important;
          font-family: var(--theme-font-preset-${p.id}-font) !important;
          font-weight: var(--theme-font-preset-${p.id}-weight) !important;
          color: var(--theme-font-preset-${p.id}-color) !important;
        }
        `).join('\n')}
      `}</style>

      {/* Left Pane: Web Page Editor */}
      <div className={`pane-editor ${isCodeViewerOpen ? 'code-open' : 'code-closed'}`}>
        <EditorContainer
          sections={sections}
          setSections={setSections}
          activeElement={activeElement}
          setActiveElement={setActiveElement}
          activeSectionId={activeSectionId}
          setActiveSectionId={setActiveSectionId}
          onExport={handleExport}
          isCodeViewerOpen={isCodeViewerOpen}
          setIsCodeViewerOpen={setIsCodeViewerOpen}
          isStyleViewerOpen={isStyleViewerOpen}
          setIsStyleViewerOpen={setIsStyleViewerOpen}
          
          pages={pages}
          setPages={setPages}
          activePageId={activePageId}
          setActivePageId={setActivePageId}
          activeTemplate={activeTemplate}
          onTemplateChange={handleTemplateChange}
          themeSettings={themeSettings}
          setThemeSettings={setThemeSettings}
          onAddPage={addPage}
          activePaddingGuide={activePaddingGuide}
          setActivePaddingGuide={setActivePaddingGuide}
        />
      </div>

      {/* Right Pane: VSCode Code Viewer (Overlay Drawer) */}
      <div className={`pane-viewer ${isCodeViewerOpen ? 'code-open' : 'code-closed'}`}>
        <CodeViewerContainer
          generatedFiles={generatedFiles}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          onClose={() => setIsCodeViewerOpen(false)}
        />
      </div>

      {/* Right Pane: Global Style Preset Editor Drawer (Overlay Drawer) */}
      <div className={`pane-viewer ${isStyleViewerOpen ? 'code-open' : 'code-closed'}`} style={{ zIndex: isStyleViewerOpen ? 1001 : 1000 }}>
        <StyleViewerContainer
          themeSettings={themeSettings}
          setThemeSettings={setThemeSettings}
          onClose={() => setIsStyleViewerOpen(false)}
        />
      </div>

      <style>{`
        .app-split-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .pane-editor {
          width: 100% !important;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .pane-viewer {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          z-index: 1000;
          background-color: var(--vscode-bg);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease;
          box-shadow: none;
        }

        .pane-viewer.code-open {
          width: 680px;
          transform: translateX(0);
          border-left: 1px solid var(--figma-border);
          box-shadow: -6px 0 24px rgba(0, 0, 0, 0.35);
        }

        .pane-viewer.code-closed {
          width: 680px;
          transform: translateX(100%);
          border-left: 0 solid transparent;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}

export default App;
