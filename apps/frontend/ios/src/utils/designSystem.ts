export const DesignSystem = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  colors: {
    primary: '#007AFF',
    background: {
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
    },
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
    },
  },
  typography: {
    largeTitle: {
      fontSize: 34,
      fontWeight: '700' as const,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700' as const,
    },
    title2: {
      fontSize: 22,
      fontWeight: '700' as const,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    subheadline: {
      fontSize: 15,
      fontWeight: '400' as const,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400' as const,
    },
    caption1: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
    caption2: {
      fontSize: 11,
      fontWeight: '400' as const,
    },
  },
} as const;