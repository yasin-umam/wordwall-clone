/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Baloo 2', 'Nunito', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8ebbff',
          400: '#5994ff',
          500: '#346dff',
          600: '#1d4ef5',
          700: '#163ce1',
          800: '#1832b6',
          900: '#1a318f',
        },
      },
      boxShadow: {
        playful: '0 10px 30px -10px rgba(52, 109, 255, 0.45)',
        card: '0 4px 20px -6px rgba(15, 23, 42, 0.15)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        pop: 'pop 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
