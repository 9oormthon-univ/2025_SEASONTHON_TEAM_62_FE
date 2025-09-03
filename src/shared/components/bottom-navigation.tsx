import { NavLink } from 'react-router-dom';
import {
  IcSvgMyinfoB,
  IcSvgMyinfoW,
  IcSvgShoesB,
  IcSvgShoesW,
  IcSvgMateB,
  IcSvgMateW,
} from '../icons';

const BottomNavigation = () => {
  return (
    <nav
      className="fixed bottom-0 shadow-[0_-2px_16px_rgba(0,0,0,0.1)] left-0 right-0 
    rounded-t-[20px] h-[3.75rem] bg-white"
    >
      <ul className="relative flex items-center h-full">
        <li className="flex-1 h-full">
          <NavLink
            to="/myPage"
            className="block w-full h-full flex-col flex items-center justify-center py-0"
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <IcSvgMyinfoB className="w-8 h-8" />
                ) : (
                  <IcSvgMyinfoW className="w-8 h-8" />
                )}
                <span
                  className={isActive ? 'font-bold text-black' : 'text-black'}
                >
                  내 정보
                </span>
              </>
            )}
          </NavLink>
        </li>
        <li className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[20px] z-10">
          <NavLink
            to="/runningPage"
            className="pointer-events-auto flex flex-col items-center justify-center w-[4.375rem] h-[4.375rem] rounded-full bg-gray-300 shadow-lg"
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <IcSvgShoesB className="w-8 h-8" />
                ) : (
                  <IcSvgShoesW className="w-8 h-8" />
                )}
                <span
                  className={isActive ? 'font-bold text-black' : 'text-black'}
                >
                  런닝
                </span>
              </>
            )}
          </NavLink>
        </li>
        <li className="flex-1 h-full">
          <NavLink
            to="/matePage"
            className="block w-full h-full flex-col flex items-center justify-center py-0"
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <IcSvgMateB className="w-8 h-8" />
                ) : (
                  <IcSvgMateW className="w-8 h-8" />
                )}
                <span
                  className={isActive ? 'font-bold text-black' : 'text-black'}
                >
                  메이트
                </span>
              </>
            )}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavigation;
