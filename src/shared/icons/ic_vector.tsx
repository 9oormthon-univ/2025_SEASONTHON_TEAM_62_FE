import type { SVGProps } from 'react';

const IcSvgVector = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 12 12"
    {...props}
   color="currentColor">
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={0.643}
      d="M10.125 4.5a4.125 4.125 0 0 0-8.25 0c0 3 4.125 7.125 4.125 7.125S10.125 7.5 10.125 4.5Z"
    />
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={0.643}
      d="M6 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
    />
  </svg>
);
export default IcSvgVector;
