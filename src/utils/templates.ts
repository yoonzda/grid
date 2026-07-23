import { Page, ThemeSettings, Section } from '../types';

// ==========================================
// 1. BUSINESS TEMPLATE (Navy / Slate Gray)
// ==========================================

export const BUSINESS_THEME: ThemeSettings = {
  primaryColor: '#1e3a8a', // Deep Navy
  secondaryColor: '#4b5563', // Slate Gray
  backgroundColor: '#f9fafb', // Light Gray
  textColor: '#1f2937', // Charcoal
  fontFamily: 'Inter',
  defaultFlexGap: 16,
  defaultSectionPadding: 40,
  fontPresets: [
    { id: 'title-1', name: '타이틀 1 (대형)', fontSize: '32px', fontFamily: 'Inter', fontWeight: '700', color: '#1e3a8a' },
    { id: 'title-2', name: '타이틀 2 (중형)', fontSize: '24px', fontFamily: 'Inter', fontWeight: '700', color: '#1e3a8a' },
    { id: 'title-3', name: '타이틀 3 (소형)', fontSize: '18px', fontFamily: 'Inter', fontWeight: '700', color: '#1e3a8a' },
    { id: 'body-1', name: '본문 1 (기본)', fontSize: '14px', fontFamily: 'Inter', fontWeight: '400', color: '#1f2937' },
    { id: 'body-2', name: '본문 2 (상세)', fontSize: '13px', fontFamily: 'Inter', fontWeight: '400', color: '#4b5563' },
    { id: 'menu', name: '네비게이션 메뉴', fontSize: '13px', fontFamily: 'Inter', fontWeight: '500', color: '#cbd5e1' },
    { id: 'button', name: '버튼 텍스트', fontSize: '14px', fontFamily: 'Inter', fontWeight: '600', color: '#ffffff' },
    { id: 'footer', name: '푸터 텍스트', fontSize: '12px', fontFamily: 'Inter', fontWeight: '400', color: '#9ca3af' }
  ]
};

// Common Business Header
const getBusinessHeader = (): Section => ({
  id: 'sec-header',
  height: 70,
  backgroundColor: 'var(--theme-primary)',
  isShared: true,
  sharedType: 'header',
  elements: [],
  headerLayout: 'spread-center',
  headerShowLogo: true,
  headerShowMenu: true,
  headerShowBtn: true,
  
  headerLogoText: 'CORPORATE',
  headerLogoColor: '#ffffff',
  headerLogoSize: '20px',
  headerLogoType: 'text',
  headerLogoWidth: 120,
  
  headerMenuItems: [
    { id: 'm1', name: '메인', fileName: 'index.html' },
    { id: 'm2', name: '소개', fileName: 'introduce.html' },
    { id: 'm3', name: '로그인', fileName: 'login.html' },
    { id: 'm4', name: '마이페이지', fileName: 'mypage.html' },
    { id: 'm5', name: '게시판', fileName: 'board.html' },
    { id: 'm6', name: '약관', fileName: 'terms.html' }
  ],
  headerMenuColor: '#cbd5e1',
  headerMenuSize: '13px',
  
  headerBtnText: '시작하기',
  headerBtnBgColor: 'var(--theme-secondary)',
  headerBtnTextColor: '#ffffff',
  headerBtnRadius: 4,
  headerGap: 40,
  headerMenuGap: 24,
  headerLogoFont: 'Inter',
  headerMenuFont: 'Inter',
  headerBtnFont: 'Inter',
  headerBtnSize: 'medium',
  headerBtnVariant: 'filled',
  headerPaddingY: 16,
});

const getBusinessFooter = (): Section => ({
  id: 'sec-footer',
  height: 180,
  backgroundColor: '#111827', // Dark Gray
  isShared: true,
  sharedType: 'footer',
  heightMode: 'auto',
  footerLayout: 'stacked-center',
  footerCompany: '(주) 코퍼레이트 글로벌  |  CORPORATE Inc.',
  footerAddress: '대표이사: 홍길동  |  사업자등록번호: 123-45-67890  |  주소: 서울특별시 강남구 테헤란로 501  |  고객센터: 1588-0000 (support@corporate.com)',
  footerLinksText: '이용약관   |   개인정보처리방침   |   사업자정보확인   |   고객센터',
  footerCopyright: '© 2026 Corporate Inc. All rights reserved.',
  footerTextColor: '#ffffff',
  footerSubTextColor: '#9ca3af',
  footerTextFont: 'Inter',
  footerPaddingY: 36,
  elements: []
});

export const BUSINESS_TEMPLATE: Page[] = [
  // Page 1: Main (index.html)
  {
    id: 'main',
    name: '메인',
    fileName: 'index.html',
    sections: [
      getBusinessHeader(),
      {
        id: 'sec-main-hero',
        height: 380,
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el-hero-title',
            type: 'title',
            gridX: 2,
            gridW: 8,
            gridY: 1,
            gridH: 2,
            content: '성공적인 비즈니스를 위한 최적의 파트너',
            color: 'var(--theme-primary)',
            fontSize: '32px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-hero-desc',
            type: 'text',
            gridX: 2,
            gridW: 8,
            gridY: 3,
            gridH: 2,
            content: '우리는 기업의 디지털 성장을 가속화하기 위해 통합 브랜딩 가이드와 완벽하게 반응하는 웹 그리드 뼈대 빌더를 제안합니다.',
            color: 'var(--theme-text)',
            fontSize: '14px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-hero-btn',
            type: 'button',
            gridX: 5,
            gridW: 2,
            gridY: 5,
            gridH: 1,
            content: '자세히 보기',
            color: '#ffffff',
            fontSize: '13px',
            fontFamily: 'Inter',
            align: 'center',
            btnBgColor: 'var(--theme-primary)',
            btnTextColor: '#ffffff',
            borderRadius: 4,
          }
        ]
      },
      {
        id: 'sec-main-features',
        height: 320,
        backgroundColor: '#f3f4f6',
        elements: [
          {
            id: 'el-feat-title',
            type: 'title',
            gridX: 4,
            gridW: 4,
            gridY: 0,
            gridH: 1,
            content: '우리의 핵심 경쟁력',
            color: 'var(--theme-primary)',
            fontSize: '22px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-feat-three-column',
            type: 'three-column',
            gridX: 0,
            gridW: 12,
            gridY: 2,
            gridH: 5,
            col1Title: '정교한 반응형 빌더',
            col1Text: '12컬럼 플랙서블 시스템을 도입하여 디바이스에 관계 없이 완벽히 뻗어나갑니다.',
            col1Icon: 'arrow',
            col2Title: '통합 테마 솔루션',
            col2Text: '스타일 가이드를 단 한 번 수정하는 것으로 사이트 내 모든 요소를 갱신합니다.',
            col2Icon: 'link',
            col3Title: '깨끗한 코드 수출',
            col3Text: '압축 해제 후 즉시 배포가 가능한 표준 HTML과 CSS로 패키징하여 내보냅니다.',
            col3Icon: 'home',
            colTitleColor: 'var(--theme-primary)',
            colTitleSize: '16px',
            colTextColor: 'var(--theme-text)',
            colTextSize: '13px',
            colIconColor: 'var(--theme-primary)',
            colShowIconBg: true,
            colIconBgColor: 'rgba(30, 58, 138, 0.08)',
            colGap: 24,
            colContentGap: 12,
            colTitlePresetId: 'title-3',
            colTextPresetId: 'body-2',
            align: 'center',
          }
        ]
      },
      getBusinessFooter()
    ]
  },
  // Page 2: Submain (submain.html)
  {
    id: 'submain',
    name: '소개',
    fileName: 'submain.html',
    sections: [
      getBusinessHeader(),
      {
        id: 'sec-sub-hero',
        height: 280,
        backgroundColor: 'var(--theme-primary)',
        elements: [
          {
            id: 'el-sub-title',
            type: 'title',
            gridX: 2,
            gridW: 8,
            gridY: 1,
            gridH: 2,
            content: '회사 소개',
            color: '#ffffff',
            fontSize: '28px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-sub-desc',
            type: 'text',
            gridX: 2,
            gridW: 8,
            gridY: 3,
            gridH: 1,
            content: '신뢰와 기술을 바탕으로 최고의 파트너가 되겠습니다.',
            color: '#93c5fd',
            fontSize: '14px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          }
        ]
      },
      {
        id: 'sec-sub-body',
        height: 320,
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el-body-title',
            type: 'title',
            gridX: 1,
            gridW: 4,
            gridY: 1,
            gridH: 1,
            content: '우리의 걸어온 길',
            color: 'var(--theme-primary)',
            fontSize: '20px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-body-text1',
            type: 'text',
            gridX: 1,
            gridW: 4,
            gridY: 2,
            gridH: 3,
            content: '2020년 창사 이래로 저희는 500개 이상의 파트너 기업의 마이그레이션과 디지털 전환을 조력하며 업계 최고 수준의 기획력을 인정받았습니다.',
            color: 'var(--theme-text)',
            fontSize: '12px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-body-img',
            type: 'image',
            gridX: 6,
            gridW: 5,
            gridY: 1,
            gridH: 5,
            src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
            borderRadius: 6,
            content: '',
            color: '',
            fontSize: '',
            fontFamily: '',
            align: 'left',
          }
        ]
      },
      getBusinessFooter()
    ]
  },
  // Page 3: Login (login.html)
  {
    id: 'login',
    name: '로그인',
    fileName: 'login.html',
    sections: [
      getBusinessHeader(),
      {
        id: 'sec-login-body',
        height: 420,
        backgroundColor: '#f3f4f6',
        elements: [
          {
            id: 'el-login-title',
            type: 'title',
            gridX: 4,
            gridW: 4,
            gridY: 1,
            gridH: 1,
            content: '비즈니스 센터 로그인',
            color: 'var(--theme-primary)',
            fontSize: '22px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-login-input1',
            type: 'button',
            gridX: 4,
            gridW: 4,
            gridY: 3,
            gridH: 1,
            content: '아이디 (이메일 주소)',
            color: '#9ca3af',
            fontSize: '12px',
            fontFamily: 'Inter',
            align: 'left',
            btnBgColor: '#ffffff',
            btnTextColor: '#9ca3af',
            borderRadius: 4,
          },
          {
            id: 'el-login-input2',
            type: 'button',
            gridX: 4,
            gridW: 4,
            gridY: 4,
            gridH: 1,
            content: '비밀번호 입력',
            color: '#9ca3af',
            fontSize: '12px',
            fontFamily: 'Inter',
            align: 'left',
            btnBgColor: '#ffffff',
            btnTextColor: '#9ca3af',
            borderRadius: 4,
          },
          {
            id: 'el-login-submit',
            type: 'button',
            gridX: 4,
            gridW: 4,
            gridY: 5,
            gridH: 1,
            content: '로그인',
            color: '#ffffff',
            fontSize: '13px',
            fontFamily: 'Inter',
            align: 'center',
            btnBgColor: 'var(--theme-primary)',
            btnTextColor: '#ffffff',
            borderRadius: 4,
          }
        ]
      },
      getBusinessFooter()
    ]
  },
  // Page 4: My Page (mypage.html)
  {
    id: 'mypage',
    name: '마이페이지',
    fileName: 'mypage.html',
    sections: [
      getBusinessHeader(),
      {
        id: 'sec-mypage-hero',
        height: 150,
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el-my-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: '마이페이지',
            color: 'var(--theme-primary)',
            fontSize: '24px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'fit-content',
          },
          {
            id: 'el-my-sub',
            type: 'text',
            gridX: 1,
            gridW: 10,
            gridY: 2,
            gridH: 1,
            content: '가입된 회원님의 고유 정보 및 서비스 신청 이력을 제공합니다.',
            color: 'var(--theme-text)',
            fontSize: '13px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          }
        ]
      },
      {
        id: 'sec-mypage-details',
        height: 300,
        backgroundColor: '#f9fafb',
        elements: [
          {
            id: 'el-details-card1',
            type: 'title',
            gridX: 1,
            gridW: 5,
            gridY: 1,
            gridH: 1,
            content: '내 프로필 정보',
            color: 'var(--theme-primary)',
            fontSize: '16px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-details-text1',
            type: 'text',
            gridX: 1,
            gridW: 5,
            gridY: 2,
            gridH: 3,
            content: '이름: 홍길동 (주식회사 누리아이)\n이메일: admin@nuri-eye.com\n회원등급: 엔터프라이즈 매니저\n가입일: 2026년 7월 6일',
            color: 'var(--theme-text)',
            fontSize: '12px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-details-card2',
            type: 'title',
            gridX: 7,
            gridW: 4,
            gridY: 1,
            gridH: 1,
            content: '신청한 클라우드 서비스',
            color: 'var(--theme-primary)',
            fontSize: '16px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-details-btn1',
            type: 'button',
            gridX: 7,
            gridW: 4,
            gridY: 2,
            gridH: 1,
            content: '웹 빌더 스탠다드 플랜 (사용 중)',
            color: '#047857',
            fontSize: '11px',
            fontFamily: 'Inter',
            align: 'center',
            btnBgColor: '#d1fae5',
            btnTextColor: '#065f46',
            borderRadius: 4,
          }
        ]
      },
      getBusinessFooter()
    ]
  },
  // Page 5: Board (board.html)
  {
    id: 'board',
    name: '게시판',
    fileName: 'board.html',
    sections: [
      getBusinessHeader(),
      {
        id: 'sec-board-list',
        height: 450,
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el-board-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: '고객센터 공지사항',
            color: 'var(--theme-primary)',
            fontSize: '22px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'fit-content',
          },
          {
            id: 'el-board-post1',
            type: 'title',
            gridX: 1,
            gridW: 8,
            gridY: 3,
            gridH: 1,
            content: '[공지] 정기 시스템 리팩토링 및 서버 정검 안내',
            color: '#111827',
            fontSize: '14px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-board-date1',
            type: 'text',
            gridX: 10,
            gridW: 1,
            gridY: 3,
            gridH: 1,
            content: '2026.07.06',
            color: '#9ca3af',
            fontSize: '12px',
            fontFamily: 'Inter',
            align: 'right',
            widthMode: 'stretch',
          },
          {
            id: 'el-board-post2',
            type: 'title',
            gridX: 1,
            gridW: 8,
            gridY: 5,
            gridH: 1,
            content: '[업데이트] 다중 페이지 내보내기 템플릿 지원 패키지 적용',
            color: '#111827',
            fontSize: '14px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-board-date2',
            type: 'text',
            gridX: 10,
            gridW: 1,
            gridY: 5,
            gridH: 1,
            content: '2026.07.06',
            color: '#9ca3af',
            fontSize: '12px',
            fontFamily: 'Inter',
            align: 'right',
            widthMode: 'stretch',
          },
          {
            id: 'el-board-post3',
            type: 'title',
            gridX: 1,
            gridW: 8,
            gridY: 7,
            gridH: 1,
            content: '[FAQ] 내보낸 폴더를 실제 카페24 호스팅에 올리는 방법',
            color: '#111827',
            fontSize: '14px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-board-date3',
            type: 'text',
            gridX: 10,
            gridW: 1,
            gridY: 7,
            gridH: 1,
            content: '2026.07.06',
            color: '#9ca3af',
            fontSize: '12px',
            fontFamily: 'Inter',
            align: 'right',
            widthMode: 'stretch',
          }
        ]
      },
      getBusinessFooter()
    ]
  },
  // Page 6: Terms (terms.html)
  {
    id: 'terms',
    name: '약관',
    fileName: 'terms.html',
    sections: [
      getBusinessHeader(),
      {
        id: 'sec-terms-body',
        height: 450,
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el-terms-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: '이용약관 및 정책 가이드',
            color: 'var(--theme-primary)',
            fontSize: '22px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'fit-content',
          },
          {
            id: 'el-terms-content',
            type: 'text',
            gridX: 1,
            gridW: 10,
            gridY: 3,
            gridH: 6,
            content: '제 1 조 (목적)\n본 약관은 주식회사 누리아이(이하 "회사"라 함)가 제공하는 그리드 사이트 빌더 에디터 서비스의 가이드 시스템 이용에 관한 의무 사항 규정을 목적으로 합니다.\n\n제 2 조 (효력 및 변경)\n1. 본 약관은 서비스 웹사이트 상에 공시함으로써 효력이 발생합니다.\n2. 회사는 타당한 사유가 발생할 경우 본 약관을 임의로 변경할 권리를 가지며, 변경사항은 공지사항에 기재되어 동일하게 고지됩니다.',
            color: 'var(--theme-text)',
            fontSize: '12px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          }
        ]
      },
      getBusinessFooter()
    ]
  },
  // Page 7: SiteMap (siteMap.html)
  {
    id: 'sitemap',
    name: '사이트맵',
    fileName: 'siteMap.html',
    isSystem: true,
    sections: []
  }
];

// ==========================================
// 2. MODERN BRANDING TEMPLATE (Coral / Warm Gray)
// ==========================================

export const MODERN_THEME: ThemeSettings = {
  primaryColor: '#ff6b6b', // Coral
  secondaryColor: '#1f2937', // Jet Black
  backgroundColor: '#faf8f5', // Warm Beige/Warm White
  textColor: '#1f2937', // Charcoal
  fontFamily: 'Outfit',
  defaultFlexGap: 20,
  defaultSectionPadding: 60,
  fontPresets: [
    { id: 'title-1', name: '타이틀 1 (대형)', fontSize: '36px', fontFamily: 'Outfit', fontWeight: '700', color: '#ff6b6b' },
    { id: 'title-2', name: '타이틀 2 (중형)', fontSize: '26px', fontFamily: 'Outfit', fontWeight: '700', color: '#ff6b6b' },
    { id: 'title-3', name: '타이틀 3 (소형)', fontSize: '19px', fontFamily: 'Outfit', fontWeight: '700', color: '#ff6b6b' },
    { id: 'body-1', name: '본문 1 (기본)', fontSize: '15px', fontFamily: 'Outfit', fontWeight: '400', color: '#1f2937' },
    { id: 'body-2', name: '본문 2 (상세)', fontSize: '13px', fontFamily: 'Outfit', fontWeight: '400', color: '#4b5563' },
    { id: 'menu', name: '네비게이션 메뉴', fontSize: '13px', fontFamily: 'Outfit', fontWeight: '500', color: '#cbd5e1' },
    { id: 'button', name: '버튼 텍스트', fontSize: '14px', fontFamily: 'Outfit', fontWeight: '600', color: '#ffffff' },
    { id: 'footer', name: '푸터 텍스트', fontSize: '11px', fontFamily: 'Outfit', fontWeight: '400', color: '#9ca3af' }
  ]
};

// Common Modern Header
const getModernHeader = (): Section => ({
  id: 'sec-header',
  height: 80,
  backgroundColor: 'var(--theme-secondary)',
  isShared: true,
  sharedType: 'header',
  elements: [],
  headerLayout: 'spread-center',
  headerShowLogo: true,
  headerShowMenu: true,
  headerShowBtn: true,
  
  headerLogoText: 'M O D E R N',
  headerLogoColor: 'var(--theme-primary)',
  headerLogoSize: '22px',
  headerLogoType: 'text',
  headerLogoWidth: 120,
  
  headerMenuItems: [
    { id: 'm1', name: '홈', fileName: 'index.html' },
    { id: 'm2', name: '브랜드', fileName: 'introduce.html' },
    { id: 'm3', name: '입장', fileName: 'login.html' },
    { id: 'm4', name: '마이룸', fileName: 'mypage.html' },
    { id: 'm5', name: '저널', fileName: 'board.html' },
    { id: 'm6', name: '서약', fileName: 'terms.html' }
  ],
  headerMenuColor: '#e5e7eb',
  headerMenuSize: '13px',
  
  headerBtnText: '컨택트',
  headerBtnBgColor: 'var(--theme-secondary)',
  headerBtnTextColor: '#ffffff',
  headerBtnRadius: 20,
  headerGap: 40,
  headerMenuGap: 24,
  headerLogoFont: 'Outfit',
  headerMenuFont: 'Outfit',
  headerBtnFont: 'Outfit',
  headerBtnSize: 'medium',
  headerBtnVariant: 'filled',
  headerPaddingY: 16,
});

// Common Modern Footer
const getModernFooter = (): Section => ({
  id: 'sec-footer',
  height: 180,
  backgroundColor: '#18181b', // Zinc Dark
  isShared: true,
  sharedType: 'footer',
  heightMode: 'auto',
  footerLayout: 'split-between',
  footerCompany: 'M O D E R N  S T U D I O',
  footerAddress: 'CEO: Yoon ZDA  |  Reg.No: 987-65-43210  |  Studio: Seoul, Gangnam-gu, Dosan-daero 88  |  Contact: hello@modernstudio.design',
  footerLinksText: 'Terms of Service   /   Privacy Policy   /   Brand Guidelines',
  footerCopyright: '© 2026 MODERN STUDIO. All rights reserved.',
  footerTextColor: '#ffffff',
  footerSubTextColor: '#a1a1aa',
  footerTextFont: 'Outfit',
  footerPaddingY: 36,
  elements: []
});

export const MODERN_TEMPLATE: Page[] = [
  // Page 1: Main (index.html)
  {
    id: 'main',
    name: '홈',
    fileName: 'index.html',
    sections: [
      getModernHeader(),
      {
        id: 'sec-modern-hero',
        height: 420,
        backgroundColor: '#faf8f5',
        elements: [
          {
            id: 'el-hero-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 2,
            content: '우리는 평범함을 거부합니다.',
            color: 'var(--theme-secondary)',
            fontSize: '38px',
            fontFamily: 'Outfit',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-hero-desc',
            type: 'text',
            gridX: 2,
            gridW: 8,
            gridY: 3,
            gridH: 2,
            content: '모던 브랜딩 템플릿은 모던 에이전시 특유의 세련된 강렬한 타이포그래피와 코랄 포인트 컬러로 시선을 모으는 차세대 레이아웃 가이드를 구축합니다.',
            color: 'var(--theme-text)',
            fontSize: '14px',
            fontFamily: 'Outfit',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-hero-btn',
            type: 'button',
            gridX: 5,
            gridW: 2,
            gridY: 5,
            gridH: 1,
            content: '디자인 보기',
            color: '#ffffff',
            fontSize: '13px',
            fontFamily: 'Outfit',
            align: 'center',
            btnBgColor: 'var(--theme-primary)',
            btnTextColor: '#ffffff',
            borderRadius: 20,
          }
        ]
      },
      {
        id: 'sec-modern-showcase',
        height: 380,
        backgroundColor: 'var(--theme-secondary)',
        elements: [
          {
            id: 'el-showcase-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: 'C R E A T I V E  W O R K S',
            color: 'var(--theme-primary)',
            fontSize: '18px',
            fontFamily: 'Outfit',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-showcase-img1',
            type: 'image',
            gridX: 1,
            gridW: 5,
            gridY: 2,
            gridH: 5,
            src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600',
            borderRadius: 0,
            content: '',
            color: '',
            fontSize: '',
            fontFamily: '',
            align: 'left',
          },
          {
            id: 'el-showcase-img2',
            type: 'image',
            gridX: 6,
            gridW: 5,
            gridY: 2,
            gridH: 5,
            src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600',
            borderRadius: 0,
            content: '',
            color: '',
            fontSize: '',
            fontFamily: '',
            align: 'left',
          }
        ]
      },
      getModernFooter()
    ]
  },
  // Page 2: Submain (submain.html)
  {
    id: 'submain',
    name: '브랜드',
    fileName: 'submain.html',
    sections: [
      getModernHeader(),
      {
        id: 'sec-sub-hero',
        height: 300,
        backgroundColor: 'var(--theme-primary)',
        elements: [
          {
            id: 'el-sub-title',
            type: 'title',
            gridX: 2,
            gridW: 8,
            gridY: 1,
            gridH: 2,
            content: '브랜드 철학',
            color: 'var(--theme-secondary)',
            fontSize: '32px',
            fontFamily: 'Outfit',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-sub-desc',
            type: 'text',
            gridX: 2,
            gridW: 8,
            gridY: 3,
            gridH: 1,
            content: '우리는 감각적인 비주얼과 단순한 레이아웃을 통해 브랜드의 감성을 실현합니다.',
            color: '#ffffff',
            fontSize: '14px',
            fontFamily: 'Outfit',
            align: 'center',
            widthMode: 'stretch',
          }
        ]
      },
      {
        id: 'sec-sub-body',
        height: 300,
        backgroundColor: '#faf8f5',
        elements: [
          {
            id: 'el-body-title',
            type: 'title',
            gridX: 6,
            gridW: 5,
            gridY: 1,
            gridH: 1,
            content: '어떻게 디자인하는가',
            color: 'var(--theme-secondary)',
            fontSize: '20px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-body-text1',
            type: 'text',
            gridX: 6,
            gridW: 5,
            gridY: 2,
            gridH: 3,
            content: '디테일에 집중하고 군더더기를 제거하는 것이 모던 스튜디오의 기본 방향입니다. 우리는 강렬한 임팩트 요소를 레이아웃에 균형감 있게 안착시킵니다.',
            color: 'var(--theme-text)',
            fontSize: '13px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-body-img',
            type: 'image',
            gridX: 1,
            gridW: 4,
            gridY: 1,
            gridH: 5,
            src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
            borderRadius: 0,
            content: '',
            color: '',
            fontSize: '',
            fontFamily: '',
            align: 'left',
          }
        ]
      },
      getModernFooter()
    ]
  },
  // Page 3: Login (login.html)
  {
    id: 'login',
    name: '입장',
    fileName: 'login.html',
    sections: [
      getModernHeader(),
      {
        id: 'sec-login-body',
        height: 420,
        backgroundColor: 'var(--theme-secondary)',
        elements: [
          {
            id: 'el-login-title',
            type: 'title',
            gridX: 4,
            gridW: 4,
            gridY: 1,
            gridH: 1,
            content: '게스트 월드 입장',
            color: 'var(--theme-primary)',
            fontSize: '24px',
            fontFamily: 'Outfit',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-login-input1',
            type: 'button',
            gridX: 4,
            gridW: 4,
            gridY: 3,
            gridH: 1,
            content: '코드를 입력하세요',
            color: '#9ca3af',
            fontSize: '12px',
            fontFamily: 'Outfit',
            align: 'center',
            btnBgColor: '#2d3748',
            btnTextColor: '#a0aec0',
            borderRadius: 20,
          },
          {
            id: 'el-login-submit',
            type: 'button',
            gridX: 4,
            gridW: 4,
            gridY: 4,
            gridH: 1,
            content: '입장하기',
            color: '#1f2937',
            fontSize: '13px',
            fontFamily: 'Outfit',
            align: 'center',
            btnBgColor: 'var(--theme-primary)',
            btnTextColor: '#ffffff',
            borderRadius: 20,
          }
        ]
      },
      getModernFooter()
    ]
  },
  // Page 4: My Page (mypage.html)
  {
    id: 'mypage',
    name: '마이룸',
    fileName: 'mypage.html',
    sections: [
      getModernHeader(),
      {
        id: 'sec-mypage-hero',
        height: 150,
        backgroundColor: '#faf8f5',
        elements: [
          {
            id: 'el-my-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: '마이룸 대시보드',
            color: 'var(--theme-primary)',
            fontSize: '24px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'fit-content',
          },
          {
            id: 'el-my-sub',
            type: 'text',
            gridX: 1,
            gridW: 10,
            gridY: 2,
            gridH: 1,
            content: '회원님의 개별 콜렉션과 최근 감상 내역을 보여줍니다.',
            color: 'var(--theme-text)',
            fontSize: '13px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          }
        ]
      },
      {
        id: 'sec-mypage-details',
        height: 280,
        backgroundColor: '#faf8f5',
        elements: [
          {
            id: 'el-details-card1',
            type: 'title',
            gridX: 1,
            gridW: 5,
            gridY: 1,
            gridH: 1,
            content: '프로필 정보',
            color: 'var(--theme-secondary)',
            fontSize: '18px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-details-text1',
            type: 'text',
            gridX: 1,
            gridW: 5,
            gridY: 2,
            gridH: 3,
            content: 'ID: modern_collector\n소속: 크리에이티브 파트너\n등급: VIP 아티스트',
            color: 'var(--theme-text)',
            fontSize: '12px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-details-card2',
            type: 'title',
            gridX: 7,
            gridW: 4,
            gridY: 1,
            gridH: 1,
            content: '참여 프로그램',
            color: 'var(--theme-secondary)',
            fontSize: '18px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-details-btn1',
            type: 'button',
            gridX: 7,
            gridW: 4,
            gridY: 2,
            gridH: 1,
            content: '디지털 전시회 참가 (신청완료)',
            color: '#ffffff',
            fontSize: '11px',
            fontFamily: 'Outfit',
            align: 'center',
            btnBgColor: 'var(--theme-primary)',
            btnTextColor: '#ffffff',
            borderRadius: 20,
          }
        ]
      },
      getModernFooter()
    ]
  },
  // Page 5: Board (board.html)
  {
    id: 'board',
    name: '저널',
    fileName: 'board.html',
    sections: [
      getModernHeader(),
      {
        id: 'sec-board-list',
        height: 450,
        backgroundColor: '#faf8f5',
        elements: [
          {
            id: 'el-board-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: '모던 저널 아카이브',
            color: 'var(--theme-secondary)',
            fontSize: '22px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'fit-content',
          },
          {
            id: 'el-board-post1',
            type: 'title',
            gridX: 1,
            gridW: 8,
            gridY: 3,
            gridH: 1,
            content: '[저널] 미니멀리즘과 공간의 역학 구도 분석',
            color: '#111827',
            fontSize: '14px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-board-date1',
            type: 'text',
            gridX: 10,
            gridW: 1,
            gridY: 3,
            gridH: 1,
            content: '07.06',
            color: 'var(--theme-primary)',
            fontSize: '12px',
            fontFamily: 'Outfit',
            align: 'right',
            widthMode: 'stretch',
          },
          {
            id: 'el-board-post2',
            type: 'title',
            gridX: 1,
            gridW: 8,
            gridY: 5,
            gridH: 1,
            content: '[업데이트] 다크그레이와 오렌지 대조 레이아웃 빌더 배포',
            color: '#111827',
            fontSize: '14px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-board-date2',
            type: 'text',
            gridX: 10,
            gridW: 1,
            gridY: 5,
            gridH: 1,
            content: '07.06',
            color: 'var(--theme-primary)',
            fontSize: '12px',
            fontFamily: 'Outfit',
            align: 'right',
            widthMode: 'stretch',
          }
        ]
      },
      getModernFooter()
    ]
  },
  // Page 6: Terms (terms.html)
  {
    id: 'terms',
    name: '서약',
    fileName: 'terms.html',
    sections: [
      getModernHeader(),
      {
        id: 'sec-terms-body',
        height: 420,
        backgroundColor: '#faf8f5',
        elements: [
          {
            id: 'el-terms-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: '디지털 컬렉터 서약 및 라이선스 동의서',
            color: 'var(--theme-secondary)',
            fontSize: '22px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'fit-content',
          },
          {
            id: 'el-terms-content',
            type: 'text',
            gridX: 1,
            gridW: 10,
            gridY: 3,
            gridH: 5,
            content: '1. 저작권 서약\n모든 모던 스튜디오 컬렉션 이미지는 크리에이티브 커먼즈 저작자표시-비영리-변경금지 라이선스를 준수하며, 상업적 임의 사용은 전면 제재됩니다.\n\n2. 이용 범위 규정\n사용자는 웹페이지 빌더에서 추출된 코드를 개인 포트폴리오 혹은 공인된 브랜드 전시 공간에 삽입 및 재구성하여 배포할 수 있는 권리를 부여받습니다.',
            color: 'var(--theme-text)',
            fontSize: '12px',
            fontFamily: 'Outfit',
            align: 'left',
            widthMode: 'stretch',
          }
        ]
      },
      getModernFooter()
    ]
  },
  {
    id: 'sitemap',
    name: '사이트맵',
    fileName: 'siteMap.html',
    isSystem: true,
    sections: []
  }
];
