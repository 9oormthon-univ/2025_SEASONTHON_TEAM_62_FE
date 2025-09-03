import type { SVGProps } from 'react';

const IcSvgPencil = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
   color="currentColor">
    <g
      stroke="currentColor"
      strokeWidth={0.039}
      clipPath="url(#pencil_svg__a)"
    >
      <path
        fill="currentColor"
        d="m16.582 0 .098.02-.098.02zM16.191.04l.098.019-.098.02zM16.934.04l.097.019-.097.02zM17.129.078l.098.02-.098.02zM15.606.234l.058.02-.098.059z"
        opacity={0.851}
      />
      <path
        d="m17.754.313.039.078M15.41.352l-.039.078M17.871.39l.04.079M15.293.43l-.117.156M18.066.547l1.407 1.445M19.55 2.07l.04.078M13.613 2.148l4.219 4.258M19.629 2.188l.039.078"
        opacity={0.851}
      />
      <path
        fill="currentColor"
        d="M19.98 3.086 20 3.3h-.04z"
        opacity={0.851}
      />
      <path
        d="m12.363 3.36 4.258 4.296"
        opacity={0.851}
      />
      <path
        fill="currentColor"
        d="m19.98 3.438.02.214h-.04z"
        opacity={0.851}
      />
      <path
        d="m19.707 4.453-.039.078M19.629 4.57l-.04.078M19.55 4.688l-.116.156M1.309 14.414l-.04.078"
        opacity={0.851}
      />
      <path
        fill="currentColor"
        d="m5.566 18.672-.039.078-.058-.02zM.02 19.414l.02.098H0zM.059 19.727l.136.175-.156-.117zM.332 19.96l.098.02-.098.02zM.488 19.96l.098.02-.098.02z"
        opacity={0.851}
      />
      <path
        fill="currentColor"
        d="M16.309.04h.585l.352.077.469.195.234.157 1.582 1.582.313.547.117.39.039.43-.04.039v.352l-.116.39-.274.469-1.699 1.738-4.277-4.277L15.137.586Q15.57.16 16.309.039ZM12.324 3.398l4.278 4.239L5.605 18.672l-.273.117L.449 20q-.258-.035-.37-.215L0 19.551l1.25-5.04.078-.116z"
      />
    </g>
    <defs>
      <clipPath id="pencil_svg__a">
        <path
          fill="currentColor"
          d="M0 0h20v20H0z"
        />
      </clipPath>
    </defs>
  </svg>
);
export default IcSvgPencil;
