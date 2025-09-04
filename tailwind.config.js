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
        pretendard: ['Pretendard', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
