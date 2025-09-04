import type { SVGProps } from 'react';

const IcSvgInputDelete = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
   color="currentColor">
    <circle
      cx={8}
      cy={8}
      r={8}
      fill="currentColor"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      d="m5 5 6 6M11 5l-6 6"
    />
  </svg>
);
export default IcSvgInputDelete;
