import { Section, EditorElement, GuidelineWidth, GeneratedFiles } from '../types';
import { SUPPORTED_FONTS, getFontFamilyByFamilyName } from './fontManager';
import { getIconSvg } from './iconTemplates';

export const generateCode = (sections: Section[], guideline: GuidelineWidth): GeneratedFiles => {
  // Collect all unique google fonts used in elements
  const usedFonts = new Set<string>();
  sections.forEach(sec => {
    sec.elements.forEach(el => {
      if (el.fontFamily) {
        usedFonts.add(el.fontFamily);
      }
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
  /* Layout Global Settings */
  --content-width: ${guideline === '100%' ? '100%' : guideline === '80%' ? '80%' : '60%'};
  --grid-gap: 20px;
  --grid-row-height: 40px;
  
  /* Fonts default */
  --font-default: 'Inter', system-ui, -apple-system, sans-serif;
`;

  // Write variables for sections and elements
  sections.forEach((sec, sIdx) => {
    variablesCss += `\n  /* --- Section ${sIdx + 1} (${sec.id}) --- */\n`;
    variablesCss += `  --sec-${sec.id}-bg-color: ${sec.backgroundColor};\n`;
    if (sec.backgroundImage) {
      variablesCss += `  --sec-${sec.id}-bg-image: url('${sec.backgroundImage}');\n`;
    } else {
      variablesCss += `  --sec-${sec.id}-bg-image: none;\n`;
    }
    variablesCss += `  --sec-${sec.id}-height: ${sec.height}px;\n`;

    sec.elements.forEach((el) => {
      variablesCss += `\n  /* Element: ${el.type} (${el.id}) */\n`;
      variablesCss += `  --el-${el.id}-grid-x: ${el.gridX};\n`;
      variablesCss += `  --el-${el.id}-grid-w: ${el.gridW};\n`;
      variablesCss += `  --el-${el.id}-grid-y: ${el.gridY};\n`;
      variablesCss += `  --el-${el.id}-grid-h: ${el.gridH};\n`;
      variablesCss += `  --el-${el.id}-color: ${el.color};\n`;
      variablesCss += `  --el-${el.id}-font-size: ${el.fontSize};\n`;
      variablesCss += `  --el-${el.id}-font-family: ${getFontFamilyByFamilyName(el.fontFamily)};\n`;
      
      if (el.type === 'button') {
        variablesCss += `  --el-${el.id}-btn-bg: ${el.btnBgColor || '#3b82f6'};\n`;
        variablesCss += `  --el-${el.id}-btn-hover-bg: ${el.btnBgColor ? adjustColorBrightness(el.btnBgColor, -15) : '#2563eb'};\n`;
        variablesCss += `  --el-${el.id}-btn-text-color: ${el.btnTextColor || '#ffffff'};\n`;
        variablesCss += `  --el-${el.id}-btn-radius: ${el.borderRadius ?? 6}px;\n`;
      }
      
      if (el.type === 'image') {
        variablesCss += `  --el-${el.id}-img-radius: ${el.borderRadius ?? 0}px;\n`;
        variablesCss += `  --el-${el.id}-img-shadow: ${el.boxShadow || 'none'};\n`;
      }
    });
  });

  variablesCss += `}\n`;

  // 2. style.css
  let styleCss = `/* style.css */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-default);
  background-color: #f7f7f7;
  color: #333333;
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

/* Individual Styles */
`;

  // Add individual section and element layout rules
  sections.forEach((sec) => {
    styleCss += `\n/* Section: ${sec.id} */\n`;
    styleCss += `.section-${sec.id} {\n`;
    styleCss += `  background-color: var(--sec-${sec.id}-bg-color);\n`;
    styleCss += `  background-image: var(--sec-${sec.id}-bg-image);\n`;
    styleCss += `  min-height: var(--sec-${sec.id}-height);\n`;
    styleCss += `}\n`;

    sec.elements.forEach((el) => {
      styleCss += `\n#el-id-${el.id} {\n`;
      styleCss += `  grid-column: calc(var(--el-${el.id}-grid-x) + 1) / span var(--el-${el.id}-grid-w);\n`;
      styleCss += `  grid-row: calc(var(--el-${el.id}-grid-y) + 1) / span var(--el-${el.id}-grid-h);\n`;
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
        styleCss += `.btn-${el.id} {\n`;
        styleCss += `  background-color: var(--el-${el.id}-btn-bg);\n`;
        styleCss += `  color: var(--el-${el.id}-btn-text-color);\n`;
        styleCss += `  border-radius: var(--el-${el.id}-btn-radius);\n`;
        styleCss += `  font-size: var(--el-${el.id}-font-size);\n`;
        styleCss += `  font-family: var(--el-${el.id}-font-family);\n`;
        styleCss += `}\n`;
        styleCss += `.btn-${el.id}:hover {\n`;
        styleCss += `  background-color: var(--el-${el.id}-btn-hover-bg);\n`;
        styleCss += `}\n`;
      }
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
}
`;

  // 3. index.html
  let indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>내보낸 웹페이지</title>
  <!-- Google Fonts -->
${fontLinksHtml}
  <!-- Stylesheets -->
  <link rel="stylesheet" href="variables.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="webpage">
`;

  // Add section components
  sections.forEach((sec) => {
    indexHtml += `    <!-- Section Start -->\n`;
    indexHtml += `    <section class="section section-${sec.id}">\n`;
    indexHtml += `      <div class="section-content">\n`;

    // Sort elements inside section by gridY then gridX so tab indexing and mobile stacking order is natural
    const sortedElements = [...sec.elements].sort((a, b) => {
      if (a.gridY !== b.gridY) return a.gridY - b.gridY;
      return a.gridX - b.gridX;
    });

    sortedElements.forEach((el) => {
      indexHtml += `        <!-- Element: ${el.type} -->\n`;
      indexHtml += `        <div class="grid-item" id="el-id-${el.id}">\n`;
      
      if (el.type === 'title') {
        indexHtml += `          <h2 class="title-element title-${el.id}">${el.content}</h2>\n`;
      } else if (el.type === 'text') {
        indexHtml += `          <div class="text-element text-${el.id}">${el.content}</div>\n`;
      } else if (el.type === 'image') {
        indexHtml += `          <div class="image-element img-${el.id}">\n`;
        indexHtml += `            <img src="${el.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}" alt="이미지">\n`;
        indexHtml += `          </div>\n`;
      } else if (el.type === 'button') {
        const iconSvg = getIconSvg(el.iconType);
        indexHtml += `          <button class="btn-element btn-${el.id}">\n`;
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

  return {
    'index.html': indexHtml,
    'style.css': styleCss,
    'variables.css': variablesCss
  };
};

// Helper function to darken/lighten hex color for button hovers
function adjustColorBrightness(hex: string, percent: number): string {
  // Simple check for hex
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
