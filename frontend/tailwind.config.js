/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FDFAF6',
          100: '#F9F2E8',
          200: '#F2E4CF',
          300: '#E8D0B0',
          400: '#D9BA90',
          500: '#C4A070',
          600: '#A68050',
          700: '#8B6640',
          800: '#6E4E30',
          900: '#4A3420',
        },
        nude: {
          50:  '#FEF8F4',
          100: '#FCEEE4',
          200: '#F8D8C4',
          300: '#F2BC9C',
          400: '#E89A70',
          500: '#D97A4A',
          600: '#C05E30',
          700: '#9E4A22',
        },
        stone: {
          warm: '#7C6F64',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft':  '0 2px 20px rgba(139, 102, 64, 0.08)',
        'card':  '0 4px 30px rgba(139, 102, 64, 0.12)',
        'hover': '0 8px 40px rgba(139, 102, 64, 0.18)',
      },
    },
  },
  plugins: [],
};
