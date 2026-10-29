/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        amharic: ['var(--font-abyssinica)', 'Abyssinica SIL', 'serif'],
      },
      colors: {
        obsidian: { 950: '#04060b', 900: '#080c14', 800: '#0e1522', 700: '#16203a' },
        neon: { cyan: '#22d3ee', blue: '#3b82f6' },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,.25), 0 0 40px -8px rgba(34,211,238,.35)',
      },
      keyframes: {
        drift: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: { drift: 'drift 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
