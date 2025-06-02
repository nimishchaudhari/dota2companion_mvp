// frontend/src/theme/theme-lite.js
// Optimized theme with only essential configurations
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// Essential Dota 2 Colors only
const colors = {
  dota: {
    teal: {
      500: '#27ae9e',
      600: '#1f9186',
      700: '#17746e',
    },
    darkBlue: {
      500: '#244f62',
      600: '#1d4152',
    },
    purple: {
      500: '#48308c',
      600: '#3c2773',
    },
    bg: {
      primary: '#121212',
      secondary: '#1a1a1a',
      tertiary: '#2d2d2d',
      card: '#1e1e1e',
      hover: '#333333',
    },
    text: {
      primary: '#cce5f8',
      secondary: '#b4bcd4',
      muted: '#8892b0',
      accent: '#64ffda',
    },
    status: {
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
  },
};

// Minimal theme configuration
const themeConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        ...colors,
        'chakra-body-bg': { value: colors.dota.bg.primary },
        'chakra-body-text': { value: colors.dota.text.primary },
        'chakra-border-color': { value: colors.dota.bg.tertiary },
      },
      fonts: {
        heading: { value: '"Inter", system-ui, sans-serif' },
        body: { value: '"Inter", system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-text': { value: colors.dota.text.primary },
        'chakra-body-bg': { value: colors.dota.bg.primary },
        'chakra-border-color': { value: colors.dota.bg.tertiary },
      },
    },
    globalCss: {
      body: {
        bg: 'dota.bg.primary',
        color: 'dota.text.primary',
        WebkitFontSmoothing: 'antialiased',
      },
    },
  },
});

// Create the system
const system = createSystem(defaultConfig, themeConfig);

export default system;