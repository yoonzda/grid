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

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageName?: string;
  btnText?: string;
  linkType?: 'none' | 'page' | 'url';
  linkPageId?: string;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
}

export interface NewsCardItem {
  id: string;
  tag: string;
  title: string;
  date: string;
  description?: string;
  imageSrc: string;
  imageName?: string;
  linkType?: 'none' | 'page' | 'url';
  linkPageId?: string;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
}

export interface MainSlideItem {
  id: string;
  title: string;
  description: string;
  
  mediaType?: 'image' | 'video' | 'youtube';
  
  imageSrc: string;
  imageName?: string;
  
  videoSrc?: string;
  videoName?: string;
  
  youtubeUrl?: string;
  youtubeId?: string;

  overlayOpacity?: number; // 0 ~ 90 %

  btnText?: string;
  linkType?: 'none' | 'page' | 'url';
  linkPageId?: string;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
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
  backgroundAttachment?: 'scroll' | 'fixed' | string; // background attachment for parallax effect
  elements: EditorElement[];
  isShared?: boolean; // Common layout section (Header/Footer)
  sharedType?: 'header' | 'footer';
  
  // Section preset & component type
  sectionPresetType?: 'main-slide' | 'features-grid' | 'promo-banner' | 'card-slider' | string;
  sectionTitle?: string;
  sectionSubTitle?: string;
  slideEffectType?: 'fade' | 'slide' | 'zoom';
  activeSlideIndex?: number;
  slideTitleMarginBottom?: number;
  slideTitleMarginVarId?: string; // Linked spacing variable ID (e.g. 'space-md')
  slideDescMarginBottom?: number;
  slideDescMarginVarId?: string; // Linked spacing variable ID (e.g. 'space-xl')

  // Main Slide Options
  autoPlay?: boolean;
  autoPlayInterval?: number; // in milliseconds (e.g. 4000)
  slideAutoPlayMode?: 'fixed' | 'video-end'; // 'fixed': 고정 시간 전환, 'video-end': 동영상 완료 시 전환
  loop?: boolean;
  enableDrag?: boolean;

  // Custom data arrays for interactive sections
  slideItems?: MainSlideItem[];
  featureItems?: FeatureItem[];
  cardItems?: NewsCardItem[];

  // CTA Button Link properties
  ctaBtnText?: string;
  ctaLinkType?: 'none' | 'page' | 'url';
  ctaLinkPageId?: string;
  ctaLinkUrl?: string;
  ctaLinkTarget?: '_blank' | '_self';

  // Layout and alignment mode (Grid or Flex Flow)
  layoutMode?: 'grid' | 'flex' | string;
  guidelineWidth?: GuidelineWidth;
  contentWidth?: GuidelineWidth;
  flexDirection?: 'vertical' | 'horizontal';
  flexGap?: number;
  flexAlign?: 'start' | 'center' | 'end' | 'space-between';
  
  // Section Padding & Height alignment mode
  heightMode?: 'fixed' | 'auto' | 'full';
  heightUnit?: 'px' | 'vh' | 'dvh';
  minHeight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  verticalAlign?: 'start' | 'center' | 'end';
  
  // Header Component fields
  headerLayout?: HeaderLayoutType;
  headerShowLogo?: boolean;
  headerShowMenu?: boolean;
  headerShowBtn?: boolean;
  headerTransparentAtTop?: boolean;
  headerScrollBgColor?: string;
  headerIsFixed?: boolean;
  
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

export interface SpacingPreset {
  id: string;
  name: string;
  value: number;
  description?: string;
}

export interface BaseColorItem {
  id: string;
  name: string;
  hex: string;
}

export interface SemanticTokenMapping {
  primary: string; // Base Color ID
  secondary: string;
  accent: string;
  brandLight: string;
  backgroundColor: string;
  surfaceColor: string;
  darkBgColor: string;
  textColor: string;
  subtextColor: string;
  borderColor: string;
}

export interface ThemeSettings {
  // 0. BASE PALETTE & SEMANTIC MAPPINGS
  baseColors?: BaseColorItem[];
  semanticMappings?: SemanticTokenMapping;

  // 1. BRAND COLOR MODULE
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  brandLightColor?: string;

  // 2. CANVAS & SURFACE MODULE
  backgroundColor: string;
  surfaceColor?: string;
  surfaceElevatedColor?: string;
  darkBgColor?: string;

  // 3. TYPOGRAPHY & CONTENT MODULE
  textColor: string;
  subtextColor?: string;
  textInverseColor?: string;

  // 4. BORDER & LINE MODULE
  borderColor?: string;

  fontFamily: string;
  fontFamilyKr?: string;
  fontFamilyEn?: string;
  fontPresets: FontPreset[];
  spacingPresets?: SpacingPreset[];
  defaultFlexGap?: number;
  defaultSectionPadding?: number;
}

export type ExportFileName = string;

export interface GeneratedFiles {
  [fileName: string]: string;
}
