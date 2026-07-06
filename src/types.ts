export type GuidelineWidth = '100%' | '80%' | '60%';

export type ElementType = 'title' | 'text' | 'image' | 'button';

export interface EditorElement {
  id: string;
  type: ElementType;
  gridX: number; // 0 to 11 (12-column grid col index)
  gridW: number; // 1 to 12 (column span)
  gridY: number; // grid row start index
  gridH: number; // grid row height (in row units, e.g. 40px per unit)
  
  content: string; // text content for title, text, button
  color: string; // text color (hex)
  fontSize: string; // e.g. '16px', '32px', 'var(--font-xl)'
  fontFamily: string; // Google Font name
  align: 'left' | 'center' | 'right';
  
  // Image properties
  src?: string;
  borderRadius?: number; // border-radius in px
  boxShadow?: string; // shadow style preset
  
  // Button properties
  btnBgColor?: string;
  btnTextColor?: string;
  iconType?: 'none' | 'arrow' | 'mail' | 'link' | 'phone' | 'home';
  iconPosition?: 'before' | 'after';
}

export interface Section {
  id: string;
  height: number; // in pixels (default 400 or 500)
  backgroundColor: string; // background color hex
  backgroundImage?: string; // background image URL
  elements: EditorElement[];
}

export type ExportFileName = 'index.html' | 'style.css' | 'variables.css';

export interface GeneratedFiles {
  'index.html': string;
  'style.css': string;
  'variables.css': string;
}
