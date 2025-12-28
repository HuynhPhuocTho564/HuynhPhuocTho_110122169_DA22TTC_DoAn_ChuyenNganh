/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        // Base sizes +2px từ chuẩn UX
        'xs': ['14px', { lineHeight: '1.5' }],      // 12px + 2px
        'sm': ['16px', { lineHeight: '1.5' }],      // 14px + 2px (label/caption)
        'base': ['18px', { lineHeight: '1.6' }],    // 16px + 2px (body text)
        'lg': ['20px', { lineHeight: '1.6' }],      // 18px + 2px
        'xl': ['24px', { lineHeight: '1.5' }],      // 20px + 4px (heading h4)
        '2xl': ['28px', { lineHeight: '1.4' }],     // 24px + 4px (heading h3)
        '3xl': ['34px', { lineHeight: '1.3' }],     // 30px + 4px (heading h2)
        '4xl': ['40px', { lineHeight: '1.2' }],     // 36px + 4px (heading h1)
        '5xl': ['52px', { lineHeight: '1.1' }],     // 48px + 4px
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}
