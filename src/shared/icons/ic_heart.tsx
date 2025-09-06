import type { SVGProps } from 'react';

const IcSvgHeart = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 14 12"
    {...props}
    color="#7155BE"
  >
    <path
      fill="#7155BE"
      stroke="#7155BE"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      d="m7 11.334-5.024-4.69c-1.301-1.214-1.301-3.185 0-4.4 1.3-1.214 3.413-1.214 4.714 0l.31.289.31-.288c1.3-1.215 3.413-1.215 4.714 0 1.301 1.214 1.301 3.185 0 4.4z"
    />
  </svg>
);
export default IcSvgHeart;
