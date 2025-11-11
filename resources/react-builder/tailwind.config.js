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
          primary: '#246dff',  // Blue
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
          50: '#f5f0ff',
          100: '#ede5ff',
          200: '#dccfff',
          300: '#c3a8ff',
          400: '#a677ff',
          500: '#8a4dff',
          600: '#7d2fff',
          700: '#6819e6',
          800: '#5515c2',
          900: '#47129f',
          950: '#3E0BAA',
        },
      },
    },
  },
  plugins: [],
}
