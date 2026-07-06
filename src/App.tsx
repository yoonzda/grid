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
    height: 450,
    backgroundColor: '#ffffff', // Clean white background
    elements: [],
  }
];

import JSZip from 'jszip';
import { updateGoogleFontsInDOM } from './utils/fontManager';

function App() {
  const [guideline, setGuideline] = useState<GuidelineWidth>('80%');
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [activeElement, setActiveElement] = useState<{ sectionId: string; elementId: string } | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<ExportFileName>('index.html');
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);
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
      {/* Left Pane: Web Page Editor */}
      <div className={`pane-editor ${isCodeViewerOpen ? 'code-open' : 'code-closed'}`}>
        <EditorContainer
          guideline={guideline}
          setGuideline={setGuideline}
          sections={sections}
          setSections={setSections}
          activeElement={activeElement}
          setActiveElement={setActiveElement}
          activeSectionId={activeSectionId}
          setActiveSectionId={setActiveSectionId}
          onExport={handleExport}
          isCodeViewerOpen={isCodeViewerOpen}
          setIsCodeViewerOpen={setIsCodeViewerOpen}
        />
      </div>

      {/* Right Pane: VSCode Code Viewer */}
      <div className={`pane-viewer ${isCodeViewerOpen ? 'code-open' : 'code-closed'}`}>
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
          height: 100%;
          overflow: hidden;
          position: relative;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pane-editor.code-open {
          width: 60%;
        }

        .pane-editor.code-closed {
          width: 100%;
        }

        .pane-viewer {
          height: 100%;
          overflow: hidden;
          position: relative;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-left-color 0.3s;
          background-color: var(--vscode-bg);
        }

        .pane-viewer.code-open {
          width: 40%;
          border-left: 1px solid var(--figma-border);
        }

        .pane-viewer.code-closed {
          width: 0;
          border-left: 0 solid transparent;
        }
      `}</style>
    </div>
  );
}

export default App;
