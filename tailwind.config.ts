import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: '#00eaff',
          500: '#00c8dd',
          900: '#001a22',
        },
        hud: {
          bg: '#04060a',
          panel: 'rgba(0,18,32,0.62)',
          border: 'rgba(0,234,255,0.28)',
          glow: 'rgba(0,234,255,0.22)',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-slower': 'spin 5s linear infinite reverse',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 6px #00eaff)' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 14px #00eaff)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: { hud: '6px' },
    },
  },
  plugins: [],
}
export default config
