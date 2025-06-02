// frontend/src/theme/index.js
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// Dota 2 Color Palette
const colors = {
  dota: {
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
  },
};

// Custom theme configuration
const themeConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        ...colors,
        // Override semantic tokens
        'chakra-body-bg': { value: colors.dota.bg.primary },
        'chakra-body-text': { value: colors.dota.text.primary },
        'chakra-border-color': { value: colors.dota.bg.tertiary },
      },
      fonts: {
        heading: { value: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' },
        body: { value: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' },
      },
      breakpoints: {
        xs: { value: '20em' },    // 320px - Small phones
        sm: { value: '30em' },    // 480px - Large phones
        md: { value: '48em' },    // 768px - Tablets
        lg: { value: '62em' },    // 992px - Small laptops
        xl: { value: '80em' },    // 1280px - Desktops
        '2xl': { value: '96em' }, // 1536px - Large screens
      },
      // Mobile-specific spacing
      spacing: {
        'touch': { value: '44px' },    // Minimum touch target size
        'safe-top': { value: 'env(safe-area-inset-top)' },
        'safe-bottom': { value: 'env(safe-area-inset-bottom)' },
        'safe-left': { value: 'env(safe-area-inset-left)' },
        'safe-right': { value: 'env(safe-area-inset-right)' },
      },
      shadows: {
        'dota-glow': { value: '0 0 20px rgba(39, 174, 158, 0.4)' },
        'hero-glow': { value: '0 0 20px rgba(72, 48, 140, 0.4)' },
        'card-hover': { value: '0 8px 25px rgba(0, 0, 0, 0.3)' },
        'elevated': { value: '0 4px 16px rgba(0, 0, 0, 0.2)' },
        'mobile-touch': { value: '0 2px 8px rgba(39, 174, 158, 0.2)' },
        'mobile-active': { value: '0 1px 4px rgba(39, 174, 158, 0.3)' },
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-text': { value: colors.dota.text.primary },
        'chakra-body-bg': { value: colors.dota.bg.primary },
        'chakra-border-color': { value: colors.dota.bg.tertiary },
        'chakra-inverse-text': { value: colors.dota.bg.primary },
        'chakra-subtle-bg': { value: colors.dota.bg.secondary },
        'chakra-subtle-text': { value: colors.dota.text.muted },
      },
    },
    recipes: {
      button: {
        base: {
          fontWeight: 'semibold',
          borderRadius: 'md',
          transition: 'all 0.2s ease-in-out',
          minHeight: { base: 'touch', md: 'auto' }, // 44px minimum on mobile
          minWidth: { base: 'touch', md: 'auto' },
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
        },
        variants: {
          variant: {
            solid: {
              bg: 'dota.teal.500',
              color: 'white',
              _hover: {
                bg: 'dota.teal.600',
                transform: { base: 'scale(1.02)', md: 'translateY(-1px)' },
                boxShadow: { base: 'mobile-touch', md: 'dota-glow' },
              },
              _active: {
                bg: 'dota.teal.700',
                transform: { base: 'scale(0.98)', md: 'translateY(0)' },
                boxShadow: 'mobile-active',
              },
            },
            outline: {
              borderColor: 'dota.teal.500',
              color: 'dota.teal.500',
              _hover: {
                bg: 'dota.teal.500',
                color: 'white',
                transform: 'translateY(-1px)',
              },
            },
            ghost: {
              color: 'dota.text.primary',
              _hover: {
                bg: 'dota.bg.hover',
                color: 'dota.teal.500',
              },
            },
            primary: {
              bg: 'dota.purple.500',
              color: 'white',
              _hover: {
                bg: 'dota.purple.600',
                transform: 'translateY(-1px)',
                boxShadow: 'hero-glow',
              },
            },
            secondary: {
              bg: 'dota.darkBlue.500',
              color: 'white',
              _hover: {
                bg: 'dota.darkBlue.600',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(36, 79, 98, 0.4)',
              },
            },
          },
        },
        defaultVariants: {
          variant: 'solid',
        },
      },
    },
    globalCss: {
      html: {
        // Prevent zoom on double tap
        touchAction: 'manipulation',
      },
      body: {
        bg: 'dota.bg.primary',
        color: 'dota.text.primary',
        fontSize: { base: 'sm', md: 'md' },
        lineHeight: 'base',
        // Safe area support for iOS
        paddingTop: 'safe-top',
        paddingBottom: 'safe-bottom',
        paddingLeft: 'safe-left',
        paddingRight: 'safe-right',
        // Hardware acceleration
        transform: 'translateZ(0)',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '*::placeholder': {
        color: 'dota.text.muted',
      },
      '*, *::before, &::after': {
        borderColor: 'dota.bg.tertiary',
      },
      // Touch-specific styles
      '.touch-target': {
        minHeight: 'touch',
        minWidth: 'touch',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      // Smooth scrolling
      '*': {
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
      },
      // Remove default mobile styles
      'input, textarea, select': {
        WebkitAppearance: 'none',
        borderRadius: 'md',
      },
    },
  },
});

// Create the system
const system = createSystem(defaultConfig, themeConfig);

export default system;