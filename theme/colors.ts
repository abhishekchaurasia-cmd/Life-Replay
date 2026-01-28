// Life Replay - "Soft Cyber Memory" Theme
// A calm, futuristic, emotional dark-mode design system

export const colors = {
  // Base colors
  background: '#0D0D0F',       // Deep charcoal / midnight black
  surface: '#1A1A1F',          // Card background
  surfaceLight: '#252530',     // Lighter surface for hover states
  
  // Text colors
  text: '#F5F5F7',             // Soft off-white (primary text)
  textSecondary: '#8A8A8E',    // Muted text
  textMuted: '#5A5A5E',        // Very muted text
  
  // Accent colors
  accent: '#B794F4',           // Neon lavender (primary accent)
  accentLight: '#C9B1FF',      // Light lavender
  accentGlow: 'rgba(183, 148, 244, 0.3)',
  accentSoft: 'rgba(183, 148, 244, 0.1)',
  
  // Mood colors
  moods: {
    happy: '#FFD93D',      // Sunny yellow
    calm: '#6BCB77',       // Gentle green
    tired: '#4D96FF',      // Soft blue
    anxious: '#FF6B6B',    // Soft coral
    focused: '#C9B1FF',    // Light lavender
    neutral: '#8A8A8E',    // Gray
    excited: '#FF9F43',    // Warm orange
  },
  
  // Section gradients for time of day
  gradients: {
    morning: ['#1a1a2e', '#2d2d44', '#16213e'],
    afternoon: ['#1a1a2e', '#1f1f3a', '#252540'],
    evening: ['#0d0d0f', '#151520', '#1a1a2e'],
    night: ['#0a0a0c', '#0d0d0f', '#111115'],
  },
  
  // Glass effect colors
  glass: {
    background: 'rgba(26, 26, 31, 0.7)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.12)',
  },
  
  // Status/feedback colors
  success: '#6BCB77',
  warning: '#FFD93D',
  error: '#FF6B6B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Font families - Space Grotesk style
  fontFamily: {
    regular: 'SpaceMono',
    // We'll use system fonts for now, can add custom fonts later
  },
  
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    display: 48,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animations,
};
