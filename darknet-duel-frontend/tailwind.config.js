/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from the old implementation
        'cyber-blue': '#0A52C0',
        'cyber-red': '#C83F39',
        'cyber-dark': '#121212',
        'cyber-light': '#F5F7FA',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  darkMode: 'class',
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      // Light theme (cyberpunk) - Blue based
      {
        cyberpunk: {
          // From old implementation
          "primary": "#0A52C0", // Blue
          "primary-content": "#F5F7FA", // White - for text ON primary elements
          "secondary": "rgb(80, 130, 230)", // Lighter blue
          "secondary-content": "#F5F7FA", // White
          "accent": "rgb(120, 160, 240)", // Softest blue
          "accent-content": "rgb(30, 35, 45)", // Dark text
          "neutral": "#F0F2F5", // Slightly darker white
          "neutral-content": "rgb(30, 35, 45)", // Dark text
          "base-100": "#F5F7FA", // White background
          "base-200": "#F0F2F5", // Slightly darker white
          "base-300": "#E6EBF0", // Even darker white
          "base-content": "rgb(30, 35, 45)", // Dark text on light background
          "info": "#0A52C0", // Blue
          "success": "rgb(0, 180, 120)", // Green
          "warning": "rgb(220, 170, 0)", // Yellow
          "error": "rgb(200, 60, 50)", // Red
          
          // Custom properties
          "--rounded-box": "0.125rem",
          "--rounded-btn": "0.25rem",
          "--rounded-badge": "0.25rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.95",
          "--border-btn": "2px",
          "--tab-radius": "0.25rem",
        },
      },
      // Dark theme (cyberpunk-dark) - Red based
      {
        "cyberpunk-dark": {
          // From old implementation
          "primary": "#C83F39", // Softer red
          "primary-content": "#F5F7FA", // White text on red background
          "secondary": "rgb(210, 100, 90)", // Lighter red
          "secondary-content": "#F5F7FA", // White text on secondary
          "accent": "rgb(230, 150, 140)", // Softest red
          "accent-content": "#121212", // Dark text on light accent
          "neutral": "#0C0C0C", // Slightly darker
          "neutral-content": "rgb(230, 235, 240)", // Light text
          "base-100": "#121212", // Dark background
          "base-200": "#0C0C0C", // Slightly darker
          "base-300": "#060606", // Even darker
          "base-content": "rgb(230, 235, 240)", // Light text
          "info": "#C83F39", // Red
          "success": "rgb(0, 160, 100)", // Green
          "warning": "rgb(200, 150, 0)", // Yellow
          "error": "rgb(230, 80, 50)", // Brighter orange-red
          
          // Custom properties
          "--rounded-box": "0.125rem",
          "--rounded-btn": "0rem",
          "--rounded-badge": "0rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.95",
          "--border-btn": "2px",
          "--tab-radius": "0rem",
        }
      }
    ],
  },
}
