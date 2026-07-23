export type GuidelineWidth = '100%' | '80%' | '60%';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'filled' | 'outlined' | 'ghost';

export type ElementType = 'title' | 'text' | 'image' | 'button' | 'three-column' | 'legal-doc';

export interface LegalSubclauseItem {
  id: string;
  num: string;
  content: string;
}

export interface LegalClauseItem {
  id: string;
  num: string;
  content: string;
  subItems?: LegalSubclauseItem[];
}

export interface LegalArticleItem {
  id: string;
  title: string;
  num?: string;
  content?: string;
  clauses?: LegalClauseItem[];
  subItems?: LegalSubclauseItem[];
  isOpen?: boolean;
}

export interface EditorElement {
  id: string;
  type: ElementType;
  gridX: number; // 0 to 11 (12-column grid col index)
  gridW: number; // 1 to 12 (column span)
  gridY: number; // grid row start index
  gridH: number; // grid row height (in row units, e.g. 40px per unit)
  
  content?: string; // text content for title, text, button
  color?: string; // text color (hex)
  fontSize?: string; // e.g. '16px', '32px', 'var(--font-xl)'
  fontFamily?: string; // Google Font name
  align?: 'left' | 'center' | 'right';
  
  // Image properties
  src?: string;
  imageName?: string; // The filename of the uploaded image
  borderRadius?: number; // border-radius in px
  boxShadow?: string; // shadow style preset
  paddingX?: number;
  
  // Button properties
  btnBgColor?: string;
  btnTextColor?: string;
  iconType?: 'none' | 'arrow' | 'mail' | 'link' | 'phone' | 'home';
  iconPosition?: 'before' | 'after';
  widthMode?: 'stretch' | 'fit-content' | 'fixed';
  fixedWidth?: number;
  btnSize?: ButtonSize;
  btnVariant?: ButtonVariant;
  fontPresetId?: string;
  marginBottom?: number;
  marginRight?: number;

  // Button action & link properties
  linkType?: 'none' | 'page' | 'url';
  linkPageId?: string;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';

  // 3-column properties
  col1Title?: string;
  col1Text?: string;
  col1Icon?: 'none' | 'arrow' | 'mail' | 'link' | 'phone' | 'home';
  col2Title?: string;
  col2Text?: string;
  col2Icon?: 'none' | 'arrow' | 'mail' | 'link' | 'phone' | 'home';
  col3Title?: string;
  col3Text?: string;
  col3Icon?: 'none' | 'arrow' | 'mail' | 'link' | 'phone' | 'home';

  // 3-column styling properties
  colTitleColor?: string;
  colTitleSize?: string;
  colTextColor?: string;
  colTextSize?: string;
  colIconColor?: string;
  colShowIconBg?: boolean;
  colIconBgColor?: string;
  colTitlePresetId?: string;
  colTextPresetId?: string;
  colGap?: number;
  colContentGap?: number;

  // Legal Document / Accordion properties
  legalArticles?: LegalArticleItem[];
  legalStyle?: 'list' | 'accordion';
  legalHeaderColor?: string;
  legalNumberColor?: string;
  legalChapterTitle?: string;
}

export type HeaderLayoutType = 'spread-center' | 'spread-between' | 'left' | 'center' | 'right' | 'even-space';

export interface HeaderMenuItem {
  id: string;
  name: string;
  fileName: string;
}

export interface Section {
  id: string;
  height: number; // in pixels (default 400 or 500)
  backgroundColor: string; // background color hex
  backgroundImage?: string; // background image URL or base64 data URL
  backgroundImageName?: string; // The filename of the uploaded background image
  backgroundPosition?: string; // background position, e.g. center
  backgroundSize?: string; // background size, e.g. cover
  backgroundRepeat?: string; // background repeat, e.g. no-repeat
  elements: EditorElement[];
  isShared?: boolean; // Common layout section (Header/Footer)
  sharedType?: 'header' | 'footer';
  // Layout and alignment mode (Grid or Flex Flow)
  layoutMode?: 'grid' | 'flex' | string;
  guidelineWidth?: GuidelineWidth;
  flexDirection?: 'vertical' | 'horizontal';
  flexGap?: number;
  flexAlign?: 'start' | 'center' | 'end' | 'space-between';
  
  // Section Padding & Height alignment mode
  heightMode?: 'fixed' | 'auto';
  heightUnit?: 'px' | 'vh' | 'dvh';
  paddingTop?: number;
  paddingBottom?: number;
  verticalAlign?: 'start' | 'center' | 'end';
  
  // Header Component fields
  headerLayout?: HeaderLayoutType;
  headerShowLogo?: boolean;
  headerShowMenu?: boolean;
  headerShowBtn?: boolean;
  
  headerLogoText?: string;
  headerLogoColor?: string;
  headerLogoSize?: string;
  headerLogoType?: 'text' | 'image';
  headerLogoImg?: string;
  headerLogoImgName?: string;
  headerLogoWidth?: number;
  
  headerMenuItems?: HeaderMenuItem[];
  headerMenuColor?: string;
  headerMenuSize?: string;
  
  headerBtnText?: string;
  headerBtnBgColor?: string;
  headerBtnTextColor?: string;
  headerBtnRadius?: number;
  
  // Custom Gaps & Fonts for Header Component
  headerGap?: number;
  headerMenuGap?: number;
  headerLogoFont?: string;
  headerMenuFont?: string;
  headerBtnFont?: string;
  headerBtnSize?: ButtonSize;
  headerBtnVariant?: ButtonVariant;
  headerPaddingY?: number;

  // Footer Component fields
  footerCompany?: string;
  footerRepresentative?: string;
  footerAddress?: string;
  footerTel?: string;
  footerBizNum?: string;
  footerLinksText?: string;
  footerCopyright?: string;
  footerLayout?: 'left-corporate' | 'stacked-center' | 'split-between' | 'simple-center';
  footerText?: string;
  footerTextColor?: string;
  footerSubTextColor?: string;
  footerTextSize?: string;
  footerTextFont?: string;
  footerAlign?: 'left' | 'center' | 'right';
  footerPaddingY?: number;
}

export interface Page {
  id: string;
  name: string; // Korean / display name (e.g. '메인')
  fileName: string; // HTML filename (e.g. 'index.html', 'introduce.html')
  sections: Section[];
  isSystem?: boolean;
}

export interface FontPreset {
  id: string;
  name: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  color: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontPresets: FontPreset[];
  defaultFlexGap?: number;
  defaultSectionPadding?: number;
}

export type ExportFileName = string;

export interface GeneratedFiles {
  [fileName: string]: string;
}
