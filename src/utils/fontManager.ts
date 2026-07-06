export interface FontInfo {
  name: string;
  family: string;
  isKorean: boolean;
  importUrl: string;
}

export const SUPPORTED_FONTS: FontInfo[] = [
  // Korean-supporting Google Fonts
  {
    name: '본고딕 (Noto Sans KR)',
    family: "'Noto Sans KR', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap'
  },
  {
    name: '나눔고딕 (Nanum Gothic)',
    family: "'Nanum Gothic', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap'
  },
  {
    name: '고운돋움 (Gowun Dodum)',
    family: "'Gowun Dodum', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap'
  },
  {
    name: '고운바탕 (Gowun Batang)',
    family: "'Gowun Batang', serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap'
  },
  {
    name: '검은고딕 (Black Han Sans)',
    family: "'Black Han Sans', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap'
  },
  {
    name: 'IBM Plex Sans KR',
    family: "'IBM Plex Sans KR', sans-serif",
    isKorean: true,
    importUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&display=swap'
  },
  
  // English-only Google Fonts
  {
    name: 'Inter',
    family: "'Inter', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  },
  {
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
  },
  {
    name: 'Roboto',
    family: "'Roboto', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
  },
  {
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap'
  },
  {
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    isKorean: false,
    importUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap'
  }
];

export const getFontFamilyByFamilyName = (familyName: string): string => {
  const font = SUPPORTED_FONTS.find(f => f.name === familyName || f.family.includes(familyName));
  return font ? font.family : "'Inter', sans-serif";
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
