// frontend/src/theme/tailwind-theme.js
// Dota 2 theme configuration for Tailwind CSS

export const colors = {
  // Primary Colors
  teal: {
    50: '#e6fbf8',
    100: '#b3f3ec',
    200: '#80ebe0',
    300: '#4de3d4',
    400: '#1adbc8',
    500: '#27ae9e', // Primary teal
    600: '#1f9186',
    700: '#17746e',
    800: '#0f5756',
    900: '#073a3e',
  },
  darkBlue: {
    50: '#e6f2f7',
    100: '#b3d9e8',
    200: '#80c0d9',
    300: '#4da7ca',
    400: '#1a8ebb',
    500: '#244f62', // Primary dark blue
    600: '#1d4152',
    700: '#163342',
    800: '#0f2532',
    900: '#081722',
  },
  purple: {
    50: '#efe9f7',
    100: '#d1c2e8',
    200: '#b39bd9',
    300: '#9574ca',
    400: '#774dbb',
    500: '#48308c', // Primary purple
    600: '#3c2773',
    700: '#301e5a',
    800: '#241541',
    900: '#180c28',
  },
  // Background Colors
  bg: {
    primary: '#121212',
    secondary: '#1a1a1a',
    tertiary: '#2d2d2d',
    card: '#1e1e1e',
    hover: '#333333',
  },
  // Text Colors
  text: {
    primary: '#cce5f8', // Light blue
    secondary: '#b4bcd4', // Secondary text
    muted: '#8892b0',
    accent: '#64ffda',
  },
  // Status Colors
  status: {
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },
};

export const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
};

export const shadows = {
  'dota-glow': '0 0 20px rgba(39, 174, 158, 0.4)',
  'hero-glow': '0 0 20px rgba(72, 48, 140, 0.4)',
  'card-hover': '0 8px 25px rgba(0, 0, 0, 0.3)',
  'elevated': '0 4px 16px rgba(0, 0, 0, 0.2)',
  'mobile-touch': '0 2px 8px rgba(39, 174, 158, 0.2)',
  'mobile-active': '0 1px 4px rgba(39, 174, 158, 0.3)',
};

export const breakpoints = {
  xs: '20em',    // 320px - Small phones
  sm: '30em',    // 480px - Large phones
  md: '48em',    // 768px - Tablets
  lg: '62em',    // 992px - Small laptops
  xl: '80em',    // 1280px - Desktops
  '2xl': '96em', // 1536px - Large screens
};

// CSS-in-JS theme object (can be used with Emotion or styled-components if needed)
export const theme = {
  colors,
  fonts,
  shadows,
  breakpoints,
};