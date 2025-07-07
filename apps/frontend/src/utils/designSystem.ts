// SignalSpot Design System
// Brand Colors: 빨간색 계열 중심의 따뜻하고 활기찬 색상 팔레트

export const DesignSystem = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  colors: {
    // Primary brand colors
    primary: '#FF6B6B', // Warm red - main brand color
    primaryLight: '#FF8787',
    primaryDark: '#EE5A5A',
    
    // Secondary colors
    secondary: '#4ECDC4', // Teal - complementary color
    secondaryLight: '#6DD5CD',
    secondaryDark: '#3EBAB3',
    
    // Semantic colors
    success: '#2ECC71',
    warning: '#F39C12',
    danger: '#E74C3C',
    info: '#3498DB',
    
    // Spot type colors
    spotTypes: {
      social: '#4CAF50',
      help: '#F44336',
      event: '#FF9800',
      info: '#2196F3',
      alert: '#FF5722',
    },
    
    // Background colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F0F2F5',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Text colors
    text: {
      primary: '#1C1E21',
      secondary: '#65676B',
      tertiary: '#8A8D91',
      inverse: '#FFFFFF',
      link: '#FF6B6B',
      placeholder: '#BCC0C4',
    },
    
    // Border colors
    border: {
      light: '#E4E6EB',
      medium: '#CED0D6',
      dark: '#65676B',
      focus: '#FF6B6B',
    },
    
    // Special colors
    spark: {
      gradient: ['#FF6B6B', '#FFA07A'],
      glow: 'rgba(255, 107, 107, 0.3)',
    },
    
    // Holy place (성지) colors
    holyPlace: {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
    },
  },
  typography: {
    largeTitle: {
      fontSize: 34,
      fontWeight: '700' as const,
      lineHeight: 41,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
    },
    title2: {
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 28,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 21,
    },
    subheadline: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    caption1: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    caption2: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 13,
    },
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  shadow: {
    xs: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 1.0,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 2.0,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.12,
      shadowRadius: 4.0,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8.0,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.18,
      shadowRadius: 12.0,
      elevation: 12,
    },
  },
  animation: {
    duration: {
      instant: 0,
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
  layout: {
    maxWidth: 428, // iPhone 14 Pro Max width
    safeAreaInsets: {
      top: 44,
      bottom: 34,
    },
  },
} as const;

// Type helpers
export type Spacing = keyof typeof DesignSystem.spacing;
export type Color = keyof typeof DesignSystem.colors;
export type Typography = keyof typeof DesignSystem.typography;
export type BorderRadius = keyof typeof DesignSystem.borderRadius;
export type Shadow = keyof typeof DesignSystem.shadow;