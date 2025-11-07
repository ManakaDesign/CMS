/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#0ea5e9',  // Sky blue
        },
        // Dark mode UI colors
        dark: {
          bg: '#0f172a',       // Very dark (main background)
          surface: '#1e293b',  // Dark (toolbars, sidebars)
          panel: '#334155',    // Medium dark (panels, cards)
          border: '#475569',   // Borders
          hover: '#475569',    // Hover states
          divider: '#334155',  // Dividers
        },
        // Light colors (for canvas and text)
        light: {
          bg: '#ffffff',       // Canvas background
          text: '#f1f5f9',     // Primary text on dark
          muted: '#94a3b8',    // Secondary text on dark
          border: '#e2e8f0',   // Light borders
        },
        // Keep backward compatibility with old primary colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
