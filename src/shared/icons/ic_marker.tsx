import type { SVGProps } from 'react';

const IcSvgMarker = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 46 46"
    {...props}
   color="currentColor">
    <circle
      cx={22.827}
      cy={22.986}
      r={16}
      fill="currentColor"
      fillOpacity={0.37}
      transform="rotate(-33.637 22.827 22.986)"
    />
    <circle
      cx={22.827}
      cy={22.986}
      r={8}
      fill="currentColor"
      transform="rotate(-33.637 22.827 22.986)"
    />
    <circle
      cx={22.827}
      cy={22.986}
      r={5.5}
      fill="currentColor"
      stroke="currentColor"
      transform="rotate(-33.637 22.827 22.986)"
    />
  </svg>
);
export default IcSvgMarker;
