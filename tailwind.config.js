/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      mobile: '375px',
    },
    extend: {
      colors: {
        main1: '#28097C',
        main2: '#6043AE',
        main3: '#7155BE',

        gray1: '#767676',
        gray2: '#D9D9D9',
        gray3: '#EAEAEA',
        gray4: '#EAEAEA',

        red: '#E55B5B',
        safe: '#B3FFC6',
        green: '#37DE61',
        yellow1: '#FFDA46',
        yellow2: '#FFFAB3',
        orange1: '#FFA42C',
        orange2: '#FFDFB3',

        white: '#FFFFFF',
        black: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        // Semibold
        sem18: ['18px', { lineHeight: '28px', fontWeight: 600 }],
        sem16: ['16px', { lineHeight: '24px', fontWeight: 600 }],
        sem14: ['14px', { lineHeight: '20px', fontWeight: 600 }],
        sem12: ['12px', { lineHeight: '16px', fontWeight: 600 }],
        sem10: ['10px', { lineHeight: '14px', fontWeight: 600 }],

        // Medium
        med18: ['18px', { lineHeight: '28px', fontWeight: 500 }],
        med16: ['16px', { lineHeight: '24px', fontWeight: 500 }],
        med14: ['14px', { lineHeight: '20px', fontWeight: 500 }],
        med12: ['12px', { lineHeight: '16px', fontWeight: 500 }],
        med10: ['10px', { lineHeight: '14px', fontWeight: 500 }],

        // Regular
        reg18: ['18px', { lineHeight: '28px', fontWeight: 400 }],
        reg16: ['16px', { lineHeight: '24px', fontWeight: 400 }],
        reg14: ['14px', { lineHeight: '20px', fontWeight: 400 }],
        reg12: ['12px', { lineHeight: '16px', fontWeight: 400 }],
        reg10: ['10px', { lineHeight: '14px', fontWeight: 400 }],
      },
    },
  },
  plugins: [],
};
