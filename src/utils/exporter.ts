import { Page, ThemeSettings, GuidelineWidth, GeneratedFiles } from '../types';
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

export const generateCode = (pages: Page[], theme: ThemeSettings, guideline: GuidelineWidth): GeneratedFiles => {
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
  --content-width: ${guideline === '100%' ? '100%' : guideline === '80%' ? '80%' : '60%'};
  --grid-gap: ${theme.gridGap ?? 20}px;
  --grid-row-height: ${theme.gridRowHeight ?? 40}px;

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
        
        const headerBtnBg = sec.headerBtnBgColor || '#10b981';
        variablesCss += `  --header-${sec.id}-btn-bg: ${headerBtnBg};\n`;
        variablesCss += `  --header-${sec.id}-btn-hover-bg: ${headerBtnBg ? adjustColorBrightness(headerBtnBg, -15) : '#0ea5e9'};\n`;
        variablesCss += `  --header-${sec.id}-btn-text-color: ${sec.headerBtnTextColor || '#ffffff'};\n`;
        variablesCss += `  --header-${sec.id}-btn-radius: ${sec.headerBtnRadius ?? 4}px;\n`;
        variablesCss += `  --header-${sec.id}-btn-font: ${getFontFamilyByFamilyName(sec.headerBtnFont || 'Inter')};\n`;
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
      variablesCss += `  --sec-${sec.id}-height: ${sec.height}px;\n`;

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
        variablesCss += `  --el-${el.id}-font-family: ${getFontFamilyByFamilyName(el.fontFamily)};\n`;
        
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

body {
  font-family: var(--font-default);
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
  padding: 40px 0;
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
          styleCss += `  background-color: rgba(var(--theme-primary-rgb), 0.08);\n`;
          styleCss += `}\n`;
        } else if (headerBtnVar === 'ghost') {
          styleCss += `.section-${sec.id} .header-btn:hover {\n`;
          styleCss += `  background-color: rgba(var(--theme-primary-rgb), 0.06);\n`;
          styleCss += `}\n`;
        }
        return;
      }

      styleCss += `\n/* Section: ${sec.id} */\n`;
      styleCss += `.section-${sec.id} {\n`;
      styleCss += `  background-color: var(--sec-${sec.id}-bg-color);\n`;
      styleCss += `  background-image: var(--sec-${sec.id}-bg-image);\n`;
      if (sec.backgroundImage) {
        styleCss += `  background-position: var(--sec-${sec.id}-bg-pos);\n`;
        styleCss += `  background-size: var(--sec-${sec.id}-bg-size);\n`;
        styleCss += `  background-repeat: var(--sec-${sec.id}-bg-repeat);\n`;
      }
      styleCss += `  min-height: var(--sec-${sec.id}-height);\n`;
      styleCss += `}\n`;

      if (sec.layoutMode === 'flex') {
        const align = sec.flexAlign === 'start' ? 'flex-start' : sec.flexAlign === 'end' ? 'flex-end' : sec.flexAlign === 'space-between' ? 'space-between' : 'center';
        styleCss += `.section-${sec.id} .section-content {\n`;
        styleCss += `  display: flex;\n`;
        styleCss += `  flex-direction: ${sec.flexDirection === 'horizontal' ? 'row' : 'column'};\n`;
        styleCss += `  gap: ${sec.flexGap ?? 16}px;\n`;
        styleCss += `  align-items: ${sec.flexDirection === 'horizontal' ? 'center' : 'stretch'};\n`;
        styleCss += `  justify-content: ${align};\n`;
        styleCss += `}\n`;
      }

      sec.elements.forEach((el) => {
        if (styledElements.has(el.id)) return;
        styledElements.add(el.id);

        styleCss += `\n#el-id-${el.id} {\n`;
        if (sec.layoutMode === 'flex') {
          if (el.widthMode === 'fit-content') {
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
          if (el.widthMode === 'fit-content') {
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
        } else if (el.type === 'button') {
          const btnVar = el.btnVariant || 'filled';
          const btnSize = el.btnSize || 'medium';
          
          styleCss += `.btn-${el.id} {\n`;
          styleCss += `  font-family: var(--el-${el.id}-font-family);\n`;
          styleCss += `  border-radius: var(--el-${el.id}-btn-radius);\n`;
          styleCss += `  font-weight: 600;\n`;
          styleCss += `  cursor: pointer;\n`;
          styleCss += `  transition: background-color 0.25s, border-color 0.25s, opacity 0.2s;\n`;
          styleCss += `  white-space: nowrap;\n`;

          if (btnVar === 'filled') {
            styleCss += `  background-color: var(--el-${el.id}-btn-bg);\n`;
            styleCss += `  color: var(--el-${el.id}-btn-text-color);\n`;
            styleCss += `  border: none;\n`;
          } else if (btnVar === 'outlined') {
            styleCss += `  background-color: transparent;\n`;
            styleCss += `  color: var(--el-${el.id}-btn-bg);\n`;
            styleCss += `  border: 2px solid var(--el-${el.id}-btn-bg);\n`;
          } else if (btnVar === 'ghost') {
            styleCss += `  background-color: transparent;\n`;
            styleCss += `  color: var(--el-${el.id}-btn-bg);\n`;
            styleCss += `  border: none;\n`;
          }

          if (btnSize === 'small') {
            styleCss += `  padding: 6px 12px;\n`;
            styleCss += `  font-size: 12px;\n`;
          } else if (btnSize === 'large') {
            styleCss += `  padding: 14px 28px;\n`;
            styleCss += `  font-size: 16px;\n`;
          } else {
            styleCss += `  padding: 10px 20px;\n`;
            styleCss += `  font-size: 14px;\n`;
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
          
          // Connect standard button routes
          let clickAttr = '';
          if (el.id === 'el-header-btn') {
            // Links to contact/login page
            const loginPage = pages.find(pageLink => pageLink.id === 'login');
            if (loginPage) {
              clickAttr = ` onclick="location.href='${loginPage.fileName}'"`;
            }
          } else if (el.id === 'el-hero-btn') {
            const submainPage = pages.find(pageLink => pageLink.id === 'submain');
            if (submainPage) {
              clickAttr = ` onclick="location.href='${submainPage.fileName}'"`;
            }
          } else if (el.id === 'el-login-submit') {
            const mypagePage = pages.find(pageLink => pageLink.id === 'mypage');
            if (mypagePage) {
              clickAttr = ` onclick="location.href='${mypagePage.fileName}'"`;
            }
          }

          const presetClass = el.fontPresetId ? ` font-preset-${el.fontPresetId}` : '';
          indexHtml += `          <button class="btn-element btn-${el.id}${presetClass}"${clickAttr}>\n`;
          if (iconSvg && el.iconPosition === 'before') {
            indexHtml += `            ${iconSvg}\n`;
          }
          indexHtml += `            <span>${el.content}</span>\n`;
          if (iconSvg && el.iconPosition === 'after') {
            indexHtml += `            ${iconSvg}\n`;
          }
          indexHtml += `          </button>\n`;
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
