/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        // Kích thước chuẩn UX - gọn gàng hơn
        'xs': ['11px', { lineHeight: '1.5' }],      // extra small
        'sm': ['13px', { lineHeight: '1.5' }],      // small (label/caption)
        'base': ['14px', { lineHeight: '1.6' }],    // body text
        'lg': ['16px', { lineHeight: '1.6' }],      // large
        'xl': ['18px', { lineHeight: '1.5' }],      // heading h4
        '2xl': ['22px', { lineHeight: '1.4' }],     // heading h3
        '3xl': ['28px', { lineHeight: '1.3' }],     // heading h2
        '4xl': ['34px', { lineHeight: '1.2' }],     // heading h1
        '5xl': ['44px', { lineHeight: '1.1' }],     // display
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
