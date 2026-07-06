import { useState, useEffect } from 'react';
import { Section, GuidelineWidth, ExportFileName, GeneratedFiles } from './types';
import { EditorContainer } from './components/EditorContainer';
import { CodeViewerContainer } from './components/CodeViewerContainer';
import { generateCode } from './utils/exporter';
import './App.css';

// Initial high-fidelity template sections and elements
const INITIAL_SECTIONS: Section[] = [
  {
    id: 's1',
    height: 400,
    backgroundColor: '#0f172a', // Slate 900 dark theme
    elements: [
      {
        id: 'e1',
        type: 'title',
        gridX: 0,
        gridW: 12,
        gridY: 1,
        gridH: 2,
        content: 'GRID.design 반응형 웹 에디터',
        color: '#f8fafc',
        fontSize: '32px',
        fontFamily: '본고딕 (Noto Sans KR)',
        align: 'center',
      },
      {
        id: 'e2',
        type: 'text',
        gridX: 2,
        gridW: 8,
        gridY: 3,
        gridH: 2,
        content: '시각적이고 정밀한 그리드 시스템을 기반으로 타이틀, 이미지, 글상자, 버튼을 직접 드래그해서 배치해보세요. 우측 코드 뷰어에서 실시간으로 시멘틱 HTML과 CSS 변수가 촘촘히 엮인 코드가 생성되는 모습을 확인할 수 있습니다.',
        color: '#94a3b8',
        fontSize: '14px',
        fontFamily: '본고딕 (Noto Sans KR)',
        align: 'center',
      },
      {
        id: 'e3',
        type: 'button',
        gridX: 4,
        gridW: 4,
        gridY: 5,
        gridH: 1,
        content: '지금 체험하기',
        color: '#ffffff',
        fontSize: '13px',
        fontFamily: '본고딕 (Noto Sans KR)',
        align: 'center',
        btnBgColor: '#18a0fb',
        btnTextColor: '#ffffff',
        iconType: 'arrow',
        iconPosition: 'after',
        borderRadius: 8,
      }
    ]
  },
  {
    id: 's2',
    height: 380,
    backgroundColor: '#ffffff', // White section
    elements: [
      {
        id: 'e4',
        type: 'title',
        gridX: 0,
        gridW: 12,
        gridY: 1,
        gridH: 1,
        content: '정밀하고 유연한 컴포넌트 제어',
        color: '#0f172a',
        fontSize: '24px',
        fontFamily: '본고딕 (Noto Sans KR)',
        align: 'center',
      },
      {
        id: 'e5',
        type: 'image',
        gridX: 0,
        gridW: 5,
        gridY: 2,
        gridH: 5,
        src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
        content: '',
        color: '',
        fontSize: '14px',
        fontFamily: '본고딕 (Noto Sans KR)',
        align: 'center',
        borderRadius: 12,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      {
        id: 'e6',
        type: 'text',
        gridX: 6,
        gridW: 6,
        gridY: 2,
        gridH: 4,
        content: '본 에디터는 피그마와 유사한 UI 구조를 지니고 있습니다. 그리드 내부에서의 스냅(Snap) 기능과 정렬 기능을 제공하며, 이미지에는 둥근 모서리(Border Radius)와 박스 섀도우(Box Shadow)를 쉽게 가미할 수 있습니다. 한글 폰트는 Noto Sans KR, 나눔고딕 등 구글 폰트를 편리하게 적용할 수 있습니다.',
        color: '#475569',
        fontSize: '14px',
        fontFamily: '본고딕 (Noto Sans KR)',
        align: 'left',
      }
    ]
  }
];

import JSZip from 'jszip';
import { updateGoogleFontsInDOM } from './utils/fontManager';

function App() {
  const [guideline, setGuideline] = useState<GuidelineWidth>('80%');
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [activeElement, setActiveElement] = useState<{ sectionId: string; elementId: string } | null>(null);
  const [activeFile, setActiveFile] = useState<ExportFileName>('index.html');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles>({
    'index.html': '',
    'style.css': '',
    'variables.css': '',
  });

  // Re-generate HTML/CSS on sections or guideline width change
  useEffect(() => {
    const code = generateCode(sections, guideline);
    setGeneratedFiles(code);
  }, [sections, guideline]);

  // Synchronize Google Fonts dynamic imports in document head
  useEffect(() => {
    const activeFonts: string[] = [];
    sections.forEach(sec => {
      sec.elements.forEach(el => {
        if (el.fontFamily) {
          activeFonts.push(el.fontFamily);
        }
      });
    });
    updateGoogleFontsInDOM(activeFonts);
  }, [sections]);

  // Export single page layout as a zip bundle containing index.html, style.css, and variables.css
  const handleExport = async () => {
    try {
      const zip = new JSZip();
      zip.file('index.html', generatedFiles['index.html']);
      zip.file('style.css', generatedFiles['style.css']);
      zip.file('variables.css', generatedFiles['variables.css']);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'grid-export.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      // Fallback: download active file only
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
      {/* 60% Width Left Pane: Web Page Editor */}
      <div className="pane-editor">
        <EditorContainer
          guideline={guideline}
          setGuideline={setGuideline}
          sections={sections}
          setSections={setSections}
          activeElement={activeElement}
          setActiveElement={setActiveElement}
          onExport={handleExport}
        />
      </div>

      {/* 40% Width Right Pane: VSCode Code Viewer */}
      <div className="pane-viewer">
        <CodeViewerContainer
          generatedFiles={generatedFiles}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
        />
      </div>

      <style>{`
        .app-split-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .pane-editor {
          width: 60%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .pane-viewer {
          width: 40%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
}

export default App;
