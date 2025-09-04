import type { SVGProps } from 'react';

const IcSvgLeftArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 14"
    {...props}
   color="currentColor">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.2}
      d="M1.2 7h17.6M8.4.6 1.2 7M8.4 13.4 1.2 7"
    />
  </svg>
);
export default IcSvgLeftArrow;
