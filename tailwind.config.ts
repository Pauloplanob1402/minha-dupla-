import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0B0B0E',
        surface: '#151519',
        surface2: '#1C1C22',
        violet: '#8B5CF6',
        pink: '#EC4899',
        emerald: '#10B981',
        amber: '#F59E0B',
      },
      fontFamily: {
        display: ['var(--font-jakarta)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(236,72,153,0.45)' },
          '70%': { boxShadow: '0 0 0 10px rgba(236,72,153,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(236,72,153,0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s infinite',
      },
    },
  },
  plugins: [],
}
export default config
