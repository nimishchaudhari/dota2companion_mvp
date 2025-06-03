// frontend/tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Dota 2 color palette
      colors: {
        // Primary Colors
        dota: {
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
      },
      // Custom shadows
      boxShadow: {
        'dota-glow': '0 0 20px rgba(39, 174, 158, 0.4)',
        'hero-glow': '0 0 20px rgba(72, 48, 140, 0.4)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.3)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'mobile-touch': '0 2px 8px rgba(39, 174, 158, 0.2)',
        'mobile-active': '0 1px 4px rgba(39, 174, 158, 0.3)',
        'item-glow': '0 0 20px rgba(251, 191, 36, 0.4)',
      },
      // Custom gradients
      backgroundImage: {
        'card-gradient': 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(26, 26, 26, 0.95) 50%, rgba(45, 45, 45, 0.9) 100%)',
        'hero-gradient': 'linear-gradient(90deg, transparent, rgba(39, 174, 158, 0.6), transparent)',
      },
      // Typography
      fontFamily: {
        'sans': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
  important: false,
  corePlugins: {
    preflight: true, // Enable preflight now that we're removing Chakra
  },
}