import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.opendota\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'opendota-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.cloudflare\.steamstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'steam-assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  // TypeScript path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/theme': path.resolve(__dirname, './src/theme'),
      '@/types': path.resolve(__dirname, './src/types')
    }
  },
  // GitHub Pages base path configuration
  // In production, set base to repository name for GitHub Pages deployment
  // In development, use root path for local development
  base: process.env.NODE_ENV === 'production' ? '/dota2companion_mvp/' : '/',
  // Server configuration for development
  server: {
    port: 5173,
    strictPort: true, // Force port 5173
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      timeout: 5000,
      overlay: true
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    cors: true
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    cssMinify: 'lightningcss',
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Optimized chunking strategy for performance
        manualChunks: (id) => {
          // Core React/DOM chunk
          if (id.includes('react') || id.includes('react-dom') || id.includes('@emotion')) {
            return 'vendor-react';
          }
          // Router chunk (lazy-loaded)
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          // UI library chunk - split Chakra for better caching
          if (id.includes('@chakra-ui')) {
            if (id.includes('theme') || id.includes('styled-system')) {
              return 'vendor-chakra-theme';
            }
            return 'vendor-chakra-components';
          }
          // Animation library - lazy load
          if (id.includes('framer-motion')) {
            return 'vendor-framer';
          }
          // Utils and smaller libraries
          if (id.includes('axios') || id.includes('react-icons') || id.includes('idb')) {
            return 'vendor-utils';
          }
          // Split large pages into separate chunks
          if (id.includes('pages/')) {
            const pageName = id.split('pages/')[1].split('.')[0];
            return `page-${pageName.toLowerCase()}`;
          }
          // Components that are heavy
          if (id.includes('RecommendationCard') || id.includes('VirtualList')) {
            return 'components-heavy';
          }
          // Services
          if (id.includes('services/')) {
            return 'services';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Aggressive tree shaking
      treeshake: {
        moduleSideEffects: (id, external) => {
          // Only preserve side effects for essential modules
          if (external) return false;
          return id.includes('.css') || 
                 id.includes('polyfill') ||
                 id.includes('chakra-ui/react') ||
                 (id.includes('react') && !id.includes('react-icons'));
        },
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      },
      external: (id) => {
        // Don't externalize anything in browser build
        return false;
      }
    },
    sourcemap: false,
    // Additional optimization
    assetsInlineLimit: 4096, // Inline small assets
    chunkSizeWarningLimit: 500, // Warn for chunks > 500kb
  },
  esbuild: {
    // Updated esbuild configuration for better module handling
    target: 'es2022',
    format: 'esm',
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Ensure proper variable naming to avoid conflicts
    keepNames: true,
  },
  // Enhanced dependency optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion'
    ],
    exclude: [],
    // Force dependency pre-bundling to avoid runtime issues
    force: true
  },
  // Additional configuration to prevent module initialization issues
  define: {
    // Ensure proper environment detection
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
