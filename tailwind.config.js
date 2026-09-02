/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#f5c542',
          light: '#ffdf8e',
          dark: '#b8860b',
        },
        jade: {
          DEFAULT: '#17c26b',
          light: '#37c978',
          dark: '#0f8a49',
        },
        orange: {
          DEFAULT: '#f2760f',
          light: '#ff9b3d',
          dark: '#d95f04',
        },
        table: {
          felt1: '#1c5c36',
          felt2: '#123f24',
          felt3: '#0b2b17',
          carpet1: '#8e1f2c',
          carpet2: '#520c15',
          royal1: '#142c54',
          royal2: '#09152b',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(245, 197, 66, 0.45)',
        'red-glow': '0 0 25px rgba(255, 90, 90, 0.5)',
        'jade-glow': '0 0 25px rgba(23, 194, 107, 0.45)',
        'card': '0 10px 24px -4px rgba(0, 0, 0, 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
