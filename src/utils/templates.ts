import { Page, ThemeSettings, Section, SpacingPreset } from '../types';

export const DEFAULT_SPACING_PRESETS: SpacingPreset[] = [
  { id: 'space-xs', name: 'XS (8px)', value: 8, description: '최소 간격' },
  { id: 'space-sm', name: 'S (12px)', value: 12, description: '소형 간격' },
  { id: 'space-md', name: 'M (16px)', value: 16, description: '중형 (타이틀 하단 여백)' },
  { id: 'space-lg', name: 'L (20px)', value: 20, description: '대형 간격' },
  { id: 'space-xl', name: 'XL (28px)', value: 28, description: '특대형 (설명 문구 하단 여백)' },
  { id: 'space-2xl', name: 'XXL (48px)', value: 48, description: '최대 간격' },
];

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
  spacingPresets: DEFAULT_SPACING_PRESETS,
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
  guidelineWidth: '80%',
  headerLayout: 'spread-center',
  headerShowLogo: true,
  headerShowMenu: true,
  headerShowBtn: true,
  headerTransparentAtTop: true,
  headerScrollBgColor: '#1e3a8a',
  headerIsFixed: true,
  
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
  backgroundColor: '#f8fafc', // Clean cool slate background
  isShared: true,
  sharedType: 'footer',
  heightMode: 'auto',
  guidelineWidth: '80%',
  footerLayout: 'left-corporate',
  footerCompany: '(주) 코퍼레이트',
  footerRepresentative: '홍길동',
  footerAddress: '서울특별시 강남구 테헤란로 501, 15층 (삼성동, 코퍼레이트타워)',
  footerTel: '1588-0000',
  footerBizNum: '123-45-67890',
  footerLinksText: '개인정보처리방침   이용약관',
  footerCopyright: 'Copyright © Corporate Inc. All rights reserved.',
  footerTextColor: '#0f172a',
  footerSubTextColor: '#475569',
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
        id: 'sec-main-slide',
        sectionPresetType: 'main-slide',
        sectionTitle: '메인 슬라이드',
        height: 100,
        heightMode: 'fixed',
        heightUnit: 'dvh',
        minHeight: 680,
        slideEffectType: 'zoom',
        activeSlideIndex: 0,
        autoPlay: true,
        autoPlayInterval: 4000,
        loop: true,
        enableDrag: true,
        backgroundColor: '#0f172a',
        elements: [],
        slideItems: [
          {
            id: 'slide-v1',
            title: 'Experience Next-Gen Innovation',
            description: '미래형 디지털 기술과 생동감 넘치는 인터랙티브 미디어 환경을 경험하세요.',
            mediaType: 'video',
            videoSrc: 'https://vjs.zencdn.net/v/oceans.mp4',
            videoName: 'sample1_ocean.mp4',
            imageSrc: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1600&auto=format&fit=crop&q=80',
            imageName: 'example1.jpg',
            btnText: '자세히 보기',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          },
          {
            id: 'slide-1',
            title: 'Innovate for Tomorrow',
            description: '새로운 기획으로 디지털 혁신을 주도하며 글로벌 비즈니스의 성장 가치를 극대화합니다.',
            imageSrc: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1600&auto=format&fit=crop&q=80',
            imageName: 'example1.jpg',
            btnText: '자세히 보기',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          },
          {
            id: 'slide-2',
            title: 'Drive Digital Transformation',
            description: '최고의 전문가 그룹과 함께 기업 특화 스마트 디지털 에코시스템을 구축하세요.',
            imageSrc: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80',
            imageName: 'example2.jpg',
            btnText: '서비스 둘러보기',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          }
        ]
      },
      {
        id: 'sec-features-grid',
        sectionPresetType: 'features-grid',
        sectionTitle: '주요 특징 (바둑판)',
        height: 800,
        heightMode: 'auto',
        minHeight: 750,
        backgroundColor: '#ffffff',
        elements: [],
        featureItems: [
          {
            id: 'feat-1',
            title: 'Innovation 혁신',
            description: '혁신적인 아이디어와 차별화된 기술력으로 기업의 디지털 전환을 주도하며 브랜드 가치를 선도합니다.',
            imageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
            btnText: '자세히 보기 >',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          },
          {
            id: 'feat-2',
            title: 'Sustainability 지속가능성',
            description: '지속 가능한 성장 체계를 구축하고, 환경과 사회적 책임을 다하는 혁신적인 솔루션을 제안합니다.',
            imageSrc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
            btnText: '자세히 보기 >',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          },
          {
            id: 'feat-3',
            title: 'Targeting 타겟팅',
            description: '데이터 기반의 정확한 시장 분석을 통해 고객의 니즈를 정밀하게 타겟팅하고 성과를 극대화합니다.',
            imageSrc: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
            btnText: '자세히 보기 >',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          }
        ]
      },
      {
        id: 'sec-promo-banner',
        sectionPresetType: 'promo-banner',
        sectionTitle: '고정 배경 배너',
        height: 360,
        heightMode: 'fixed',
        backgroundColor: '#0b192c',
        backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        elements: [],
        sectionSubTitle: 'Competitive Advantage',
        sectionTitle: '지속 가능한 성장과 함께하는 혁신, 우리는 미래를 준비합니다.',
        ctaBtnText: '자세히 보기 >',
        ctaLinkType: 'url',
        ctaLinkUrl: '#',
        ctaLinkTarget: '_self'
      },
      {
        id: 'sec-card-slider',
        sectionPresetType: 'card-slider',
        sectionTitle: '카드 슬라이드',
        sectionSubTitle: 'Our Latest News',
        height: 480,
        heightMode: 'auto',
        minHeight: 460,
        backgroundColor: '#f8fafc',
        elements: [],
        cardItems: [
          {
            id: 'card-1',
            tag: 'NEWS',
            title: '홈페이지를 오픈하였습니다.',
            date: '2026-07-27',
            description: '새로운 브랜딩 가이드와 디지털 서비스를 탑재한 신규 웹사이트를 오픈했습니다.',
            imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          },
          {
            id: 'card-2',
            tag: 'NEWS',
            title: '자사 사업 영역을 확장하여 투자를 추진합니다.',
            date: '2026-07-27',
            description: '클라우드 플랫폼 및 스마트 웹 인프라 생태계 확장을 위해 적극적인 신규 투자를 진행합니다.',
            imageSrc: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          },
          {
            id: 'card-3',
            tag: 'NEWS',
            title: '4분기 매출 및 성과 안내',
            date: '2026-07-27',
            description: '전분기 대비 35% 성장하며 역대 최고 실적을 달성하였습니다.',
            imageSrc: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          },
          {
            id: 'card-4',
            tag: 'EVENT',
            title: '신규 비즈니스 파트너십 협약 체결',
            date: '2026-07-20',
            description: '글로벌 테크 기업과의 공동 연구 개발 및 전략적 기술 제휴를 체결하였습니다.',
            imageSrc: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
          },
          {
            id: 'card-5',
            tag: 'NOTICE',
            title: '글로벌 시장 진출 전략 세미나 개최',
            date: '2026-07-15',
            description: '해외 시장 개척 및 전략적 마케팅 노하우를 공유하는 컨퍼런스를 개최합니다.',
            imageSrc: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80',
            linkType: 'url',
            linkUrl: '#',
            linkTarget: '_self'
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
    name: '이용약관',
    fileName: 'terms.html',
    sections: [
      getBusinessHeader(),
      {
        id: 'sec-terms-body',
        height: 600,
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el-terms-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: '서비스 이용약관',
            color: 'var(--theme-primary)',
            fontSize: '22px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'fit-content',
          },
          {
            id: 'el-terms-content',
            type: 'legal-doc',
            gridX: 1,
            gridW: 10,
            gridY: 3,
            gridH: 10,
            legalHeaderColor: 'var(--theme-primary)',
            legalNumberColor: 'var(--theme-primary)',
            align: 'left',
            widthMode: 'stretch',
            legalArticles: [
              {
                id: 'art-terms-1',
                title: 'Article 1. Rules and Institution (목적 및 총칙)',
                clauses: [
                  {
                    id: 'c-terms-1-1',
                    num: '1.1',
                    content: '본 약관은 (주) 코퍼레이트(이하 "회사"라 함)가 제공하는 디지털 웹 플랫폼 서비스의 이용조건 및 절차 규정을 목적으로 합니다.',
                  },
                  {
                    id: 'c-terms-1-2',
                    num: '1.2',
                    content: '“중재재판소”라 함은 본 규칙에 따라 구성된 하나 이상의 중재인으로 구성된 중재판정부를 의미합니다.',
                  },
                  {
                    id: 'c-terms-1-3',
                    num: '1.3',
                    content: '사무국은 KCAB International 의 이사회 및 정관 지휘 아래 독립적으로 본 관리 절차 업무를 수행합니다.',
                  }
                ]
              },
              {
                id: 'art-terms-2',
                num: '2.1',
                title: 'Article 2. Scope of Application & Definitions (용어의 정의)',
                content: '본 약관에서 사용하는 용어의 정의는 다음과 같습니다.',
                isOpen: true,
                subItems: [
                  { id: 'sub-terms-2-1', num: 'i.', content: '“서비스”라 함은 회사가 회원에게 제공하는 디지털 웹 플랫폼 및 제반 기능 일체를 말합니다.' },
                  { id: 'sub-terms-2-2', num: 'ii.', content: '“회원”이라 함은 회사의 서비스에 접속하여 본 약관에 동의하고 이용계약을 체결한 고객을 말합니다.' },
                ]
              },
              {
                id: 'art-terms-3',
                num: '3.1',
                title: 'Article 3. Notification & Revision (약관의 개정 및 고지)',
                content: '회사는 관련 법률을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정사유를 명시하여 사전 공지합니다.',
                isOpen: false,
              }
            ]
          }
        ]
      },
      getBusinessFooter()
    ]
  },
  // Page 7: Privacy Policy (privacy.html)
  {
    id: 'privacy',
    name: '개인정보처리방침',
    fileName: 'privacy.html',
    sections: [
      getBusinessHeader(),
      {
        id: 'sec-privacy-body',
        height: 600,
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el-privacy-title',
            type: 'title',
            gridX: 1,
            gridW: 10,
            gridY: 1,
            gridH: 1,
            content: '개인정보 처리방침',
            color: 'var(--theme-primary)',
            fontSize: '22px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'fit-content',
          },
          {
            id: 'el-privacy-content',
            type: 'legal-doc',
            gridX: 1,
            gridW: 10,
            gridY: 3,
            gridH: 10,
            legalHeaderColor: 'var(--theme-primary)',
            legalNumberColor: 'var(--theme-primary)',
            align: 'left',
            widthMode: 'stretch',
            legalArticles: [
              {
                id: 'art-privacy-1',
                num: '1.1',
                title: 'Article 1. Purpose of Processing (수집 및 이용 목적)',
                content: '(주) 코퍼레이트는 회원 식별, 서비스 제공, 고객 문의 응대 및 품질 개선을 위해 최소한의 개인정보를 수집 및 처리합니다.',
                isOpen: true,
              },
              {
                id: 'art-privacy-2',
                num: '2.1',
                title: 'Article 2. Collected Items & Retaining Period (수집 항목 및 보유기간)',
                content: '회사가 수집하는 최소한의 개인정보 항목 및 보유 기간은 다음과 같습니다.',
                isOpen: true,
                subItems: [
                  { id: 'sub-privacy-2-1', num: 'i.', content: '필수 수집항목: 성명, 이메일 주소, 연락처(전화번호), 접속 IP, 서비스 이용 기록' },
                  { id: 'sub-privacy-2-2', num: 'ii.', content: '보유 및 파기: 목적 달성 후 지체 없이 파기하며, 법령에 따른 보존 의무 시 해당 기간 보관' },
                ]
              }
            ]
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
  guidelineWidth: '80%',
  footerLayout: 'left-corporate',
  footerCompany: 'M O D E R N',
  footerRepresentative: '홍길동',
  footerAddress: '서울특별시 강남구 도산대로 88, 3층',
  footerTel: '02-1234-5678',
  footerBizNum: '987-65-43210',
  footerLinksText: '개인정보처리방침   이용약관',
  footerCopyright: 'Copyright © M O D E R N. All rights reserved.',
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
