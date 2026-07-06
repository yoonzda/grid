import React, { useState } from 'react';
import { ExportFileName, GeneratedFiles } from '../types';
import { FileCode, Copy, Check, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';

interface CodeViewerContainerProps {
  generatedFiles: GeneratedFiles;
  activeFile: ExportFileName;
  setActiveFile: (file: ExportFileName) => void;
}

export const CodeViewerContainer: React.FC<CodeViewerContainerProps> = ({
  generatedFiles,
  activeFile,
  setActiveFile,
}) => {
  const [copied, setCopied] = useState(false);

  const code = generatedFiles[activeFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple HTML and CSS syntax highlighter for VSCode visual style
  const renderHighlightedCode = (text: string, filename: string) => {
    if (filename === 'index.html') {
      // Highlight HTML
      const lines = text.split('\n');
      return lines.map((line, idx) => {
        // Safe escape
        let html = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        // Highlight tags: &lt;tag or &lt;/tag or &gt;
        html = html.replace(/(&lt;\/?[a-zA-Z0-9-]+)/g, '<span style="color: var(--vscode-keyword);">$1</span>');
        html = html.replace(/(\/?&gt;)/g, '<span style="color: var(--vscode-keyword);">$1</span>');

        // Highlight attributes: name=
        html = html.replace(/([a-zA-Z0-9-]+)=/g, '<span style="color: var(--vscode-attr);">$1</span>=');

        // Highlight values: "value" or 'value'
        html = html.replace(/("[^"]*")/g, '<span style="color: var(--vscode-value);">$1</span>');
        html = html.replace(/('[^']*')/g, '<span style="color: var(--vscode-value);">$1</span>');

        // Highlight comments: &lt;!-- comment --&gt;
        html = html.replace(/(&lt;!--.*?--&gt;)/g, '<span style="color: var(--vscode-comment);">$1</span>');

        return (
          <div key={idx} className="code-line" style={{ display: 'flex', minHeight: '18px' }}>
            <span className="line-number">{idx + 1}</span>
            <span className="line-content" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
          </div>
        );
      });
    } else {
      // Highlight CSS / variables.css
      const lines = text.split('\n');
      return lines.map((line, idx) => {
        let html = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        // Comments: /* comment */
        html = html.replace(/(\/\*.*?\*\/)/g, '<span style="color: var(--vscode-comment);">$1</span>');

        // Selectors: .class or #id or body or :root before {
        if (!line.includes(':') && (line.includes('.') || line.includes('#') || line.includes(':root') || line.includes('{'))) {
          html = html.replace(/([#\.a-zA-Z0-9-:]+)/g, '<span style="color: var(--vscode-keyword);">$1</span>');
        }

        // Variables: --name
        html = html.replace(/(--[a-zA-Z0-9-]+)/g, '<span style="color: var(--vscode-variable);">$1</span>');

        // Properties: prop:
        html = html.replace(/([a-zA-Z0-9-]+)\s*:/g, '<span style="color: var(--vscode-css-prop);">$1</span>:');

        // Values: : val
        html = html.replace(/:\s*([^;]+)/g, (match, p1) => {
          let val = p1;
          // Highlight colors/variables/etc inside CSS values
          val = val.replace(/(var\([^)]+\))/g, '<span style="color: var(--vscode-variable);">$1</span>');
          val = val.replace(/(#[a-fA-F0-9]{3,8})/g, '<span style="color: var(--vscode-number);">$1</span>');
          val = val.replace(/([0-9]+px|[0-9]+%|[0-9]+rem)/g, '<span style="color: var(--vscode-number);">$1</span>');
          return `: <span style="color: var(--vscode-css-val);">${val}</span>`;
        });

        return (
          <div key={idx} className="code-line" style={{ display: 'flex', minHeight: '18px' }}>
            <span className="line-number">{idx + 1}</span>
            <span className="line-content" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
          </div>
        );
      });
    }
  };

  return (
    <div className="vscode-container">
      {/* VSCode Sidebar (File Explorer) */}
      <div className="vscode-sidebar">
        <div className="sidebar-header">
          <span>EXPLORER: GRID-EXPORT</span>
        </div>
        <div className="folder-tree">
          <div className="tree-node active">
            <ChevronDown size={14} style={{ marginRight: 4 }} />
            <FolderOpen size={14} className="folder-icon" />
            <span>exported-project</span>
          </div>
          <div className="tree-children">
            {(['index.html', 'style.css', 'variables.css'] as ExportFileName[]).map((file) => (
              <div
                key={file}
                className={`tree-file ${activeFile === file ? 'active' : ''}`}
                onClick={() => setActiveFile(file)}
              >
                <FileCode size={14} className="file-icon" />
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VSCode Editor Area */}
      <div className="vscode-editor">
        {/* Tab Header */}
        <div className="editor-tabs">
          {(['index.html', 'style.css', 'variables.css'] as ExportFileName[]).map((file) => (
            <div
              key={file}
              className={`editor-tab ${activeFile === file ? 'active' : ''}`}
              onClick={() => setActiveFile(file)}
            >
              <FileCode size={13} className="tab-file-icon" />
              <span>{file}</span>
            </div>
          ))}
          <div className="tab-filler"></div>
        </div>

        {/* Code Content */}
        <div className="code-viewer-viewport">
          <pre className="code-pre">
            <code>{renderHighlightedCode(code, activeFile)}</code>
          </pre>
        </div>
      </div>

      {/* Styled inline sheet for VSCode UI */}
      <style>{`
        .vscode-container {
          display: flex;
          width: 100%;
          height: 100%;
          background-color: var(--vscode-bg);
          border-left: 1px solid var(--vscode-border);
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 13px;
        }
        
        .vscode-sidebar {
          width: 180px;
          min-width: 150px;
          background-color: var(--vscode-sidebar);
          border-right: 1px solid var(--vscode-border);
          display: flex;
          flex-direction: column;
          user-select: none;
          color: var(--vscode-text);
        }

        .sidebar-header {
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--vscode-text-muted);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .folder-tree {
          padding: 8px 0;
        }

        .tree-node {
          display: flex;
          align-items: center;
          padding: 4px 12px;
          cursor: pointer;
          font-weight: 600;
        }

        .folder-icon {
          color: #e2b342;
          margin-right: 6px;
        }

        .tree-children {
          display: flex;
          flex-direction: column;
          padding-left: 12px;
        }

        .tree-file {
          display: flex;
          align-items: center;
          padding: 4px 16px;
          cursor: pointer;
          opacity: 0.8;
          transition: all 0.15s ease;
        }

        .tree-file:hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.05);
        }

        .tree-file.active {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.1);
          color: #3b91ff;
        }

        .file-icon {
          margin-right: 6px;
          color: #519aba;
        }

        .vscode-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: var(--vscode-bg);
        }

        .editor-tabs {
          display: flex;
          background-color: var(--vscode-tabs);
          height: 35px;
          align-items: center;
          border-bottom: 1px solid var(--vscode-border);
        }

        .editor-tab {
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: 100%;
          cursor: pointer;
          border-right: 1px solid var(--vscode-border);
          background-color: var(--vscode-tab-inactive);
          color: var(--vscode-text-muted);
          transition: background-color 0.15s;
          user-select: none;
        }

        .editor-tab.active {
          background-color: var(--vscode-tab-active);
          color: #ffffff;
          border-top: 1px solid var(--figma-accent);
        }

        .tab-file-icon {
          margin-right: 6px;
          color: #519aba;
        }

        .tab-filler {
          flex: 1;
          height: 100%;
          background-color: var(--vscode-tabs);
        }

        .copy-btn {
          background: rgba(24, 160, 251, 0.15);
          border: 1px solid var(--figma-accent);
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          margin-right: 10px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .copy-btn:hover {
          background: var(--figma-accent);
        }

        .code-viewer-viewport {
          flex: 1;
          overflow: auto;
          padding: 12px 0;
          color: #d4d4d4;
        }

        .code-pre {
          margin: 0;
          font-family: inherit;
        }

        .code-line {
          display: flex;
          padding: 0 10px;
        }

        .code-line:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }

        .line-number {
          display: inline-block;
          width: 35px;
          text-align: right;
          color: var(--vscode-text-muted);
          margin-right: 15px;
          user-select: none;
        }

        .line-content {
          white-space: pre-wrap;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
};
