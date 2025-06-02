// frontend/tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add Dota 2 colors for Tailwind classes (when needed)
      colors: {
        'dota-teal': '#27ae9e',
        'dota-dark-blue': '#244f62',
        'dota-purple': '#48308c',
        'dota-bg-primary': '#121212',
        'dota-bg-secondary': '#1a1a1a',
        'dota-text-primary': '#cce5f8',
        'dota-text-secondary': '#b4bcd4',
      },
    },
  },
  plugins: [],
  // Configure Tailwind to work alongside Chakra UI
  important: false, // Keep this false to avoid conflicts with Chakra
  corePlugins: {
    // Disable Tailwind's preflight to avoid conflicts with Chakra's CSS reset
    preflight: false,
  },
}
