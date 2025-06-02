import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  // GitHub Pages base path configuration
  // In production, set base to repository name for GitHub Pages deployment
  // In development, use root path for local development
  base: process.env.NODE_ENV === 'production' ? '/dota2companion_mvp/' : '/',
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // More granular chunking for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('@chakra-ui')) {
              return 'vendor-chakra';
            }
            if (id.includes('@emotion')) {
              return 'vendor-emotion';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            return 'vendor';
          }
          // Separate app pages into different chunks
          if (id.includes('/pages/')) {
            const page = id.split('/pages/')[1].split('.')[0];
            return `page-${page.toLowerCase()}`;
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        }
      },
      treeshake: {
        moduleSideEffects: false
      }
    },
    sourcemap: false, // Disable sourcemaps in production for smaller files
  },
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@chakra-ui/react'],
    exclude: []
  }
})
