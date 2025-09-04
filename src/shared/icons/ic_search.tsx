import type { SVGProps } from 'react';

const IcSvgSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    {...props}
   color="currentColor">
    <path
      stroke="currentColor"
      strokeMiterlimit={10}
      strokeWidth={1.714}
      d="M14 22.667a8.667 8.667 0 1 0 0-17.333 8.667 8.667 0 0 0 0 17.333Z"
    />
    <path
      fill="currentColor"
      d="M26.06 27.273a.857.857 0 0 0 1.213-1.212l-.606.606zM20 20l-.606.606 6.667 6.667.606-.606.606-.606-6.667-6.667z"
    />
  </svg>
);
export default IcSvgSearch;
