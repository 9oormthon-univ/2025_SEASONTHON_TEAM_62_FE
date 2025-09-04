import type { SVGProps } from 'react';

const IcSvgInputDelete = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <circle
      cx={8}
      cy={8}
      r={8}
      fill="#D9D9D9"
    />
    <path
      stroke="white"
      strokeLinecap="round"
      strokeWidth="1.5"
      d="m5 5 6 6M11 5l-6 6"
    />
  </svg>
);
export default IcSvgInputDelete;
