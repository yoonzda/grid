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
        styleCss += `  background-color: var(--sec-${sec.id}-bg-color);\n`;
        styleCss += `  padding-top: var(--header-${sec.id}-padding-y);\n`;
        styleCss += `  padding-bottom: var(--header-${sec.id}-padding-y);\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  align-items: center;\n`;
        styleCss += `}\n`;
        
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
      styleCss += `  --content-width: ${sec.guidelineWidth || '80%'};\n`;
      styleCss += `  background-color: var(--sec-${sec.id}-bg-color);\n`;
      styleCss += `  background-image: var(--sec-${sec.id}-bg-image);\n`;
      if (sec.backgroundImage) {
        styleCss += `  background-position: var(--sec-${sec.id}-bg-pos);\n`;
        styleCss += `  background-size: var(--sec-${sec.id}-bg-size);\n`;
        styleCss += `  background-repeat: var(--sec-${sec.id}-bg-repeat);\n`;
      }
      
      const isAuto = sec.heightMode === 'auto';
      styleCss += `  min-height: ${isAuto ? 'auto' : `var(--sec-${sec.id}-height)`};\n`;
      styleCss += `  display: flex;\n`;
      styleCss += `  flex-direction: column;\n`;
      const vertAlign = isAuto ? 'flex-start' : (sec.verticalAlign === 'start' ? 'flex-start' : sec.verticalAlign === 'end' ? 'flex-end' : 'center');
      styleCss += `  justify-content: ${vertAlign};\n`;
      styleCss += `}\n`;

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
`;

  // 3. Generate HTML code for EACH page
  const files: GeneratedFiles = {
    'style.css': styleCss,
    'variables.css': variablesCss
  };

  pages.forEach(p => {
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
          const isAccordion = el.legalStyle === 'accordion';
          
          indexHtml += `          <div class="legal-doc-container" style="text-align: ${el.align || 'left'};">\n`;
          indexHtml += `            <ul class="legal-chapter-list">\n`;
          indexHtml += `              <li class="legal-chapter-item">\n`;
          indexHtml += `                <ul class="legal-article-list">\n`;
          
          articles.forEach((art) => {
            indexHtml += `                  <li class="legal-article-item" style="margin-bottom: 20px;">\n`;
            if (isAccordion) {
              indexHtml += `                    <details class="legal-accordion-details" open>\n`;
              indexHtml += `                      <summary className="legal-article-title-summary" style="font-weight: 700; cursor: pointer; font-size: 15px; margin-bottom: 8px;">${art.title}</summary>\n`;
            } else {
              indexHtml += `                    <h5 class="legal-article-title">${art.title}</h5>\n`;
            }
            
            indexHtml += `                    <ol class="legal-clause-list">\n`;
            indexHtml += `                      <li class="legal-clause-item">\n`;
            if (art.num) indexHtml += `                        <span class="legal-clause-num">${art.num}</span>\n`;
            indexHtml += `                        <div class="legal-clause-body">${art.content.replace(/\n/g, '<br/>')}`;
            
            if (art.subItems && art.subItems.length > 0) {
              indexHtml += `\n                          <ol class="legal-subclause-list">\n`;
              art.subItems.forEach((sub) => {
                indexHtml += `                            <li class="legal-subclause-item"><span class="legal-subclause-num">${sub.num}</span><div class="legal-subclause-body">${sub.content}</div></li>\n`;
              });
              indexHtml += `                          </ol>\n                        `;
            }
            
            indexHtml += `</div>\n`;
            indexHtml += `                      </li>\n`;
            indexHtml += `                    </ol>\n`;
            
            if (isAccordion) {
              indexHtml += `                    </details>\n`;
            }
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
