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
    target: 'es2022', // Updated to more modern target for better module handling
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Simplified chunking strategy to avoid circular dependencies
        manualChunks: {
          // Consolidate React + Emotion to prevent cross-chunk initialization issues
          'vendor-react': ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
          'vendor-router': ['react-router-dom'],
          'vendor-chakra': ['@chakra-ui/react'],
          'vendor-framer': ['framer-motion'],
          'vendor-utils': ['axios', 'react-icons']
        },
        // Fixed chunk naming to avoid complex dynamic names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Updated treeshaking config
      treeshake: {
        moduleSideEffects: (id, external) => {
          // Allow side effects for CSS and known safe modules
          // Preserve side effects for React and emotion to ensure proper initialization
          return id.includes('.css') || 
                 id.includes('@chakra-ui') || 
                 id.includes('@emotion') ||
                 id.includes('react') ||
                 id.includes('react-dom') ||
                 external;
        }
      }
    },
    sourcemap: false, // Disable sourcemaps in production for smaller files
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
