import type { SVGProps } from 'react';

const IcSvgDropdown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 10 6"
    {...props}
   color="currentColor">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      d="m1 1 3.293 3.293a1 1 0 0 0 1.414 0L9 1"
    />
  </svg>
);
export default IcSvgDropdown;
