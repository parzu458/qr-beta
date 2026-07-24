/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Print-process palette: warm ink base + CMY registration accents.
        ink: {
          DEFAULT: '#131316',
          soft: '#1b1b1f',
          raised: '#222227',
          line: '#323238',
        },
        paper: {
          DEFAULT: '#EDEAE3',
          dim: '#a8a6a1',
          faint: '#6f6d6a',
        },
        signal: {
          cyan: '#00AEEF',
          magenta: '#E8407A',
          yellow: '#F2C230',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
        '2xl': '10px',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(rgba(237,234,227,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '16px 16px',
      },
    },
  },
  plugins: [],
}
