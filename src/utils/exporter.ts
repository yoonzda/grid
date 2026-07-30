import { Page, ThemeSettings, GeneratedFiles } from '../types';
import { SUPPORTED_FONTS, getFontFamilyByFamilyName } from './fontManager';
import { getIconSvg } from './iconTemplates';

function hexToRgb(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '24, 160, 251';
  let cleanHex = hex.substring(1);
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

export const generateCode = (pages: Page[], theme: ThemeSettings): GeneratedFiles => {
  // Collect all unique google fonts used in elements across all pages, plus the theme font
  const usedFonts = new Set<string>();
  if (theme.fontFamily) {
    usedFonts.add(theme.fontFamily);
  }
  if (theme.fontPresets) {
    theme.fontPresets.forEach(preset => {
      if (preset.fontFamily) {
        usedFonts.add(preset.fontFamily);
      }
    });
  }
  pages.forEach(p => {
    p.sections.forEach(sec => {
      sec.elements.forEach(el => {
        if (el.fontFamily) {
          usedFonts.add(el.fontFamily);
        }
      });
    });
  });

  // Generate Google Fonts links
  let fontLinksHtml = '';
  const fontImports: string[] = [];
  usedFonts.forEach(fontName => {
    const font = SUPPORTED_FONTS.find(f => f.name === fontName);
    if (font) {
      fontLinksHtml += `  <link rel="preconnect" href="https://fonts.googleapis.com">\n`;
      fontLinksHtml += `  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n`;
      fontLinksHtml += `  <link href="${font.importUrl}" rel="stylesheet">\n`;
      fontImports.push(`@import url('${font.importUrl}');`);
    }
  });

  // 1. variables.css
  let variablesCss = `/* variables.css */
${fontImports.join('\n')}

:root {
  /* Theme Design Variables */
  --theme-primary: ${theme.primaryColor};
  --theme-primary-rgb: ${hexToRgb(theme.primaryColor)};
  --theme-secondary: ${theme.secondaryColor};
  --theme-bg: ${theme.backgroundColor};
  --theme-text: ${theme.textColor};
  --font-default: '${theme.fontFamily}', system-ui, -apple-system, sans-serif;

  /* Layout Global Settings */
  --theme-default-flex-gap: ${theme.defaultFlexGap ?? 16}px;
  --theme-default-section-padding: ${theme.defaultSectionPadding ?? 40}px;

  /* Font Presets */
  ${(theme.fontPresets || []).map(p => `
  --theme-font-preset-${p.id}-size: ${p.fontSize};
  --theme-font-preset-${p.id}-font: '${p.fontFamily}', sans-serif;
  --theme-font-preset-${p.id}-weight: ${p.fontWeight};
  --theme-font-preset-${p.id}-color: ${p.color};
  `).join('\n')}
`;

  // Write variables for sections and elements across ALL pages
  const writtenSections = new Set<string>();
  const writtenElements = new Set<string>();

  pages.forEach(p => {
    p.sections.forEach((sec) => {
      if (writtenSections.has(sec.id)) return;
      writtenSections.add(sec.id);

      if (sec.sharedType === 'header') {
        variablesCss += `\n  /* --- Header Component: ${sec.id} --- */\n`;
        variablesCss += `  --sec-${sec.id}-bg-color: ${sec.backgroundColor};\n`;
        variablesCss += `  --header-${sec.id}-padding-y: ${sec.headerPaddingY ?? 16}px;\n`;
        variablesCss += `  --header-${sec.id}-gap: ${sec.headerGap ?? 40}px;\n`;
        variablesCss += `  --header-${sec.id}-menu-gap: ${sec.headerMenuGap ?? 24}px;\n`;
        
        variablesCss += `  --header-${sec.id}-logo-color: ${sec.headerLogoColor || '#ffffff'};\n`;
        variablesCss += `  --header-${sec.id}-logo-size: ${sec.headerLogoSize || '20px'};\n`;
        variablesCss += `  --header-${sec.id}-logo-font: ${getFontFamilyByFamilyName(sec.headerLogoFont || 'Inter')};\n`;
        variablesCss += `  --header-${sec.id}-logo-width: ${sec.headerLogoWidth || 120}px;\n`;
        
        variablesCss += `  --header-${sec.id}-menu-color: ${sec.headerMenuColor || '#cbd5e1'};\n`;
        variablesCss += `  --header-${sec.id}-menu-size: ${sec.headerMenuSize || '13px'};\n`;
        variablesCss += `  --header-${sec.id}-menu-font: ${getFontFamilyByFamilyName(sec.headerMenuFont || 'Inter')};\n`;
        
        const headerBtnBg = sec.headerBtnBgColor || 'var(--theme-secondary)';
        const isHex = headerBtnBg.startsWith('#');
        variablesCss += `  --header-${sec.id}-btn-bg: ${headerBtnBg};\n`;
        variablesCss += `  --header-${sec.id}-btn-hover-bg: ${isHex ? adjustColorBrightness(headerBtnBg, -15) : 'var(--theme-secondary)'};\n`;
        variablesCss += `  --header-${sec.id}-btn-text-color: ${sec.headerBtnTextColor || '#ffffff'};\n`;
        variablesCss += `  --header-${sec.id}-btn-radius: ${sec.headerBtnRadius ?? 4}px;\n`;
        variablesCss += `  --header-${sec.id}-btn-font: ${getFontFamilyByFamilyName(sec.headerBtnFont || 'Inter')};\n`;
        return;
      }

      if (sec.sharedType === 'footer') {
        variablesCss += `\n  /* --- Footer Component: ${sec.id} --- */\n`;
        variablesCss += `  --sec-${sec.id}-bg-color: ${sec.backgroundColor || '#f8fafc'};\n`;
        variablesCss += `  --footer-${sec.id}-padding-y: ${sec.footerPaddingY ?? 36}px;\n`;
        variablesCss += `  --footer-${sec.id}-text-color: ${sec.footerTextColor || '#0f172a'};\n`;
        variablesCss += `  --footer-${sec.id}-subtext-color: ${sec.footerSubTextColor || '#475569'};\n`;
        variablesCss += `  --footer-${sec.id}-text-font: ${getFontFamilyByFamilyName(sec.footerTextFont || 'Inter')};\n`;
        return;
      }

      variablesCss += `\n  /* --- Section: ${sec.id} --- */\n`;
      variablesCss += `  --sec-${sec.id}-bg-color: ${sec.backgroundColor};\n`;
      if (sec.backgroundImage) {
        const bgImgUrl = sec.backgroundImageName ? `./images/${sec.backgroundImageName}` : sec.backgroundImage;
        variablesCss += `  --sec-${sec.id}-bg-image: url('${bgImgUrl}');\n`;
        variablesCss += `  --sec-${sec.id}-bg-pos: ${sec.backgroundPosition || 'center'};\n`;
        variablesCss += `  --sec-${sec.id}-bg-size: ${sec.backgroundSize || 'cover'};\n`;
        variablesCss += `  --sec-${sec.id}-bg-repeat: ${sec.backgroundRepeat || 'no-repeat'};\n`;
      } else {
        variablesCss += `  --sec-${sec.id}-bg-image: none;\n`;
      }
      variablesCss += `  --sec-${sec.id}-height: ${sec.height}${sec.heightUnit || 'px'};\n`;

      sec.elements.forEach((el) => {
        if (writtenElements.has(el.id)) return;
        writtenElements.add(el.id);

        variablesCss += `\n  /* Element: ${el.type} (${el.id}) */\n`;
        variablesCss += `  --el-${el.id}-grid-x: ${el.gridX};\n`;
        variablesCss += `  --el-${el.id}-grid-w: ${el.gridW};\n`;
        variablesCss += `  --el-${el.id}-grid-y: ${el.gridY};\n`;
        variablesCss += `  --el-${el.id}-grid-h: ${el.gridH};\n`;
        variablesCss += `  --el-${el.id}-color: ${el.color};\n`;
        variablesCss += `  --el-${el.id}-font-size: ${el.fontSize};\n`;
        variablesCss += `  --el-${el.id}-font-family: ${el.fontFamily ? getFontFamilyByFamilyName(el.fontFamily) : 'inherit'};\n`;
        
        if (el.type === 'button') {
          variablesCss += `  --el-${el.id}-btn-bg: ${el.btnBgColor || 'var(--theme-primary)'};\n`;
          variablesCss += `  --el-${el.id}-btn-hover-bg: ${el.btnBgColor ? adjustColorBrightness(el.btnBgColor, -15) : 'var(--theme-primary)'};\n`;
          variablesCss += `  --el-${el.id}-btn-text-color: ${el.btnTextColor || '#ffffff'};\n`;
          variablesCss += `  --el-${el.id}-btn-radius: ${el.borderRadius ?? 6}px;\n`;
        }
        
        if (el.type === 'image') {
          variablesCss += `  --el-${el.id}-img-radius: ${el.borderRadius ?? 0}px;\n`;
          variablesCss += `  --el-${el.id}-img-shadow: ${el.boxShadow || 'none'};\n`;
        }
      });
    });
  });

  variablesCss += `}\n`;

  // 2. style.css
  let styleCss = `/* style.css */
/* Font Preset utility classes */
${(theme.fontPresets || []).map(p => `
.font-preset-${p.id} {
  font-size: var(--theme-font-preset-${p.id}-size) !important;
  font-family: var(--theme-font-preset-${p.id}-font) !important;
  font-weight: var(--theme-font-preset-${p.id}-weight) !important;
  color: var(--theme-font-preset-${p.id}-color) !important;
}
`).join('\n')}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, button, select, input, textarea {
  font-family: var(--font-default);
}

body {
  background-color: var(--theme-bg);
  color: var(--theme-text);
  line-height: 1.5;
  overflow-x: hidden;
}

.webpage {
  width: 100%;
}

.section {
  width: 100%;
  min-height: auto;
  position: relative;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
}

.section-content {
  width: var(--content-width);
  margin: 0 auto;
  min-height: 100%;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(var(--grid-row-height), auto);
  column-gap: var(--grid-gap);
  row-gap: var(--grid-gap);
  position: relative;
  padding: 0;
}

/* Base elements */
.grid-item {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
}

.title-element {
  font-weight: 700;
  margin: 0;
  width: 100%;
}

.text-element {
  width: 100%;
}

.image-element {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-element img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.btn-element {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  width: 100%;
  height: 100%;
}

/* Common Navigation Bar Styling */
.nav-bar-links {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.nav-link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
  font-size: 13.5px;
  opacity: 0.8;
  transition: opacity 0.2s, color 0.2s;
}

.nav-link:hover {
  opacity: 1;
  color: var(--theme-primary);
  text-decoration: none;
}

/* Individual Styles */
`;

  // Output classes for all unique sections and elements
  const styledSections = new Set<string>();
  const styledElements = new Set<string>();

  pages.forEach(p => {
    p.sections.forEach((sec) => {
      if (styledSections.has(sec.id)) return;
      styledSections.add(sec.id);

      if (sec.sharedType === 'header') {
        styleCss += `\n/* Header Component: ${sec.id} */\n`;
        styleCss += `.section-${sec.id} {\n`;
        styleCss += `  --content-width: ${sec.guidelineWidth || '80%'};\n`;
        if (sec.headerTransparentAtTop || sec.headerIsFixed) {
          styleCss += `  position: fixed;\n`;
          styleCss += `  top: 0;\n`;
          styleCss += `  left: 0;\n`;
          styleCss += `  right: 0;\n`;
          styleCss += `  z-index: 1000;\n`;
          styleCss += `  transition: background-color 0.3s ease, box-shadow 0.3s ease;\n`;
          styleCss += `  background-color: ${sec.headerTransparentAtTop ? 'transparent' : 'var(--sec-' + sec.id + '-bg-color)'};\n`;
        } else {
          styleCss += `  background-color: var(--sec-${sec.id}-bg-color);\n`;
        }
        styleCss += `  padding-top: var(--header-${sec.id}-padding-y);\n`;
        styleCss += `  padding-bottom: var(--header-${sec.id}-padding-y);\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `}\n`;
        
        if (sec.headerTransparentAtTop) {
          styleCss += `.section-${sec.id}.scrolled {\n`;
          styleCss += `  background-color: ${sec.headerScrollBgColor || '#1e3a8a'} !important;\n`;
          styleCss += `  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\n`;
          styleCss += `}\n`;
        }
        
        styleCss += `.section-${sec.id} .header-flex-wrapper {\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `  width: var(--content-width);\n`;
        styleCss += `  margin: 0 auto;\n`;
        styleCss += `  height: 100%;\n`;
        styleCss += `  padding: 0;\n`;
        styleCss += `  box-sizing: border-box;\n`;
        styleCss += `}\n`;
        
        styleCss += `.section-${sec.id} .header-left-col {\n`;
        styleCss += `  flex: 1;\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  justify-content: flex-start;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `}\n`;
        
        styleCss += `.section-${sec.id} .header-center-col {\n`;
        styleCss += `  flex: 2;\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  justify-content: center;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `}\n`;

        styleCss += `.section-${sec.id} .header-right-col {\n`;
        styleCss += `  flex: 1;\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  justify-content: flex-end;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `}\n`;
        
        styleCss += `.section-${sec.id} .header-logo {\n`;
        styleCss += `  color: var(--header-${sec.id}-logo-color);\n`;
        styleCss += `  font-size: var(--header-${sec.id}-logo-size);\n`;
        styleCss += `  font-family: var(--header-${sec.id}-logo-font);\n`;
        styleCss += `  font-weight: 800;\n`;
        styleCss += `  text-decoration: none;\n`;
        styleCss += `  margin: 0;\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `}\n`;

        styleCss += `.section-${sec.id} .header-logo img {\n`;
        styleCss += `  width: var(--header-${sec.id}-logo-width);\n`;
        styleCss += `  height: auto;\n`;
        styleCss += `  display: block;\n`;
        styleCss += `}\n`;

        styleCss += `.section-${sec.id} .header-flex-wrapper.spread-center {\n`;
        styleCss += `  position: relative;\n`;
        styleCss += `}\n`;

        styleCss += `.section-${sec.id} .header-flex-wrapper.spread-center .header-center-col {\n`;
        styleCss += `  position: absolute;\n`;
        styleCss += `  left: 50%;\n`;
        styleCss += `  transform: translateX(-50%);\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  justify-content: center;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `}\n`;

        styleCss += `.section-${sec.id} .header-flex-wrapper.standard-flow {\n`;
        styleCss += `  gap: var(--header-${sec.id}-gap);\n`;
        styleCss += `}\n`;

        styleCss += `.section-${sec.id} .header-menu-container {\n`;
        styleCss += `  gap: var(--header-${sec.id}-menu-gap);\n`;
        styleCss += `}\n`;

        styleCss += `.section-${sec.id} .header-menu-link {\n`;
        styleCss += `  color: var(--header-${sec.id}-menu-color);\n`;
        styleCss += `  font-size: var(--header-${sec.id}-menu-size);\n`;
        styleCss += `  font-family: var(--header-${sec.id}-menu-font);\n`;
        styleCss += `  text-decoration: none;\n`;
        styleCss += `  font-weight: 500;\n`;
        styleCss += `  transition: opacity 0.2s;\n`;
        styleCss += `}\n`;
        
        styleCss += `.section-${sec.id} .header-menu-link:hover {\n`;
        styleCss += `  opacity: 0.8;\n`;
        styleCss += `}\n`;

        const headerBtnVar = sec.headerBtnVariant || 'filled';
        const headerBtnSize = sec.headerBtnSize || 'medium';

        styleCss += `.section-${sec.id} .header-btn {\n`;
        styleCss += `  font-family: var(--header-${sec.id}-btn-font);\n`;
        styleCss += `  border-radius: var(--header-${sec.id}-btn-radius);\n`;
        styleCss += `  font-weight: 600;\n`;
        styleCss += `  cursor: pointer;\n`;
        styleCss += `  transition: background-color 0.25s, border-color 0.25s, opacity 0.2s;\n`;
        styleCss += `  white-space: nowrap;\n`;

        if (headerBtnVar === 'filled') {
          styleCss += `  background-color: var(--header-${sec.id}-btn-bg);\n`;
          styleCss += `  color: var(--header-${sec.id}-btn-text-color);\n`;
          styleCss += `  border: none;\n`;
        } else if (headerBtnVar === 'outlined') {
          styleCss += `  background-color: transparent;\n`;
          styleCss += `  color: var(--header-${sec.id}-btn-bg);\n`;
          styleCss += `  border: 2px solid var(--header-${sec.id}-btn-bg);\n`;
        } else if (headerBtnVar === 'ghost') {
          styleCss += `  background-color: transparent;\n`;
          styleCss += `  color: var(--header-${sec.id}-btn-bg);\n`;
          styleCss += `  border: none;\n`;
        }

        if (headerBtnSize === 'small') {
          styleCss += `  padding: 5px 10px;\n`;
          styleCss += `  font-size: 11px;\n`;
        } else if (headerBtnSize === 'large') {
          styleCss += `  padding: 12px 24px;\n`;
          styleCss += `  font-size: 14px;\n`;
        } else {
          styleCss += `  padding: 8px 16px;\n`;
          styleCss += `  font-size: 12px;\n`;
        }
        styleCss += `}\n`;

        if (headerBtnVar === 'filled') {
          styleCss += `.section-${sec.id} .header-btn:hover {\n`;
          styleCss += `  background-color: var(--header-${sec.id}-btn-hover-bg);\n`;
          styleCss += `}\n`;
        } else if (headerBtnVar === 'outlined') {
          styleCss += `.section-${sec.id} .header-btn:hover {\n`;
          styleCss += `  opacity: 0.85;\n`;
          styleCss += `}\n`;
        } else if (headerBtnVar === 'ghost') {
          styleCss += `.section-${sec.id} .header-btn:hover {\n`;
          styleCss += `  background-color: rgba(120, 120, 120, 0.08);\n`;
          styleCss += `}\n`;
        }
        return;
      }

      if (sec.sharedType === 'footer') {
        styleCss += `\n/* Footer Component: ${sec.id} */\n`;
        styleCss += `.section-${sec.id} {\n`;
        styleCss += `  --content-width: ${sec.guidelineWidth || '80%'};\n`;
        styleCss += `  background-color: var(--sec-${sec.id}-bg-color);\n`;
        styleCss += `  padding-top: var(--footer-${sec.id}-padding-y);\n`;
        styleCss += `  padding-bottom: var(--footer-${sec.id}-padding-y);\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `  justify-content: center;\n`;
        styleCss += `}\n`;
        styleCss += `.section-${sec.id} .footer-wrapper {\n`;
        styleCss += `  width: var(--content-width);\n`;
        styleCss += `  margin: 0 auto;\n`;
        styleCss += `  font-family: var(--footer-${sec.id}-text-font);\n`;
        styleCss += `  color: var(--footer-${sec.id}-text-color);\n`;
        styleCss += `}\n`;
        styleCss += `.section-${sec.id} .footer-links-row {\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `  gap: 14px;\n`;
        styleCss += `  font-size: 13px;\n`;
        styleCss += `  font-weight: 700;\n`;
        styleCss += `}\n`;
        styleCss += `.section-${sec.id} .footer-info-row {\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  flex-wrap: wrap;\n`;
        styleCss += `  column-gap: 20px;\n`;
        styleCss += `  row-gap: 6px;\n`;
        styleCss += `  font-size: 12px;\n`;
        styleCss += `  margin-top: 12px;\n`;
        styleCss += `  color: var(--footer-${sec.id}-subtext-color);\n`;
        styleCss += `  line-height: 1.6;\n`;
        styleCss += `}\n`;
        styleCss += `.section-${sec.id} .footer-info-row strong {\n`;
        styleCss += `  color: var(--footer-${sec.id}-text-color);\n`;
        styleCss += `  font-weight: 700;\n`;
        styleCss += `  margin-right: 6px;\n`;
        styleCss += `}\n`;
        styleCss += `.section-${sec.id} .footer-copyright {\n`;
        styleCss += `  font-size: 12px;\n`;
        styleCss += `  margin-top: 12px;\n`;
        styleCss += `  color: var(--footer-${sec.id}-subtext-color);\n`;
        styleCss += `}\n`;
        return;
      }

      styleCss += `\n/* Section: ${sec.id} */\n`;
      styleCss += `.section-${sec.id} {\n`;
      const mainSlideWidth = (sec.sectionPresetType === 'main-slide' || sec.id === 'sec-main-slide')
        ? (sec.contentWidth || (sec.guidelineWidth === '100%' ? '80%' : sec.guidelineWidth || '80%'))
        : (sec.guidelineWidth || '80%');
      styleCss += `  --content-width: ${mainSlideWidth};\n`;
      styleCss += `  background-color: var(--sec-${sec.id}-bg-color);\n`;
      styleCss += `  background-image: var(--sec-${sec.id}-bg-image);\n`;
      if (sec.backgroundImage) {
        styleCss += `  background-position: var(--sec-${sec.id}-bg-pos);\n`;
          styleCss += `  background-size: var(--sec-${sec.id}-bg-size);\n`;
        styleCss += `  background-repeat: var(--sec-${sec.id}-bg-repeat);\n`;
      }
      
      const isAuto = sec.heightMode === 'auto';
      const vertAlign = isAuto ? 'flex-start' : (sec.verticalAlign === 'start' ? 'flex-start' : sec.verticalAlign === 'end' ? 'flex-end' : 'center');
      styleCss += `  min-height: ${isAuto ? 'auto' : `var(--sec-${sec.id}-height)`};\n`;
      styleCss += `  display: flex;\n`;
      styleCss += `  flex-direction: column;\n`;
      styleCss += `  justify-content: ${vertAlign};\n`;
      styleCss += `  box-sizing: border-box;\n`;
      styleCss += `  padding-top: ${sec.paddingTop !== undefined ? `${sec.paddingTop}px` : '0px'};\n`;
      styleCss += `  padding-bottom: ${sec.paddingBottom !== undefined ? `${sec.paddingBottom}px` : '0px'};\n`;
      styleCss += `}\n`;

      if (sec.sectionPresetType === 'main-slide' || sec.id === 'sec-main-slide') {
        const cWidth = sec.contentWidth || (sec.guidelineWidth === '100%' ? '80%' : sec.guidelineWidth || '80%');
        const titleMarginVar = theme.spacingPresets?.find(sp => sp.id === sec.slideTitleMarginVarId);
        const titleMB = titleMarginVar ? titleMarginVar.value : (sec.slideTitleMarginBottom !== undefined ? sec.slideTitleMarginBottom : 16);

        const descMarginVar = theme.spacingPresets?.find(sp => sp.id === sec.slideDescMarginVarId);
        const descMB = descMarginVar ? descMarginVar.value : (sec.slideDescMarginBottom !== undefined ? sec.slideDescMarginBottom : 28);
        const slideAlign = sec.flexAlign || 'left';
        const textAlignVal = slideAlign === 'center' ? 'center' : slideAlign === 'end' ? 'right' : 'left';
        const flexAlignItems = slideAlign === 'center' ? 'center' : slideAlign === 'end' ? 'flex-end' : 'flex-start';
        const descMargin = slideAlign === 'center' ? `0 auto ${descMB}px auto` : slideAlign === 'end' ? `0 0 ${descMB}px auto` : `0 0 ${descMB}px 0`;

        styleCss += `.section-${sec.id} .slide-content,\n`;
        styleCss += `.section-${sec.id} .main-slide-content-box {\n`;
        styleCss += `  width: ${cWidth};\n`;
        styleCss += `  margin: 0 auto;\n`;
        styleCss += `  padding: 0;\n`;
        styleCss += `  box-sizing: border-box;\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  flex-direction: column;\n`;
        styleCss += `  align-items: ${flexAlignItems};\n`;
        styleCss += `  text-align: ${textAlignVal};\n`;
        styleCss += `}\n`;
        styleCss += `.section-${sec.id} .slide-title {\n`;
        styleCss += `  width: 100%;\n`;
        styleCss += `  text-align: ${textAlignVal};\n`;
        styleCss += `  margin: 0 0 ${titleMB}px 0;\n`;
        styleCss += `}\n`;
        styleCss += `.section-${sec.id} .slide-desc {\n`;
        styleCss += `  width: 100%;\n`;
        styleCss += `  text-align: ${textAlignVal};\n`;
        styleCss += `  margin: ${descMargin};\n`;
        styleCss += `}\n`;
        styleCss += `.section-${sec.id} .slide-btn {\n`;
        styleCss += `  align-self: ${flexAlignItems};\n`;
        styleCss += `}\n`;
      }

      if (sec.layoutMode === 'flex') {
        const align = sec.flexAlign === 'start' ? 'flex-start' : sec.flexAlign === 'end' ? 'flex-end' : sec.flexAlign === 'space-between' ? 'space-between' : 'center';
        styleCss += `.section-${sec.id} .section-content {\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  flex-direction: ${sec.flexDirection === 'horizontal' ? 'row' : 'column'};\n`;
        styleCss += `  gap: ${sec.flexGap !== undefined ? `${sec.flexGap}px` : 'var(--theme-default-flex-gap)'};\n`;
        styleCss += `  align-items: ${sec.flexDirection === 'horizontal' ? 'center' : 'stretch'};\n`;
        styleCss += `  justify-content: ${align};\n`;
        styleCss += `  padding-top: ${sec.paddingTop !== undefined ? `${sec.paddingTop}px` : 'var(--theme-default-section-padding)'};\n`;
        styleCss += `  padding-bottom: ${sec.paddingBottom !== undefined ? `${sec.paddingBottom}px` : 'var(--theme-default-section-padding)'};\n`;
        styleCss += `  min-height: auto;\n`;
        styleCss += `}\n`;
      } else {
        styleCss += `.section-${sec.id} .section-content {\n`;
        styleCss += `  padding-top: ${sec.paddingTop !== undefined ? `${sec.paddingTop}px` : 'var(--theme-default-section-padding)'};\n`;
        styleCss += `  padding-bottom: ${sec.paddingBottom !== undefined ? `${sec.paddingBottom}px` : 'var(--theme-default-section-padding)'};\n`;
        styleCss += `  min-height: auto;\n`;
        styleCss += `}\n`;
      }

      sec.elements.forEach((el) => {
        if (styledElements.has(el.id)) return;
        styledElements.add(el.id);

        styleCss += `\n#el-id-${el.id} {\n`;
        if (sec.layoutMode === 'flex') {
          if (el.widthMode === 'fixed') {
            styleCss += `  width: ${el.fixedWidth ?? 150}px;\n`;
            const alignSelf = el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start';
            styleCss += `  align-self: ${alignSelf};\n`;
          } else if (el.widthMode === 'fit-content') {
            styleCss += `  width: fit-content;\n`;
            const alignSelf = el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start';
            styleCss += `  align-self: ${alignSelf};\n`;
          } else {
            styleCss += `  width: 100%;\n`;
            styleCss += `  align-self: stretch;\n`;
          }
          styleCss += `  height: auto;\n`;
          if (el.marginBottom) {
            styleCss += `  margin-bottom: ${el.marginBottom}px;\n`;
          }
          if (el.marginRight) {
            styleCss += `  margin-right: ${el.marginRight}px;\n`;
          }
        } else {
          styleCss += `  grid-column: calc(var(--el-${el.id}-grid-x) + 1) / span var(--el-${el.id}-grid-w);\n`;
          styleCss += `  grid-row: calc(var(--el-${el.id}-grid-y) + 1) / span var(--el-${el.id}-grid-h);\n`;
          if (el.widthMode === 'fixed') {
            styleCss += `  width: ${el.fixedWidth ?? 150}px;\n`;
            const justify = el.align === 'center' ? 'center' : el.align === 'right' ? 'end' : 'start';
            styleCss += `  justify-self: ${justify};\n`;
          } else if (el.widthMode === 'fit-content') {
            styleCss += `  width: fit-content;\n`;
            const justify = el.align === 'center' ? 'center' : el.align === 'right' ? 'end' : 'start';
            styleCss += `  justify-self: ${justify};\n`;
          } else {
            styleCss += `  width: 100%;\n`;
          }
          if (el.type === 'image') {
            styleCss += `  height: 100%;\n`;
          } else {
            styleCss += `  height: fit-content;\n`;
          }
        }
        styleCss += `}\n`;

        if (el.type === 'title') {
          styleCss += `.title-${el.id} {\n`;
          styleCss += `  color: var(--el-${el.id}-color);\n`;
          styleCss += `  font-size: var(--el-${el.id}-font-size);\n`;
          styleCss += `  font-family: var(--el-${el.id}-font-family);\n`;
          styleCss += `  text-align: ${el.align};\n`;
          styleCss += `  justify-content: ${el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start'};\n`;
          styleCss += `}\n`;
        } else if (el.type === 'text') {
          styleCss += `.text-${el.id} {\n`;
          styleCss += `  color: var(--el-${el.id}-color);\n`;
          styleCss += `  font-size: var(--el-${el.id}-font-size);\n`;
          styleCss += `  font-family: var(--el-${el.id}-font-family);\n`;
          styleCss += `  text-align: ${el.align};\n`;
          styleCss += `}\n`;
        } else if (el.type === 'image') {
          styleCss += `.img-${el.id} img {\n`;
          styleCss += `  border-radius: var(--el-${el.id}-img-radius);\n`;
          styleCss += `  box-shadow: var(--el-${el.id}-img-shadow);\n`;
          styleCss += `}\n`;
        } else if (el.type === 'three-column') {
          const hasTitlePreset = !!el.colTitlePresetId;
          const hasTextPreset = !!el.colTextPresetId;

          const titleColor = el.colTitleColor || 'var(--theme-primary)';
          const titleSize = el.colTitleSize || '18px';
          const textColor = el.colTextColor || 'var(--theme-text)';
          const textSize = el.colTextSize || '14px';
          const iconColor = el.colIconColor || 'var(--theme-primary)';
          const showIconBg = !!el.colShowIconBg;
          const iconBgColor = el.colIconBgColor || 'rgba(24, 160, 251, 0.1)';

          styleCss += `.three-column-${el.id} {\n`;
          styleCss += `  display: flex;\n`;
          styleCss += `  gap: ${el.colGap ?? 24}px;\n`;
          styleCss += `  width: 100%;\n`;
          styleCss += `  padding: 12px 0;\n`;
          styleCss += `}\n`;
          const elAlign = el.align || 'left';
          styleCss += `.three-column-${el.id} .col-item {\n`;
          styleCss += `  flex: 1;\n`;
          styleCss += `  min-width: 0;\n`;
          styleCss += `  display: flex;\n`;
          styleCss += `  flex-direction: column;\n`;
          styleCss += `  align-items: ${elAlign === 'left' ? 'flex-start' : elAlign === 'right' ? 'flex-end' : 'center'};\n`;
          styleCss += `  text-align: ${elAlign};\n`;
          styleCss += `  gap: ${el.colContentGap ?? 8}px;\n`;
          styleCss += `}\n`;
          
          if (showIconBg) {
            styleCss += `.three-column-${el.id} .col-icon-circle {\n`;
            styleCss += `  display: flex;\n`;
            styleCss += `  align-items: center;\n`;
            styleCss += `  justify-content: center;\n`;
            styleCss += `  width: 48px;\n`;
            styleCss += `  height: 48px;\n`;
            styleCss += `  border-radius: 50%;\n`;
            styleCss += `  background-color: ${iconBgColor};\n`;
            styleCss += `  color: ${iconColor};\n`;
            styleCss += `}\n`;
            styleCss += `.three-column-${el.id} .col-icon-circle svg {\n`;
            styleCss += `  width: 24px;\n`;
            styleCss += `  height: 24px;\n`;
            styleCss += `}\n`;
          } else {
            styleCss += `.three-column-${el.id} .col-icon-wrapper {\n`;
            styleCss += `  display: flex;\n`;
            styleCss += `  color: ${iconColor};\n`;
            styleCss += `}\n`;
            styleCss += `.three-column-${el.id} .col-icon-wrapper svg {\n`;
            styleCss += `  width: 28px;\n`;
            styleCss += `  height: 28px;\n`;
            styleCss += `}\n`;
          }
          
          styleCss += `.three-column-${el.id} h3 {\n`;
          styleCss += `  margin: 0;\n`;
          if (!hasTitlePreset) {
            styleCss += `  font-size: ${titleSize};\n`;
            styleCss += `  color: ${titleColor};\n`;
            styleCss += `  font-family: var(--el-${el.id}-font-family);\n`;
          }
          styleCss += `  font-weight: 700;\n`;
          styleCss += `}\n`;

          styleCss += `.three-column-${el.id} p {\n`;
          styleCss += `  margin: 0;\n`;
          if (!hasTextPreset) {
            styleCss += `  font-size: ${textSize};\n`;
            styleCss += `  color: ${textColor};\n`;
            styleCss += `  font-family: var(--el-${el.id}-font-family);\n`;
          }
          styleCss += `  line-height: 1.5;\n`;
          styleCss += `}\n`;
        } else if (el.type === 'button') {
          const btnVar = el.btnVariant || 'filled';
          const btnSize = el.btnSize || 'medium';
          const hasPreset = !!el.fontPresetId;
          
          styleCss += `.btn-${el.id} {\n`;
          if (!hasPreset) {
            styleCss += `  font-family: var(--el-${el.id}-font-family);\n`;
            styleCss += `  font-weight: 600;\n`;
          }
          styleCss += `  border-radius: var(--el-${el.id}-btn-radius);\n`;
          styleCss += `  cursor: pointer;\n`;
          styleCss += `  transition: background-color 0.25s, border-color 0.25s, opacity 0.2s;\n`;
          styleCss += `  white-space: nowrap;\n`;
          styleCss += `  display: inline-flex;\n`;
          styleCss += `  align-items: center;\n`;
          styleCss += `  justify-content: ${el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start'};\n`;
          styleCss += `  gap: 8px;\n`;
          styleCss += `  box-sizing: border-box;\n`;
          styleCss += `  width: 100%;\n`;
          styleCss += `  height: 100%;\n`;

          if (btnVar === 'filled') {
            styleCss += `  background-color: var(--el-${el.id}-btn-bg);\n`;
            styleCss += `  color: ${hasPreset ? 'inherit' : `var(--el-${el.id}-btn-text-color)`};\n`;
            styleCss += `  border: none;\n`;
          } else if (btnVar === 'outlined') {
            styleCss += `  background-color: transparent;\n`;
            styleCss += `  color: ${hasPreset ? 'inherit' : `var(--el-${el.id}-btn-bg)`};\n`;
            styleCss += `  border: 2px solid var(--el-${el.id}-btn-bg);\n`;
          } else if (btnVar === 'ghost') {
            styleCss += `  background-color: transparent;\n`;
            styleCss += `  color: ${hasPreset ? 'inherit' : `var(--el-${el.id}-btn-bg)`};\n`;
            styleCss += `  border: none;\n`;
          }

          let padY = '10px';
          let defaultPadX = 20;
          let fSize = '14px';
          
          if (btnSize === 'small') {
            padY = '6px';
            defaultPadX = 12;
            fSize = '12px';
          } else if (btnSize === 'large') {
            padY = '14px';
            defaultPadX = 28;
            fSize = '16px';
          }
          
          const padXVal = el.paddingX !== undefined ? el.paddingX : defaultPadX;
          styleCss += `  padding: ${padY} ${padXVal}px;\n`;
          if (!hasPreset) {
            styleCss += `  font-size: ${fSize};\n`;
          }
          styleCss += `}\n`;

          if (btnVar === 'filled') {
            styleCss += `.btn-${el.id}:hover {\n`;
            styleCss += `  background-color: var(--el-${el.id}-btn-hover-bg);\n`;
            styleCss += `}\n`;
          } else if (btnVar === 'outlined') {
            styleCss += `.btn-${el.id}:hover {\n`;
            styleCss += `  background-color: rgba(var(--theme-primary-rgb), 0.08);\n`;
            styleCss += `}\n`;
          } else if (btnVar === 'ghost') {
            styleCss += `.btn-${el.id}:hover {\n`;
            styleCss += `  background-color: rgba(var(--theme-primary-rgb), 0.06);\n`;
            styleCss += `}\n`;
          }
        }
      });
    });
  });

  // Mobile responsiveness
  styleCss += `\n/* Responsive Layout for Mobile */
@media (max-width: 768px) {
  .section-content {
    width: 90%;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 30px 0;
  }
  
  .grid-item {
    grid-column: auto !important;
    grid-row: auto !important;
    width: 100% !important;
    height: auto !important;
  }
  
  .image-element {
    aspect-ratio: 16/9;
  }
  
  .btn-element {
    padding: 12px 20px;
  }
  
  .title-element {
    text-align: center !important;
  }
  
  .text-element {
    text-align: center !important;
  }

  /* Header Component Mobile responsiveness */
  .header-flex-wrapper {
    width: 90% !important;
    flex-direction: column !important;
    gap: 16px !important;
    padding: 16px 0 !important;
    height: auto !important;
  }
  .header-left-col, .header-center-col, .header-right-col {
    justify-content: center !important;
    width: 100% !important;
    flex: none !important;
    text-align: center !important;
  }
  .header-center-col {
    position: static !important;
    transform: none !important;
  }
  .header-menu-container {
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 12px 16px !important;
  }
}

/* Legal Document Styles (BEM Standard) */
.legal-doc-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  font-family: inherit;
  color: #1e293b;
  line-height: 1.7;
  text-align: left;
}

.legal-chapter-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.legal-chapter-title,
.legal-chapter-list > li > h4 {
  font-size: 18px;
  font-weight: 800;
  color: var(--theme-primary, #0284c7);
  letter-spacing: -0.3px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.legal-article-list,
.legal-chapter-list > li > ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.legal-article-title,
.legal-chapter-list h5 {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.legal-clause-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.legal-clause-item,
.legal-clause-list > li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13.5px;
  color: #334155;
}

.legal-clause-num,
.legal-clause-list > li > span {
  font-weight: 700;
  color: var(--theme-primary, #0284c7);
  min-width: 32px;
  flex-shrink: 0;
}

.legal-clause-body,
.legal-clause-list > li > div {
  flex: 1;
}

.legal-subclause-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legal-subclause-item,
.legal-subclause-list > li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #475569;
}

.legal-subclause-num,
.legal-subclause-list > li > span {
  font-weight: 600;
  color: #64748b;
  min-width: 20px;
  flex-shrink: 0;
}

.legal-subclause-body,
.legal-subclause-list > li > div {
  flex: 1;
}

/* --- Preset Sections CSS --- */
.section-preset-main-slide { position: relative; width: 100%; min-height: 100vh; height: 100vh; overflow: hidden; }
.main-slide-container { position: relative; width: 100%; min-height: 100vh; height: 100vh; display: flex; align-items: center; justify-content: center; }
.main-slide-container .slide-item { position: absolute; inset: 0; opacity: 0; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }

.main-slide-container.effect-fade .slide-item { opacity: 0; transition: opacity 0.7s ease; }
.main-slide-container.effect-fade .slide-item.active { opacity: 1; z-index: 1; }

.main-slide-container.effect-slide .slide-item { opacity: 0; transform: translateX(100%); transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease; }
.main-slide-container.effect-slide .slide-item.active { opacity: 1; transform: translateX(0); z-index: 1; }

.main-slide-container.effect-zoom .slide-item { opacity: 0; transform: scale(1.12); transition: transform 1.2s ease-out, opacity 0.7s ease; }
.main-slide-container.effect-zoom .slide-item.active { opacity: 1; transform: scale(1); z-index: 1; }
.slide-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); z-index: 2; }
.slide-content { position: relative; z-index: 10; width: var(--content-width, 80%); margin: 0 auto; text-align: left; color: #ffffff; box-sizing: border-box; }
.slide-title { font-size: 46px; font-weight: 800; margin: 0 0 16px 0; line-height: 1.2; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.slide-desc { font-size: 18px; color: #f1f5f9; margin: 0 0 28px 0; line-height: 1.6; max-width: 640px; text-shadow: 0 1px 5px rgba(0,0,0,0.5); }
.slide-btn { display: inline-block; padding: 14px 32px; background-color: var(--theme-primary, #1e3a8a); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.slide-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 15; background: rgba(0,0,0,0.45); color: #ffffff; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; }
.slide-arrow.prev { left: 20px; }
.slide-arrow.next { right: 20px; }
.slide-dots { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 15; display: flex; gap: 8px; }
.slide-dots .dot { width: 8px; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s ease; }
.slide-dots .dot.active { width: 24px; background: #ffffff; }

.section-preset-features-grid { padding: 60px 0; background-color: #ffffff; width: 100%; box-sizing: border-box; }
.features-grid-container { width: var(--content-width, 80%); margin: 0 auto; display: flex; flex-direction: column; gap: 60px; padding: 0; box-sizing: border-box; }
.feature-row { display: flex; flex-direction: row; gap: 40px; align-items: center; flex-wrap: wrap; }
.feature-row.reverse { flex-direction: row-reverse; }
.feature-text-col { flex: 1 1 300px; display: flex; flex-direction: column; justify-content: center; padding: 10px; }
.feature-title { font-size: 26px; font-weight: 800; color: var(--theme-primary, #1e3a8a); margin: 0 0 16px 0; letter-spacing: -0.5px; }
.feature-desc { font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 24px 0; }
.feature-btn { font-size: 14px; font-weight: 700; color: var(--theme-primary, #1e3a8a); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
.feature-img-col { flex: 1 1 300px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
.feature-img-col img { width: 100%; height: 300px; object-fit: cover; display: block; }

.section-preset-promo-banner { position: relative; width: 100%; min-height: 340px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; padding: 60px 0; box-sizing: border-box; }
.promo-banner-overlay { position: absolute; inset: 0; background-color: rgba(11, 25, 44, 0.75); z-index: 1; }
.promo-banner-content { position: relative; z-index: 10; width: var(--content-width, 80%); margin: 0 auto; text-align: center; color: #ffffff; }
.promo-subtitle { font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #38bdf8; margin-bottom: 12px; display: block; }
.promo-title { font-size: 30px; font-weight: 800; margin: 0 0 24px 0; line-height: 1.4; word-break: keep-all; }
.promo-cta-btn { display: inline-block; padding: 12px 28px; border: 1.5px solid #ffffff; color: #ffffff; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s ease; }

.section-preset-card-slider { padding: 60px 0; background-color: #f8fafc; width: 100%; box-sizing: border-box; }
.card-slider-header { width: var(--content-width, 80%); margin: 0 auto 28px auto; padding: 0; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; }
.card-slider-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
.title-underline { width: 40px; height: 3px; background-color: var(--theme-primary, #1e3a8a); margin-top: 8px; }
.card-slider-nav { display: flex; gap: 8px; }
.card-arrow { width: 38px; height: 38px; border-radius: 50%; border: 1px solid #cbd5e1; background-color: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #475569; }
.card-slider-grid { width: var(--content-width, 80%); margin: 0 auto; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; box-sizing: border-box; }
.card-item { background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; display: flex; flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
.card-img-box { height: 180px; overflow: hidden; }
.card-img-box img { width: 100%; height: 100%; object-fit: cover; }
.card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.card-tag { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; background-color: #e0f2fe; color: #0284c7; text-transform: uppercase; display: inline-block; margin-bottom: 10px; }
.card-item-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; line-height: 1.4; }
.card-desc { font-size: 13px; color: #64748b; margin: 0 0 14px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-date { font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: 10px; }
`;

  // 3. Generate HTML code for EACH page
  const files: GeneratedFiles = {
    'style.css': styleCss,
    'variables.css': variablesCss
  };

  pages.forEach(p => {
    if (p.id === 'sitemap' || p.fileName === 'siteMap.html') {
      const validPages = pages.filter(pl => pl.fileName !== 'siteMap.html' && pl.id !== 'sitemap');
      let sitemapHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>사이트맵 (Site Map)</title>
${fontLinksHtml}
  <link rel="stylesheet" href="variables.css">
  <link rel="stylesheet" href="style.css">
  <style>
    body { background-color: #f8fafc; font-family: var(--font-default, 'Inter', sans-serif); margin: 0; padding: 0; color: #0f172a; }
    .sitemap-hero { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color: #ffffff; padding: 60px 24px; text-align: center; }
    .sitemap-hero h1 { font-size: 36px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px; }
    .sitemap-hero p { font-size: 16px; color: #cbd5e1; margin: 0; }
    .sitemap-container { max-width: 1080px; margin: -30px auto 60px auto; padding: 0 24px; position: relative; z-index: 10; }
    .sitemap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; list-style: none; padding: 0; margin: 0; }
    .sitemap-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); transition: transform 0.25s ease, box-shadow 0.25s ease; display: flex; flex-direction: column; justify-content: space-between; }
    .sitemap-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); border-color: var(--theme-primary, #1e3a8a); }
    .sitemap-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
    .sitemap-card-title { font-size: 20px; font-weight: 800; color: #0f172a; text-decoration: none; }
    .sitemap-card-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; background: #e0f2fe; color: #0284c7; text-transform: uppercase; }
    .sitemap-card-file { font-size: 13px; color: #64748b; font-family: monospace; margin-bottom: 16px; background: #f8fafc; padding: 6px 10px; border-radius: 4px; display: inline-block; width: fit-content; }
    .sitemap-section-list { list-style: none; padding: 0; margin: 0 0 20px 0; display: flex; flex-direction: column; gap: 8px; }
    .sitemap-section-item { font-size: 13px; color: #475569; display: flex; align-items: center; gap: 6px; }
    .sitemap-section-item::before { content: "•"; color: var(--theme-primary, #1e3a8a); font-weight: bold; }
    .sitemap-link-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; background: var(--theme-primary, #1e3a8a); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; transition: opacity 0.2s ease; text-align: center; }
    .sitemap-link-btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="sitemap-hero">
    <h1>사이트맵 (Site Map)</h1>
    <p>전체 웹사이트 구조 및 페이지 바로가기 안내</p>
  </div>
  <div class="sitemap-container">
    <div class="sitemap-grid">
      ${validPages.map((pageLink) => {
        const sectionsList = pageLink.sections.map(s => s.sectionTitle || (s.sharedType === 'header' ? '공통 헤더' : s.sharedType === 'footer' ? '공통 푸터' : '콘텐츠 섹션')).filter(Boolean);
        return `
      <div class="sitemap-card">
        <div>
          <div class="sitemap-card-header">
            <a href="${pageLink.fileName}" class="sitemap-card-title">${pageLink.name}</a>
            <span class="sitemap-card-badge">PAGE</span>
          </div>
          <div class="sitemap-card-file">${pageLink.fileName}</div>
          <ul class="sitemap-section-list">
            ${sectionsList.slice(0, 4).map(st => `<li class="sitemap-section-item">${st}</li>`).join('')}
          </ul>
        </div>
        <a href="${pageLink.fileName}" class="sitemap-link-btn">페이지 방문하기 →</a>
      </div>
        `;
      }).join('')}
    </div>
  </div>
</body>
</html>`;
      files[p.fileName] = sitemapHtml;
      return;
    }

    let indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} - 내보낸 웹페이지</title>
  <!-- Google Fonts -->
${fontLinksHtml}
  <!-- Stylesheets -->
  <link rel="stylesheet" href="variables.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="webpage">
`;

    // Add sections to HTML
    p.sections.forEach((sec) => {
      if (sec.sharedType === 'header') {
        indexHtml += `    <!-- Header Start -->\n`;
        indexHtml += `    <header class="section section-${sec.id}">\n`;
        
        const layout = sec.headerLayout || 'spread-center';
        
        const logoNode = sec.headerShowLogo !== false
          ? (sec.headerLogoType === 'image' && sec.headerLogoImg
              ? `<a href="index.html" class="header-logo"><img src="${sec.headerLogoImg}" alt="${sec.headerLogoText || 'LOGO'}"></a>`
              : `<a href="index.html" class="header-logo">${sec.headerLogoText || 'CORPORATE'}</a>`)
          : '';
        
        let menuNode = '';
        if (sec.headerShowMenu !== false) {
          menuNode += `<nav style="display: flex; gap: 24px; align-items: center;">\n`;
          (sec.headerMenuItems || []).forEach(item => {
            menuNode += `            <a href="${item.fileName}" class="header-menu-link">${item.name}</a>\n`;
          });
          menuNode += `          </nav>`;
        }
        
        let btnNode = '';
        if (sec.headerShowBtn !== false) {
          const loginPage = pages.find(pl => pl.id === 'login');
          const loginUrl = loginPage ? loginPage.fileName : 'login.html';
          btnNode = `<button class="header-btn" onclick="location.href='${loginUrl}'">${sec.headerBtnText || '시작하기'}</button>`;
        }
        
        if (layout === 'spread-center') {
          indexHtml += `      <div class="header-flex-wrapper spread-center">\n`;
          indexHtml += `        <div class="header-left-col">\n`;
          indexHtml += `          ${logoNode}\n`;
          indexHtml += `        </div>\n`;
          indexHtml += `        <div class="header-center-col">\n`;
          indexHtml += `          ${menuNode}\n`;
          indexHtml += `        </div>\n`;
          indexHtml += `        <div class="header-right-col">\n`;
          indexHtml += `          ${btnNode}\n`;
          indexHtml += `        </div>\n`;
          indexHtml += `      </div>\n`;
        } else {
          let justifyStyle = 'flex-start';
          if (layout === 'spread-between') justifyStyle = 'space-between';
          if (layout === 'right') justifyStyle = 'flex-end';
          if (layout === 'center') justifyStyle = 'center';
          if (layout === 'even-space') justifyStyle = 'space-around';
          
          indexHtml += `      <div class="header-flex-wrapper standard-flow" style="display: flex; align-items: center; justify-content: ${justifyStyle}; gap: ${layout === 'even-space' || layout === 'spread-between' ? '0' : '40px'}; width: 100%;">\n`;
          if (logoNode) indexHtml += `        ${logoNode}\n`;
          if (menuNode) indexHtml += `        ${menuNode}\n`;
          if (btnNode) indexHtml += `        ${btnNode}\n`;
          indexHtml += `      </div>\n`;
        }
        
        indexHtml += `    </header>\n`;
        indexHtml += `    <!-- Header End -->\n\n`;
        return;
      }

      if (sec.sharedType === 'footer') {
        const linksStr = sec.footerLinksText || '개인정보처리방침   이용약관';
        const company = sec.footerCompany || '(주) 코퍼레이트';
        const rep = sec.footerRepresentative || '홍길동';
        const addr = sec.footerAddress || '서울특별시 강남구 테헤란로 501, 15층 (삼성동, 코퍼레이트타워)';
        const tel = sec.footerTel || '1588-0000';
        const bizNum = sec.footerBizNum || '123-45-67890';
        const copyright = sec.footerCopyright || `Copyright © ${company || 'Corporate Inc.'}. All rights reserved.`;

        const linkItems = linksStr.split(/\s{2,}|\s*\|\s*/).filter(Boolean);
        let linksHtml = '';
        if (linkItems.length > 0) {
          linksHtml = linkItems.map((item) => {
            const trimmed = item.trim();
            const isPrivacy = trimmed.includes('개인정보');
            const isTerms = trimmed.includes('약관') || trimmed.includes('이용약관');
            const href = isPrivacy ? 'privacy.html' : isTerms ? 'terms.html' : '#';
            return `<a href="${href}" style="color: inherit; text-decoration: none;">${trimmed}</a>`;
          }).join(' &nbsp;|&nbsp; ');
        } else {
          linksHtml = linksStr;
        }

        indexHtml += `    <!-- Footer Start -->\n`;
        indexHtml += `    <footer class="section section-${sec.id}">\n`;
        indexHtml += `      <div class="footer-wrapper">\n`;
        indexHtml += `        <div class="footer-links-row">\n`;
        indexHtml += `          <span>${linksHtml}</span>\n`;
        indexHtml += `        </div>\n`;
        indexHtml += `        <div class="footer-info-row">\n`;
        if (rep) indexHtml += `          <span><strong>대표자</strong>${rep}</span>\n`;
        if (addr) indexHtml += `          <span><strong>주소</strong>${addr}</span>\n`;
        if (tel) indexHtml += `          <span><strong>TEL</strong>${tel}</span>\n`;
        if (bizNum) indexHtml += `          <span><strong>사업자번호</strong>${bizNum}</span>\n`;
        indexHtml += `        </div>\n`;
        indexHtml += `        <div class="footer-copyright">${copyright}</div>\n`;
        indexHtml += `      </div>\n`;
        indexHtml += `    </footer>\n`;
        indexHtml += `    <!-- Footer End -->\n\n`;
        return;
      }

      if (sec.sectionPresetType === 'main-slide') {
        const effect = sec.slideEffectType || 'zoom';
        const autoPlay = sec.autoPlay !== false;
        const autoPlayInterval = sec.autoPlayInterval || 4000;
        const loop = sec.loop !== false;
        const enableDrag = sec.enableDrag !== false;
        const slideAutoPlayMode = sec.slideAutoPlayMode || 'fixed';
        indexHtml += `    <!-- Section: Main Slide Start -->\n`;
        indexHtml += `    <section class="section section-preset-main-slide section-${sec.id}">\n`;
        indexHtml += `      <div class="main-slide-container effect-${effect}" id="mainSlideContainer-${sec.id}" data-autoplay="${autoPlay}" data-interval="${autoPlayInterval}" data-autoplaymode="${slideAutoPlayMode}" data-loop="${loop}" data-drag="${enableDrag}">\n`;
        (sec.slideItems || []).forEach((slide, idx) => {
          const mType = slide.mediaType || 'image';
          const defaultOverlay = (mType === 'video' || mType === 'youtube') ? 45 : 0;
          const overlayOpacity = slide.overlayOpacity !== undefined ? slide.overlayOpacity : defaultOverlay;
          const brightnessVal = 1 - (overlayOpacity / 100);

          if (mType === 'video' && slide.videoSrc) {
            indexHtml += `        <div class="slide-item ${idx === 0 ? 'active' : ''}">\n`;
            indexHtml += `          <video class="slide-bg-video" autoplay loop muted playsinline preload="auto" oncanplay="this.play()" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(${brightnessVal});">\n`;
            indexHtml += `            <source src="${slide.videoSrc}" type="video/mp4">\n`;
            indexHtml += `          </video>\n`;
          } else if (mType === 'youtube' && (slide.youtubeUrl || slide.youtubeId)) {
            const extractYt = (url?: string) => {
              if (!url) return 'dQU4R_37R4s';
              const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
              return (m && m[2].length === 11) ? m[2] : 'dQU4R_37R4s';
            };
            const ytId = extractYt(slide.youtubeUrl) || slide.youtubeId || 'dQU4R_37R4s';
            indexHtml += `        <div class="slide-item ${idx === 0 ? 'active' : ''}" style="overflow: hidden;">\n`;
            indexHtml += `          <iframe style="position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh; transform: translate(-50%, -50%); border: none; pointer-events: none; filter: brightness(${brightnessVal});" src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&modestbranding=1&enablejsapi=1" allow="autoplay; encrypted-media"></iframe>\n`;
          } else {
            const bgStyle = overlayOpacity > 0 ? `background-image: url('${slide.imageSrc}'); filter: brightness(${brightnessVal});` : `background-image: url('${slide.imageSrc}');`;
            indexHtml += `        <div class="slide-item ${idx === 0 ? 'active' : ''}" style="${bgStyle}">\n`;
          }

          indexHtml += `          <div class="slide-content">\n`;
          indexHtml += `            <h1 class="slide-title">${slide.title}</h1>\n`;
          indexHtml += `            <p class="slide-desc">${slide.description}</p>\n`;
          if (slide.btnText) {
            let targetAttr = slide.linkTarget ? ` target="${slide.linkTarget}"` : '';
            indexHtml += `            <a href="${slide.linkUrl || '#'}" class="slide-btn"${targetAttr}>${slide.btnText}</a>\n`;
          }
          indexHtml += `          </div>\n`;
          indexHtml += `        </div>\n`;
        });

        if ((sec.slideItems || []).length > 1) {
          indexHtml += `        <button type="button" class="slide-arrow prev" onclick="moveMainSlide('${sec.id}', -1)">‹</button>\n`;
          indexHtml += `        <button type="button" class="slide-arrow next" onclick="moveMainSlide('${sec.id}', 1)">›</button>\n`;
          indexHtml += `        <div class="slide-dots">\n`;
          (sec.slideItems || []).forEach((_, idx) => {
            indexHtml += `          <span class="dot ${idx === 0 ? 'active' : ''}" onclick="setMainSlide('${sec.id}', ${idx})"></span>\n`;
          });
          indexHtml += `        </div>\n`;
        }
        indexHtml += `      </div>\n`;
        indexHtml += `    </section>\n`;
        indexHtml += `    <!-- Section: Main Slide End -->\n\n`;
        return;
      }

      if (sec.sectionPresetType === 'features-grid') {
        indexHtml += `    <!-- Section: Features Grid Start -->\n`;
        indexHtml += `    <section class="section section-preset-features-grid section-${sec.id}">\n`;
        indexHtml += `      <div class="features-grid-container">\n`;
        (sec.featureItems || []).forEach((item, idx) => {
          const isEven = idx % 2 === 1;
          indexHtml += `        <div class="feature-row ${isEven ? 'reverse' : ''}">\n`;
          indexHtml += `          <div class="feature-text-col">\n`;
          indexHtml += `            <h3 class="feature-title">${item.title}</h3>\n`;
          indexHtml += `            <p class="feature-desc">${item.description}</p>\n`;
          if (item.btnText) {
            indexHtml += `            <a href="${item.linkUrl || '#'}" class="feature-btn">${item.btnText}</a>\n`;
          }
          indexHtml += `          </div>\n`;
          indexHtml += `          <div class="feature-img-col">\n`;
          indexHtml += `            <img src="${item.imageSrc}" alt="${item.title}">\n`;
          indexHtml += `          </div>\n`;
          indexHtml += `        </div>\n`;
        });
        indexHtml += `      </div>\n`;
        indexHtml += `    </section>\n`;
        indexHtml += `    <!-- Section: Features Grid End -->\n\n`;
        return;
      }

      if (sec.sectionPresetType === 'promo-banner') {
        indexHtml += `    <!-- Section: Promo Banner Start -->\n`;
        const bgAttr = sec.backgroundImage ? `style="background-image: url('${sec.backgroundImage}'); background-attachment: ${sec.backgroundAttachment || 'fixed'};"` : '';
        indexHtml += `    <section class="section section-preset-promo-banner section-${sec.id}" ${bgAttr}>\n`;
        indexHtml += `      <div class="promo-banner-overlay"></div>\n`;
        indexHtml += `      <div class="promo-banner-content">\n`;
        if (sec.sectionSubTitle) {
          indexHtml += `        <span class="promo-subtitle">${sec.sectionSubTitle}</span>\n`;
        }
        indexHtml += `        <h2 class="promo-title">${sec.sectionTitle || '지속 가능한 성장과 함께하는 혁신, 우리는 미래를 준비합니다.'}</h2>\n`;
        if (sec.ctaBtnText) {
          indexHtml += `        <a href="${sec.ctaLinkUrl || '#'}" class="promo-cta-btn">${sec.ctaBtnText}</a>\n`;
        }
        indexHtml += `      </div>\n`;
        indexHtml += `    </section>\n`;
        indexHtml += `    <!-- Section: Promo Banner End -->\n\n`;
        return;
      }

      if (sec.sectionPresetType === 'card-slider') {
        indexHtml += `    <!-- Section: Card Slider Start -->\n`;
        indexHtml += `    <section class="section section-preset-card-slider section-${sec.id}">\n`;
        indexHtml += `      <div class="card-slider-header">\n`;
        indexHtml += `        <div>\n`;
        indexHtml += `          <h2 class="card-slider-title">${sec.sectionSubTitle || 'Our Latest News'}</h2>\n`;
        indexHtml += `          <div class="title-underline"></div>\n`;
        indexHtml += `        </div>\n`;
        if ((sec.cardItems || []).length > 3) {
          indexHtml += `        <div class="card-slider-nav">\n`;
          indexHtml += `          <button type="button" class="card-arrow prev" onclick="moveCardSlider('${sec.id}', -1)">‹</button>\n`;
          indexHtml += `          <button type="button" class="card-arrow next" onclick="moveCardSlider('${sec.id}', 1)">›</button>\n`;
          indexHtml += `        </div>\n`;
        }
        indexHtml += `      </div>\n`;
        indexHtml += `      <div class="card-slider-grid" id="cardSliderGrid-${sec.id}">\n`;
        (sec.cardItems || []).forEach((card, idx) => {
          indexHtml += `        <div class="card-item" data-card-index="${idx}" style="${idx < 3 ? 'display: flex;' : 'display: none;'}">\n`;
          indexHtml += `          <div class="card-img-box">\n`;
          indexHtml += `            <img src="${card.imageSrc}" alt="${card.title}">\n`;
          indexHtml += `          </div>\n`;
          indexHtml += `          <div class="card-body">\n`;
          indexHtml += `            <span class="card-tag">${card.tag || 'NEWS'}</span>\n`;
          indexHtml += `            <h4 class="card-item-title">${card.title}</h4>\n`;
          if (card.description) {
            indexHtml += `            <p class="card-desc">${card.description}</p>\n`;
          }
          indexHtml += `            <div class="card-date">${card.date}</div>\n`;
          indexHtml += `          </div>\n`;
          indexHtml += `        </div>\n`;
        });
        indexHtml += `      </div>\n`;
        indexHtml += `    </section>\n`;
        indexHtml += `    <!-- Section: Card Slider End -->\n\n`;
        return;
      }

      indexHtml += `    <!-- Section Start -->\n`;
      indexHtml += `    <section class="section section-${sec.id}">\n`;
      indexHtml += `      <div class="section-content">\n`;

      const sortedElements = [...sec.elements].sort((a, b) => {
        if (a.gridY !== b.gridY) return a.gridY - b.gridY;
        return a.gridX - b.gridX;
      });

      sortedElements.forEach((el) => {
        indexHtml += `        <!-- Element: ${el.type} -->\n`;
        indexHtml += `        <div class="grid-item" id="el-id-${el.id}">\n`;
        
        const presetClass = el.fontPresetId ? ` font-preset-${el.fontPresetId}` : '';

        if (el.type === 'title') {
          indexHtml += `          <h2 class="title-element title-${el.id}${presetClass}">${el.content}</h2>\n`;
        } else if (el.type === 'text') {
          // If it is the main navigation element, convert it to actual anchor links!
          if (el.id === 'el-logo' || el.id === 'el-nav') {
            if (el.id === 'el-nav') {
              let navHtml = '          <nav class="nav-bar-links">\n';
              pages.forEach(pageLink => {
                const isActive = pageLink.id === p.id ? 'active' : '';
                navHtml += `            <a href="${pageLink.fileName}" class="nav-link ${isActive}">${pageLink.name}</a>\n`;
              });
              navHtml += '          </nav>\n';
              indexHtml += navHtml;
            } else {
              indexHtml += `          <div class="text-element text-${el.id}${presetClass}" style="font-weight: 800;"><a href="index.html" style="color: inherit; text-decoration: none;">${el.content}</a></div>\n`;
            }
          } else {
            indexHtml += `          <div class="text-element text-${el.id}${presetClass}">${el.content}</div>\n`;
          }
        } else if (el.type === 'image') {
          const imgSrc = el.imageName ? `./images/${el.imageName}` : (el.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800');
          indexHtml += `          <div class="image-element img-${el.id}">\n`;
          indexHtml += `            <img src="${imgSrc}" alt="이미지">\n`;
          indexHtml += `          </div>\n`;
        } else if (el.type === 'button') {
          const iconSvg = getIconSvg(el.iconType);
          
          let targetHref = '';
          let targetAttr = '';
          
          if (el.linkType === 'page' && el.linkPageId) {
            const targetPage = pages.find(pageLink => pageLink.id === el.linkPageId);
            if (targetPage) {
              targetHref = targetPage.fileName;
            }
          } else if (el.linkType === 'url' && el.linkUrl) {
            targetHref = el.linkUrl;
            if (el.linkTarget === '_blank') {
              targetAttr = ' target="_blank" rel="noopener noreferrer"';
            }
          } else if (el.id === 'el-header-btn') {
            const loginPage = pages.find(pageLink => pageLink.id === 'login');
            if (loginPage) targetHref = loginPage.fileName;
          } else if (el.id === 'el-hero-btn') {
            const submainPage = pages.find(pageLink => pageLink.id === 'submain');
            if (submainPage) targetHref = submainPage.fileName;
          } else if (el.id === 'el-login-submit') {
            const mypagePage = pages.find(pageLink => pageLink.id === 'mypage');
            if (mypagePage) targetHref = mypagePage.fileName;
          }

          const clickAttr = targetHref ? ` onclick="location.href='${targetHref}'"` : '';
          const presetClass = el.fontPresetId ? ` font-preset-${el.fontPresetId}` : '';
          
          if (targetHref && !targetHref.startsWith('javascript:')) {
            indexHtml += `          <a href="${targetHref}"${targetAttr} class="btn-element btn-${el.id}${presetClass}" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">\n`;
          } else {
            indexHtml += `          <button class="btn-element btn-${el.id}${presetClass}"${clickAttr}>\n`;
          }
          if (iconSvg && el.iconPosition === 'before') {
            indexHtml += `            ${iconSvg}\n`;
          }
          indexHtml += `            <span>${el.content}</span>\n`;
          if (iconSvg && el.iconPosition === 'after') {
            indexHtml += `            ${iconSvg}\n`;
          }
          if (targetHref && !targetHref.startsWith('javascript:')) {
            indexHtml += `          </a>\n`;
          } else {
            indexHtml += `          </button>\n`;
          }
        } else if (el.type === 'three-column') {
          const col1IconSvg = getIconSvg(el.col1Icon);
          const col2IconSvg = getIconSvg(el.col2Icon);
          const col3IconSvg = getIconSvg(el.col3Icon);
          const showIconBg = !!el.colShowIconBg;

          const titlePresetClass = el.colTitlePresetId ? ` class="font-preset-${el.colTitlePresetId}"` : '';
          const textPresetClass = el.colTextPresetId ? ` class="font-preset-${el.colTextPresetId}"` : '';

          indexHtml += `          <div class="three-column-element three-column-${el.id}">\n`;
          
          const writeColumn = (title: string, text: string, iconSvg: string) => {
            let colHtml = `            <div class="col-item">\n`;
            if (iconSvg) {
              if (showIconBg) {
                const sizedSvg = iconSvg.replace(/width="16"/g, 'width="24"').replace(/height="16"/g, 'height="24"');
                colHtml += `              <div class="col-icon-circle">${sizedSvg}</div>\n`;
              } else {
                const sizedSvg = iconSvg.replace(/width="16"/g, 'width="28"').replace(/height="16"/g, 'height="28"');
                colHtml += `              <div class="col-icon-wrapper">${sizedSvg}</div>\n`;
              }
            }
            colHtml += `              <h3${titlePresetClass}>${title}</h3>\n`;
            colHtml += `              <p${textPresetClass}>${text}</p>\n`;
            colHtml += `            </div>\n`;
            return colHtml;
          };

          indexHtml += writeColumn(el.col1Title || '타이틀', el.col1Text || '본문 내용을 입력하세요.', col1IconSvg);
          indexHtml += writeColumn(el.col2Title || '타이틀', el.col2Text || '본문 내용을 입력하세요.', col2IconSvg);
          indexHtml += writeColumn(el.col3Title || '타이틀', el.col3Text || '본문 내용을 입력하세요.', col3IconSvg);

          indexHtml += `          </div>\n`;
        } else if (el.type === 'legal-doc') {
          const articles = el.legalArticles || [];
          
          indexHtml += `          <div class="legal-doc-container" style="text-align: ${el.align || 'left'};">\n`;
          indexHtml += `            <ul class="legal-chapter-list">\n`;
          indexHtml += `              <li class="legal-chapter-item">\n`;
          indexHtml += `                <ul class="legal-article-list">\n`;
          
          articles.forEach((art) => {
            const clausesList = (art.clauses && art.clauses.length > 0)
              ? art.clauses
              : [{ id: `${art.id}-c0`, num: art.num || '', content: art.content || '', subItems: art.subItems }];

            indexHtml += `                  <li class="legal-article-item" style="margin-bottom: 20px;">\n`;
            indexHtml += `                    <h5 class="legal-article-title">${art.title}</h5>\n`;
            
            indexHtml += `                    <ol class="legal-clause-list">\n`;
            clausesList.forEach((clause) => {
              indexHtml += `                      <li class="legal-clause-item" style="display: flex; gap: 12px; margin-bottom: 8px;">\n`;
              if (clause.num) indexHtml += `                        <span class="legal-clause-num">${clause.num}</span>\n`;
              indexHtml += `                        <div class="legal-clause-body">${(clause.content || '').replace(/\n/g, '<br/>')}`;
              
              if (clause.subItems && clause.subItems.length > 0) {
                indexHtml += `\n                          <ol class="legal-subclause-list">\n`;
                clause.subItems.forEach((sub) => {
                  indexHtml += `                            <li class="legal-subclause-item"><span class="legal-subclause-num">${sub.num}</span><div class="legal-subclause-body">${sub.content}</div></li>\n`;
                });
                indexHtml += `                          </ol>\n                        `;
              }
              
              indexHtml += `</div>\n`;
              indexHtml += `                      </li>\n`;
            });
            indexHtml += `                    </ol>\n`;
            indexHtml += `                  </li>\n`;
          });

          indexHtml += `                </ul>\n`;
          indexHtml += `              </li>\n`;
          indexHtml += `            </ul>\n`;
          indexHtml += `          </div>\n`;
        }
        
        indexHtml += `        </div>\n`;
      });

      indexHtml += `      </div>\n`;
      indexHtml += `    </section>\n`;
      indexHtml += `    <!-- Section End -->\n\n`;
    });
    indexHtml += `  <script>\n`;
    indexHtml += `    // Header scroll background effect\n`;
    indexHtml += `    window.addEventListener('scroll', function() {\n`;
    indexHtml += `      const headers = document.querySelectorAll('[class*="section-sec-header"], [class*="section-header"]');\n`;
    indexHtml += `      headers.forEach(function(header) {\n`;
    indexHtml += `        if (window.scrollY > 0) {\n`;
    indexHtml += `          header.classList.add('scrolled');\n`;
    indexHtml += `        } else {\n`;
    indexHtml += `          header.classList.remove('scrolled');\n`;
    indexHtml += `        }\n`;
    indexHtml += `      });\n`;
    indexHtml += `    });\n\n`;

    indexHtml += `    // Main Slide Timer & Navigation Management\n`;
    indexHtml += `    var mainSlideTimers = {};\n\n`;

    indexHtml += `    function startMainSlideTimer(secId) {\n`;
    indexHtml += `      const container = document.getElementById('mainSlideContainer-' + secId);\n`;
    indexHtml += `      if (!container) return;\n`;
    indexHtml += `      const autoPlay = container.dataset.autoplay === 'true';\n`;
    indexHtml += `      const interval = parseInt(container.dataset.interval || '4000', 10);\n`;
    indexHtml += `      const autoPlayMode = container.dataset.autoplaymode || 'fixed';\n`;
    indexHtml += `      const loop = container.dataset.loop === 'true';\n\n`;
    indexHtml += `      if (mainSlideTimers[secId]) {\n`;
    indexHtml += `        clearInterval(mainSlideTimers[secId]);\n`;
    indexHtml += `        mainSlideTimers[secId] = null;\n`;
    indexHtml += `      }\n\n`;
    indexHtml += `      if (autoPlay && autoPlayMode !== 'video-end') {\n`;
    indexHtml += `        mainSlideTimers[secId] = setInterval(function() {\n`;
    indexHtml += `          let curr = parseInt(container.dataset.currentIndex || '0', 10);\n`;
    indexHtml += `          const slides = container.querySelectorAll('.slide-item');\n`;
    indexHtml += `          if (!loop && curr >= slides.length - 1) return;\n`;
    indexHtml += `          moveMainSlide(secId, 1, false);\n`;
    indexHtml += `        }, interval);\n`;
    indexHtml += `      }\n`;
    indexHtml += `    }\n\n`;

    indexHtml += `    function setMainSlide(secId, index, resetTimer) {\n`;
    indexHtml += `      const container = document.getElementById('mainSlideContainer-' + secId);\n`;
    indexHtml += `      if (!container) return;\n`;
    indexHtml += `      const slides = container.querySelectorAll('.slide-item');\n`;
    indexHtml += `      const dots = container.querySelectorAll('.slide-dots .dot');\n`;
    indexHtml += `      slides.forEach(function(s, idx) { s.classList.toggle('active', idx === index); });\n`;
    indexHtml += `      dots.forEach(function(d, idx) { d.classList.toggle('active', idx === index); });\n`;
    indexHtml += `      container.dataset.currentIndex = index;\n\n`;
    indexHtml += `      const activeSlide = slides[index];\n`;
    indexHtml += `      if (activeSlide) {\n`;
    indexHtml += `        const vid = activeSlide.querySelector('video');\n`;
    indexHtml += `        if (vid) {\n`;
    indexHtml += `          vid.currentTime = 0;\n`;
    indexHtml += `          var p = vid.play();\n`;
    indexHtml += `          if (p !== undefined) { p.catch(function() {}); }\n`;
    indexHtml += `        }\n`;
    indexHtml += `      }\n\n`;
    indexHtml += `      if (resetTimer !== false) {\n`;
    indexHtml += `        startMainSlideTimer(secId);\n`;
    indexHtml += `      }\n`;
    indexHtml += `    }\n\n`;

    indexHtml += `    function moveMainSlide(secId, direction, resetTimer) {\n`;
    indexHtml += `      const container = document.getElementById('mainSlideContainer-' + secId);\n`;
    indexHtml += `      if (!container) return;\n`;
    indexHtml += `      const slides = container.querySelectorAll('.slide-item');\n`;
    indexHtml += `      if (!slides.length) return;\n`;
    indexHtml += `      let curr = parseInt(container.dataset.currentIndex || '0', 10);\n`;
    indexHtml += `      curr = (curr + direction + slides.length) % slides.length;\n`;
    indexHtml += `      setMainSlide(secId, curr, resetTimer);\n`;
    indexHtml += `    }\n\n`;

    indexHtml += `    // Card Slider functionality\n`;
    indexHtml += `    function moveCardSlider(secId, direction) {\n`;
    indexHtml += `      const grid = document.getElementById('cardSliderGrid-' + secId);\n`;
    indexHtml += `      if (!grid) return;\n`;
    indexHtml += `      const cards = Array.from(grid.querySelectorAll('.card-item'));\n`;
    indexHtml += `      if (cards.length <= 3) return;\n`;
    indexHtml += `      let startIdx = parseInt(grid.dataset.startIndex || '0', 10);\n`;
    indexHtml += `      startIdx = (startIdx + direction + cards.length) % cards.length;\n`;
    indexHtml += `      grid.dataset.startIndex = startIdx;\n`;
    indexHtml += `      cards.forEach(function(card, idx) {\n`;
    indexHtml += `        const visible = (idx >= startIdx && idx < startIdx + 3) || (startIdx + 3 > cards.length && idx < (startIdx + 3) % cards.length);\n`;
    indexHtml += `        card.style.display = visible ? 'flex' : 'none';\n`;
    indexHtml += `      });\n`;
    indexHtml += `    }\n\n`;

    indexHtml += `    // Autoplay & Drag/Swipe Event Listeners\n`;
    indexHtml += `    document.addEventListener('DOMContentLoaded', function() {\n`;
    indexHtml += `      const startAllVideos = function() {\n`;
    indexHtml += `        document.querySelectorAll('video.slide-bg-video').forEach(function(v) {\n`;
    indexHtml += `          v.muted = true;\n`;
    indexHtml += `          var p = v.play();\n`;
    indexHtml += `          if (p !== undefined) { p.catch(function() {}); }\n`;
    indexHtml += `        });\n`;
    indexHtml += `      };\n`;
    indexHtml += `      startAllVideos();\n`;
    indexHtml += `      window.addEventListener('load', startAllVideos);\n`;
    indexHtml += `      document.addEventListener('click', startAllVideos, { once: true });\n\n`;

    indexHtml += `      const slideContainers = document.querySelectorAll('.main-slide-container');\n`;
    indexHtml += `      slideContainers.forEach(function(container) {\n`;
    indexHtml += `        const secId = container.id.replace('mainSlideContainer-', '');\n`;
    indexHtml += `        const autoPlayMode = container.dataset.autoplaymode || 'fixed';\n`;
    indexHtml += `        const enableDrag = container.dataset.drag === 'true';\n\n`;

    indexHtml += `        startMainSlideTimer(secId);\n\n`;

    indexHtml += `        if (autoPlayMode === 'video-end') {\n`;
    indexHtml += `          container.querySelectorAll('.slide-item').forEach(function(item) {\n`;
    indexHtml += `            const vid = item.querySelector('video');\n`;
    indexHtml += `            if (vid) {\n`;
    indexHtml += `              vid.loop = false;\n`;
    indexHtml += `              vid.addEventListener('ended', function() { moveMainSlide(secId, 1); });\n`;
    indexHtml += `            }\n`;
    indexHtml += `          });\n`;
    indexHtml += `        }\n\n`;

    indexHtml += `        if (enableDrag) {\n`;
    indexHtml += `          let startX = null;\n`;
    indexHtml += `          container.addEventListener('mousedown', function(e) { startX = e.clientX; });\n`;
    indexHtml += `          container.addEventListener('mouseup', function(e) {\n`;
    indexHtml += `            if (startX === null) return;\n`;
    indexHtml += `            const diff = e.clientX - startX;\n`;
    indexHtml += `            if (Math.abs(diff) > 40) {\n`;
    indexHtml += `              if (diff < 0) moveMainSlide(secId, 1); else moveMainSlide(secId, -1);\n`;
    indexHtml += `            }\n`;
    indexHtml += `            startX = null;\n`;
    indexHtml += `          });\n`;
    indexHtml += `          container.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });\n`;
    indexHtml += `          container.addEventListener('touchend', function(e) {\n`;
    indexHtml += `            if (startX === null) return;\n`;
    indexHtml += `            const diff = e.changedTouches[0].clientX - startX;\n`;
    indexHtml += `            if (Math.abs(diff) > 40) {\n`;
    indexHtml += `              if (diff < 0) moveMainSlide(secId, 1); else moveMainSlide(secId, -1);\n`;
    indexHtml += `            }\n`;
    indexHtml += `            startX = null;\n`;
    indexHtml += `          }, { passive: true });\n`;
    indexHtml += `        }\n`;
    indexHtml += `      });\n`;
    indexHtml += `    });\n`;
    indexHtml += `  </script>\n`;
    indexHtml += `  </div>\n</body>\n</html>\n`;
    files[p.fileName] = indexHtml;
  });

  // Generate siteMap.html automatically if not defined
  if (!files['siteMap.html']) {
    const validPages = pages.filter(p => p.fileName !== 'siteMap.html');
    let sitemapHtml = `<!DOCTYPE html>\n<html lang="ko">\n<head>\n`;
    sitemapHtml += `  <meta charset="UTF-8">\n`;
    sitemapHtml += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    sitemapHtml += `  <title>사이트맵 (SiteMap)</title>\n`;
    sitemapHtml += `${fontLinksHtml}\n`;
    sitemapHtml += `  <link rel="stylesheet" href="variables.css">\n`;
    sitemapHtml += `  <link rel="stylesheet" href="style.css">\n`;
    sitemapHtml += `  <style>\n`;
    sitemapHtml += `    .sitemap-container { max-width: 960px; margin: 60px auto; padding: 0 24px; font-family: 'Inter', sans-serif; }\n`;
    sitemapHtml += `    .sitemap-title { font-size: 30px; font-weight: 800; color: #0f172a; border-bottom: 2px solid var(--theme-primary, #1e3a8a); padding-bottom: 16px; margin-bottom: 32px; }\n`;
    sitemapHtml += `    .sitemap-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 20px; list-style: none; padding: 0; margin: 0; }\n`;
    sitemapHtml += `    .sitemap-item a { display: block; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }\n`;
    sitemapHtml += `    .sitemap-item a:hover { border-color: var(--theme-primary, #1e3a8a); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }\n`;
    sitemapHtml += `    .sitemap-page-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }\n`;
    sitemapHtml += `    .sitemap-file-name { font-size: 13px; color: #64748b; font-family: monospace; }\n`;
    sitemapHtml += `  </style>\n`;
    sitemapHtml += `</head>\n<body>\n`;
    sitemapHtml += `  <div class="sitemap-container">\n`;
    sitemapHtml += `    <h1 class="sitemap-title">사이트맵 (Site Map)</h1>\n`;
    sitemapHtml += `    <ul class="sitemap-list">\n`;
    validPages.forEach((p) => {
      sitemapHtml += `      <li class="sitemap-item">\n`;
      sitemapHtml += `        <a href="${p.fileName}">\n`;
      sitemapHtml += `          <div class="sitemap-page-name">${p.name}</div>\n`;
      sitemapHtml += `          <div class="sitemap-file-name">${p.fileName}</div>\n`;
      sitemapHtml += `        </a>\n`;
      sitemapHtml += `      </li>\n`;
    });
    sitemapHtml += `    </ul>\n`;
    sitemapHtml += `  </div>\n</body>\n</html>\n`;
    files['siteMap.html'] = sitemapHtml;
  }

  return files;
};

// Helper function to darken/lighten hex color for button hovers
function adjustColorBrightness(hex: string, percent: number): string {
  if (!hex.startsWith('#')) return hex;
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + percent));
  G = Math.max(0, Math.min(255, G + percent));
  B = Math.max(0, Math.min(255, B + percent));

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}
