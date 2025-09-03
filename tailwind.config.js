/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main1: '#28097C',
        main2: '#6043AE',
        main3: '#7155BE',

        gray1: '#767676',
        gray2: '#D9D9D9',
        gray3: '#EAEAEA',
        gray4: '#EAEAEA', 

        safe: '#B3FFC6',

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
