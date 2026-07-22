export interface FontInfo {
  name: string;
  family: string;
  isKorean: boolean;
  importUrl: string;
}

export const SUPPORTED_FONTS: FontInfo[] = [
  // --- High-End Global Brand English Fonts ---
  {
    name: 'Syne',
    family: "'Syne', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap'
  },
  {
    name: 'Cinzel',
    family: "'Cinzel', serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap'
  },
  {
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap'
  },
  {
    name: 'Bodoni Moda',
    family: "'Bodoni Moda', serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@700;900&display=swap'
  },
  {
    name: 'Cormorant Garamond',
    family: "'Cormorant Garamond', serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap'
  },
  {
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap'
  },
  {
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap'
  },
  {
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap'
  },
  {
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&display=swap'
  },
  {
    name: 'Oswald',
    family: "'Oswald', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap'
  },
  {
    name: 'Bebas Neue',
    family: "'Bebas Neue', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'
  },
  {
    name: 'Unbounded',
    family: "'Unbounded', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@700;900&display=swap'
  },
  {
    name: 'Abril Fatface',
    family: "'Abril Fatface', serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap'
  },
  {
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap'
  },
  {
    name: 'Inter',
    family: "'Inter', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@600;800&display=swap'
  },
  {
    name: 'Roboto',
    family: "'Roboto', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap'
  },

  // --- Korean Popular Brand & Display Fonts ---
  {
    name: '본고딕',
    family: "'Noto Sans KR', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500;700;900&display=swap'
  },
  {
    name: '나눔명조',
    family: "'Nanum Myeongjo', serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@700;800&display=swap'
  },
  {
    name: '검은고딕',
    family: "'Black Han Sans', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap'
  },
  {
    name: '고운바탕',
    family: "'Gowun Batang', serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap'
  },
  {
    name: '고운돋움',
    family: "'Gowun Dodum', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap'
  },
  {
    name: 'IBM Plex Sans KR',
    family: "'IBM Plex Sans KR', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@500;700&display=swap'
  },
  {
    name: '도현체',
    family: "'Do Hyeon', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap'
  },
  {
    name: '주아체',
    family: "'Jua', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Jua&display=swap'
  },
  {
    name: '송명',
    family: "'Song Myung', serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Song+Myung&display=swap'
  },
  {
    name: '나눔손글씨 붓',
    family: "'Nanum Brush Script', cursive",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap'
  },
  {
    name: '동해독도',
    family: "'East Sea Dokdo', cursive",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=East+Sea+Dokdo&display=swap'
  },
  {
    name: '나눔고딕',
    family: "'Nanum Gothic', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@700;800&display=swap'
  }
];

export const findSupportedFont = (fontName: string | undefined): FontInfo => {
  const defaultFont = SUPPORTED_FONTS.find(f => f.name.includes('Inter')) || SUPPORTED_FONTS[0];
  if (!fontName) return defaultFont;
  const found = SUPPORTED_FONTS.find(f => 
    f.name === fontName || 
    f.name.toLowerCase().startsWith(fontName.toLowerCase()) || 
    f.family.toLowerCase().includes(fontName.toLowerCase()) ||
    fontName.toLowerCase().startsWith(f.name.split(' ')[0].toLowerCase())
  );
  return found || defaultFont;
};

export const getFontFamilyByFamilyName = (familyName: string): string => {
  if (!familyName) return "'Inter', sans-serif";
  const font = findSupportedFont(familyName);
  return font ? font.family : familyName.includes(',') ? familyName : `'${familyName}', sans-serif`;
};

export const updateGoogleFontsInDOM = (fontNames: string[]) => {
  const urlsToInject: string[] = [];
  
  // Collect all unique import urls for used fonts
  const uniqueNames = Array.from(new Set(fontNames));
  uniqueNames.forEach(name => {
    const font = SUPPORTED_FONTS.find(f => f.name === name);
    if (font && font.importUrl) {
      urlsToInject.push(font.importUrl);
    }
  });

  // Remove existing dynamically loaded link tags
  const existingLinks = document.querySelectorAll('link.dynamic-google-font');
  existingLinks.forEach(el => el.remove());

  // Insert link tag for each used font
  urlsToInject.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.className = 'dynamic-google-font';
    link.href = url;
    document.head.appendChild(link);
  });
};
