import { Page, ThemeSettings, Section } from '../types';
import { DEFAULT_SPACING_PRESETS } from './templates';

// ==========================================
// MEDICAL DENTAL CLINIC ONE-PAGE TEMPLATE
// Palette: Warm Gold / Charcoal / Off-White
// ==========================================

export const MEDICAL_THEME: ThemeSettings = {
  // 0. BASE PALETTE & SEMANTIC MAPPINGS
  baseColors: [
    { id: 'base-gold', name: '따뜻한 오렌지골드', hex: '#FBA518' },
    { id: 'base-charcoal', name: '다크 차콜', hex: '#111827' },
    { id: 'base-amber', name: '앰버 골드', hex: '#d97706' },
    { id: 'base-cream', name: '연한 크림', hex: '#fffbe6' },
    { id: 'base-white', name: '화이트', hex: '#ffffff' },
    { id: 'base-ivory', name: '아이보리 서브', hex: '#fdfbf7' },
    { id: 'base-slate', name: '슬레이트 그레이', hex: '#4b5563' },
    { id: 'base-border', name: '라이트 테두리', hex: '#e5e7eb' },
  ],
  semanticMappings: {
    primary: 'base-gold',
    secondary: 'base-charcoal',
    accent: 'base-amber',
    brandLight: 'base-cream',
    backgroundColor: 'base-white',
    surfaceColor: 'base-ivory',
    darkBgColor: 'base-charcoal',
    textColor: 'base-charcoal',
    subtextColor: 'base-slate',
    borderColor: 'base-border',
  },

  // 1. BRAND COLOR MODULE
  primaryColor: '#FBA518', // Warm Vibrant Gold (#FBA518)
  secondaryColor: '#111827', // Rich Dark Charcoal
  accentColor: '#d97706', // Warm Amber Accent
  brandLightColor: '#fffbe6', // Soft Cream Tint

  // 2. CANVAS & SURFACE MODULE
  backgroundColor: '#ffffff', // Pure White Canvas
  surfaceColor: '#fdfbf7', // Warm Ivory Surface
  surfaceElevatedColor: '#f8fafc',
  darkBgColor: '#111827', // Dark Charcoal Background

  // 3. TYPOGRAPHY & CONTENT MODULE
  textColor: '#111827',
  subtextColor: '#4b5563',
  textInverseColor: '#ffffff',

  // 4. BORDER & LINE MODULE
  borderColor: '#e5e7eb',

  fontFamily: '프리텐다드',
  defaultFlexGap: 16,
  defaultSectionPadding: 40,
  spacingPresets: DEFAULT_SPACING_PRESETS,
  fontPresets: [
    { id: 'title-1', name: '타이틀 1 (대형)', fontSize: '32px', fontFamily: '프리텐다드', fontWeight: '700', color: 'var(--theme-primary)' },
    { id: 'title-2', name: '타이틀 2 (중형)', fontSize: '24px', fontFamily: '프리텐다드', fontWeight: '700', color: 'var(--theme-primary)' },
    { id: 'title-3', name: '타이틀 3 (소형)', fontSize: '18px', fontFamily: '프리텐다드', fontWeight: '700', color: 'var(--theme-primary)' },
    { id: 'body-1', name: '본문 1 (기본)', fontSize: '14px', fontFamily: '프리텐다드', fontWeight: '400', color: 'var(--theme-text)' },
    { id: 'body-2', name: '본문 2 (상세)', fontSize: '13px', fontFamily: '프리텐다드', fontWeight: '400', color: 'var(--theme-subtext)' },
    { id: 'menu', name: '네비게이션 메뉴', fontSize: '14px', fontFamily: '프리텐다드', fontWeight: '500', color: 'var(--theme-text-inverse)' },
    { id: 'button', name: '버튼 텍스트', fontSize: '14px', fontFamily: '프리텐다드', fontWeight: '600', color: 'var(--theme-text-inverse)' },
    { id: 'footer', name: '푸터 텍스트', fontSize: '12px', fontFamily: '프리텐다드', fontWeight: '400', color: 'var(--theme-subtext)' }
  ]
};

// Medical Header
export const getMedicalHeader = (): Section => ({
  id: 'sec-header',
  height: 74,
  backgroundColor: 'var(--theme-secondary)',
  isShared: true,
  sharedType: 'header',
  elements: [],
  guidelineWidth: '80%',
  headerLayout: 'spread-between', // 양끝정렬 (로고 좌측, 메뉴 우측)
  headerShowLogo: true,
  headerShowMenu: true,
  headerShowBtn: false, // 우측 버튼 제외
  headerTransparentAtTop: true,
  headerScrollBgColor: 'var(--theme-secondary)',
  headerIsFixed: true,
  
  headerLogoText: '서울마음치과',
  headerLogoColor: '#ffffff',
  headerScrolledLogoColor: '#ffffff',
  headerLogoSize: '22px',
  headerLogoWeight: 400, // Logo font weight 400 (Regular)
  headerLogoType: 'text',
  headerLogoWidth: 140,
  
  headerMenuItems: [
    { id: 'menu-1', name: '서울마음치과', fileName: '#sec-dental-promise' },
    { id: 'menu-2', name: '의료진소개', fileName: '#sec-dental-staff' },
    { id: 'menu-3', name: '진료과목', fileName: '#sec-dental-depts' },
    { id: 'menu-4', name: '둘러보기', fileName: '#sec-dental-gallery' },
    { id: 'menu-5', name: '진료시간/오시는길', fileName: '#sec-dental-location' },
  ],
  headerMenuColor: '#ffffff',
  headerScrolledMenuColor: '#ffffff',
  headerMenuSize: '14.5px',
  headerMenuFont: '프리텐다드',

  headerPaddingYVarId: 'space-md',
  headerGapVarId: 'space-2xl',
  headerMenuGapVarId: 'space-xl',
});

// Medical Footer
export const getMedicalFooter = (): Section => ({
  id: 'sec-footer',
  height: 120,
  backgroundColor: '#0f172a',
  isShared: true,
  sharedType: 'footer',
  elements: [],
  guidelineWidth: '80%',
  footerCompany: '서울마음치과의원',
  footerRepresentative: '홍길동',
  footerAddress: '서울특별시 영등포구 여의대로 108, 5층',
  footerTel: '02-1234-5678',
  footerBizNum: '123-45-67890',
  footerCopyright: 'Copyright © 서울마음치과의원. All rights reserved.',
  footerLinksText: '개인정보처리방침   이용약관   비급여수가안내',
  footerPaddingY: 36,
  footerTextColor: '#f8fafc',
  footerSubTextColor: '#94a3b8',
  footerTextFont: '프리텐다드',
});

// Medical One-Page Template definition
export const MEDICAL_TEMPLATE: Page[] = [
  {
    id: 'main',
    name: '원페이지 메인',
    fileName: 'index.html',
    sections: [
      getMedicalHeader(),

      // Section 1: Hero Main Visual (메인 비주얼 - 스태틱 대표 비주얼 & 3열 안내)
      {
        id: 'sec-main-hero',
        heightMode: 'full',
        heightUnit: 'vh',
        height: 100,
        minHeight: 680,
        paddingTop: 0,
        paddingBottom: 0,
        layoutMode: 'flex',
        flexDirection: 'vertical',
        flexAlign: 'center',
        backgroundColor: '#111827',
        backgroundImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&auto=format&fit=crop&q=80',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        guidelineWidth: '80%',
        showScrollDown: true,
        sectionOverlayType: 'gradient',
        sectionOverlayAngle: 90,
        sectionOverlayColor: '#000000',
        sectionOverlayStartOpacity: 0.88,
        sectionOverlayStartPos: 0,
        sectionOverlayEnableMidStop: true,
        sectionOverlayMidColor: '#000000',
        sectionOverlayMidOpacity: 0.65,
        sectionOverlayMidPos: 50,
        sectionOverlayEndColor: '#000000',
        sectionOverlayEndOpacity: 0,
        sectionOverlayEndPos: 100,
        elements: [
          {
            id: 'el-hero-title',
            type: 'title',
            gridX: 0,
            gridW: 7,
            gridY: 2,
            gridH: 2,
            content: '<span style="display:inline-block; border-left: 6px solid #E58E12; padding-left: 24px; line-height: 1.35; color: #FFFFFF;"><span style="color:#E58E12; border-bottom: 3.5px solid #E58E12; padding-bottom: 3px;">마음</span>을 담은 진료,<br/>오래도록 믿을 수 있는 치과</span>',
            color: '#FFFFFF',
            fontSize: '42px',
            fontFamily: 'Pretendard',
            align: 'left',
            widthMode: 'fit-content',
            marginBottom: 22,
          },
          {
            id: 'el-hero-sub',
            type: 'text',
            gridX: 0,
            gridW: 7,
            gridY: 4,
            gridH: 1,
            content: '환자를 먼저 생각하는 마음, 신뢰로 이어지는 진료를 약속드립니다.',
            color: '#FFFFFF',
            fontSize: '16px',
            fontFamily: 'Pretendard',
            align: 'left',
            widthMode: 'fit-content',
            marginBottom: 64,
          },
          {
            id: 'el-hero-3col',
            type: 'three-column',
            gridX: 0,
            gridW: 9,
            gridY: 7,
            gridH: 3,
            col1Title: '마음을 다하는 진료',
            col1Text: '환자의 입장에서\n먼저 생각합니다.',
            col1Icon: 'heart',
            col2Title: '정직한 진단',
            col2Text: '과잉진료 없이 바른\n진료를 약속합니다.',
            col2Icon: 'shield',
            col3Title: '신뢰를 이어가는 치과',
            col3Text: '오래도록 믿고 찾을 수\n있는 치과가 되겠습니다.',
            col3Icon: 'handshake',
            colTitleColor: '#FFFFFF',
            colTitleSize: '17px',
            colTextColor: '#FFFFFF',
            colTextSize: '13.5px',
            colIconColor: '#E58E12',
            colShowIconBg: false,
            colShowDividers: true,
            colGap: 36,
            colContentGap: 8,
            widthMode: 'fit-content',
          }
        ]
      },

      // Section 2: 진료 약속 (Promises Grid)
      {
        id: 'sec-dental-promise',
        height: 580,
        backgroundColor: '#ffffff',
        sectionPresetType: 'features-grid',
        guidelineWidth: '80%',
        sectionSubTitle: 'SEOUL MIND DENTAL CLINIC',
        sectionTitle: '서울마음치과가 드리는 진료 약속',
        elements: [],
        featureItems: [
          {
            id: 'feat-1',
            title: '01. 정밀 미세현미경 보존 치료',
            description: '살릴 수 있는 자연치아를 절대 포기하지 않고, 정밀 미세현미경 장비로 세심하게 케어하여 소중한 구강 건강을 지킵니다.',
            btnText: '자세히 보기',
            linkUrl: '#sec-dental-depts',
            imageSrc: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80'
          },
          {
            id: 'feat-2',
            title: '02. 철저한 1인 1기구 멸균 소독',
            description: '대학병원 수준의 9단계 멸균 소독 시스템을 가동하며, 모든 치료 기구는 1인 1회 사용 후 완벽 개별 포장 멸균합니다.',
            btnText: '자세히 보기',
            linkUrl: '#sec-dental-gallery',
            imageSrc: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
          },
          {
            id: 'feat-3',
            title: '03. 디지털 3D CT 첨단 정밀진단',
            description: '3D 구강 스캐너와 입체 CT 진단으로 치아 및 턱관절 구조를 과학적으로 분석하여 오차를 최소화합니다.',
            btnText: '자세히 보기',
            linkUrl: '#sec-dental-depts',
            imageSrc: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80'
          }
        ]
      },

      // Section 3: 브랜드 스토리 배너
      {
        id: 'sec-brand-banner',
        height: 320,
        backgroundColor: '#FBA518',
        sectionPresetType: 'promo-banner',
        sectionSubTitle: 'SEOUL MIND DENTAL CLINIC',
        sectionTitle: '함께하는 치과, 서울마음치과\n소중한 치아 건강을 위해 언제나 정성을 다하겠습니다.',
        ctaBtnText: '온라인 상담 / 예약하기',
        ctaLinkUrl: '#sec-dental-location',
        backgroundImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&auto=format&fit=crop&q=80',
        backgroundAttachment: 'fixed',
        elements: [],
      },

      // Section 4: 의료진 소개 (Doctor Profile)
      {
        id: 'sec-dental-staff',
        height: 480,
        backgroundColor: '#fdfbf7',
        guidelineWidth: '80%',
        elements: [
          {
            id: 'el-staff-title',
            type: 'title',
            gridX: 0,
            gridW: 12,
            gridY: 1,
            gridH: 1,
            content: '마음을 더하는 의료진 소개',
            color: 'var(--theme-primary)',
            fontSize: '28px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
            marginBottom: 20
          },
          {
            id: 'el-staff-img',
            type: 'image',
            gridX: 1,
            gridW: 4,
            gridY: 2,
            gridH: 7,
            src: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
            imageName: 'doctor_profile.jpg',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          },
          {
            id: 'el-staff-name',
            type: 'title',
            gridX: 6,
            gridW: 6,
            gridY: 2,
            gridH: 1,
            content: '대표원장 홍길동 (치과전문의)',
            color: '#111827',
            fontSize: '22px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-staff-bio',
            type: 'text',
            gridX: 6,
            gridW: 6,
            gridY: 4,
            gridH: 5,
            content: '· 서울대학교 치과대학 졸업\n· 서울대학교 치과병원 수련 및 전공의\n· 보건복지부 인증 치과전문의 (통합치의학과)\n· 대한치과의사협회 정회원\n· 대한구강악안면임플란트학회 정회원\n· 대한심미치과학회 정회원',
            color: '#4b5563',
            fontSize: '15px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          }
        ]
      },

      // Section 5: 진료 과목 (Departments Grid 4x3)
      {
        id: 'sec-dental-depts',
        height: 480,
        backgroundColor: '#111827',
        guidelineWidth: '80%',
        elements: [
          {
            id: 'el-dept-title',
            type: 'title',
            gridX: 0,
            gridW: 12,
            gridY: 1,
            gridH: 1,
            content: '서울마음치과 진료과목',
            color: '#FBA518',
            fontSize: '28px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-dept-sub',
            type: 'text',
            gridX: 0,
            gridW: 12,
            gridY: 2,
            gridH: 1,
            content: '각 분야별 숙련된 노하우로 최상의 진료 결과를 만들어냅니다.',
            color: '#9ca3af',
            fontSize: '14px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-dept-3col-1',
            type: 'three-column',
            gridX: 0,
            gridW: 12,
            gridY: 4,
            gridH: 3,
            col1Title: '임플란트 센터',
            col1Text: '3D 컴퓨터 분석 네비게이션 임플란트로 무절개 정밀 시술',
            col1Icon: 'home',
            col2Title: '치아교정 센터',
            col2Text: '투명교정, 클리피씨 등 1:1 개인 맞춤 정밀 교정 솔루션',
            col2Icon: 'mail',
            col3Title: '심미보철 / 미백',
            col3Text: '라미네이트, 올세라믹, 원데이 치아미백으로 자연스러운 미소 연출',
            col3Icon: 'link',
            colTitleColor: '#ffffff',
            colTitleSize: '17px',
            colTextColor: '#9ca3af',
            colTextSize: '13px',
            colIconColor: '#FBA518',
            colShowIconBg: true,
            colIconBgColor: '#1f2937',
            colGap: 20,
            colContentGap: 6,
          },
          {
            id: 'el-dept-3col-2',
            type: 'three-column',
            gridX: 0,
            gridW: 12,
            gridY: 7,
            gridH: 3,
            col1Title: '사랑니 발치 / 턱관절',
            col1Text: '고난도 매복 사랑니 당일 안전 발치 및 턱관절 물리치료',
            col1Icon: 'arrow',
            col2Title: '충치 / 신경치료',
            col2Text: '미세현미경을 이용한 자연치아 보존 최우선 신경치료',
            col2Icon: 'phone',
            col3Title: '잇몸치료 / 예방케어',
            col3Text: '스케일링, 잇몸 수술 및 치료 후 스위스 1:1 예방 케어',
            col3Icon: 'home',
            colTitleColor: '#ffffff',
            colTitleSize: '17px',
            colTextColor: '#9ca3af',
            colTextSize: '13px',
            colIconColor: '#FBA518',
            colShowIconBg: true,
            colIconBgColor: '#1f2937',
            colGap: 20,
            colContentGap: 6,
          }
        ]
      },

      // Section 6: 시설 안내 / 갤러리 (Clinic Interior)
      {
        id: 'sec-dental-gallery',
        height: 520,
        backgroundColor: '#ffffff',
        sectionPresetType: 'card-slider',
        sectionSubTitle: 'CLINIC INTERIOR',
        elements: [],
        cardItems: [
          {
            id: 'card-1',
            title: '안심 멸균 진료실',
            description: '독립된 개별 1인 진료실에서 쾌적하고 위생적인 케어를 제공합니다.',
            tag: 'FACILITY 01',
            date: 'SEOUL MIND',
            imageSrc: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&auto=format&fit=crop&q=80'
          },
          {
            id: 'card-2',
            title: '3D 첨단 정밀진단실',
            description: '3D 입체 CT와 구강스캐너로 과학적인 정밀 진단 데이터를 확보합니다.',
            tag: 'FACILITY 02',
            date: 'SEOUL MIND',
            imageSrc: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80'
          },
          {
            id: 'card-3',
            title: '편안한 로비 & 라운지',
            description: '대기 시간도 안락하게 쉬어가실 수 있는 고급스러운 대기 라운지',
            tag: 'FACILITY 03',
            date: 'SEOUL MIND',
            imageSrc: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80'
          }
        ]
      },

      // Section 7: 진료안내 / 오시는 길 (Location & Hours)
      {
        id: 'sec-dental-location',
        height: 500,
        backgroundColor: '#fdfbf7',
        guidelineWidth: '80%',
        elements: [
          {
            id: 'el-loc-title',
            type: 'title',
            gridX: 0,
            gridW: 12,
            gridY: 1,
            gridH: 1,
            content: '진료안내 / 오시는길',
            color: 'var(--theme-primary)',
            fontSize: '28px',
            fontFamily: 'Inter',
            align: 'center',
            widthMode: 'stretch',
          },
          {
            id: 'el-loc-hours',
            type: 'text',
            gridX: 0,
            gridW: 6,
            gridY: 3,
            gridH: 6,
            content: '⏰ 진료 시간 안내\n\n· 평   일 : 09:30 - 18:30\n· 야간진료(화/목) : 09:30 - 20:30 (화/목 야간진료)\n· 토 요 일 : 09:30 - 14:00 (점심시간 없이 연속진료)\n· 점심시간 : 13:00 - 14:00\n※ 일요일 및 공휴일은 휴무입니다.\n\n📍 위치 : 서울특별시 영등포구 여의대로 108 (여의도동)',
            color: '#1f2937',
            fontSize: '14.5px',
            fontFamily: 'Inter',
            align: 'left',
            widthMode: 'stretch',
          },
          {
            id: 'el-loc-callbtn',
            type: 'button',
            gridX: 0,
            gridW: 5,
            gridY: 9,
            gridH: 2,
            content: '📞 대표전화 02-1234-5678',
            btnBgColor: '#FBA518',
            btnTextColor: '#ffffff',
            iconType: 'phone',
            iconPosition: 'before',
            widthMode: 'stretch',
            btnSize: 'large',
            btnVariant: 'filled',
            marginBottom: 0,
            linkType: 'url',
            linkUrl: 'tel:02-1234-5678'
          },
          {
            id: 'el-loc-map',
            type: 'image',
            gridX: 6,
            gridW: 6,
            gridY: 3,
            gridH: 8,
            src: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80',
            imageName: 'dental_map.jpg',
            borderRadius: 12,
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
          }
        ]
      },

      getMedicalFooter()
    ]
  }
];
