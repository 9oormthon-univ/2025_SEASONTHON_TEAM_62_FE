import { NavLink } from 'react-router-dom';
import {
  IcSvgShoes,
  IcSvgMate,
  IcSvgMyinfo,
  IcSvgMateFull,
  IcSvgMyinfoFull,
} from '../icons';

const BottomNavigation = () => {
  return (
    <nav
      className="fixed bottom-0 shadow-[0_-2px_16px_rgba(0,0,0,0.1)] left-0 right-0 
      rounded-t-[20px] h-[3.75rem] bg-white font-pretendard text-[0.625rem]"
    >
      <ul className="relative flex items-center h-full">
        <li className="flex-1 h-full font-medium">
          <NavLink
            to="/myinfo"
            className={({ isActive }) =>
              [
                'block w-full h-full flex flex-col items-center pr-[2.18rem] justify-center py-0',
                isActive ? 'text-black font-bold' : 'text-main1',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <IcSvgMyinfoFull className="w-8 h-8 text-main1" />
                ) : (
                  <IcSvgMyinfo className="w-8 h-8 text-main1" />
                )}
                <span>내 정보</span>
              </>
            )}
          </NavLink>
        </li>
        <li className="pointer-events-none font-bold absolute left-1/2 -translate-x-1/2 -top-[20px] z-10">
          <NavLink
            to="/running"
            className={({ isActive }) =>
              [
                'pointer-events-auto flex flex-col items-center justify-center w-[4.375rem] h-[4.375rem] rounded-full shadow-lg',
                isActive
                  ? 'bg-main1 text-white font-bold'
                  : 'bg-main3 text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <IcSvgShoes
                  className={`w-8 h-8 ${isActive ? 'text-white' : 'text-white'}`}
                />
                <span>런닝하기</span>
              </>
            )}
          </NavLink>
        </li>
        <li className="flex-1 h-full font-medium">
          <NavLink
            to="/mate"
            className={({ isActive }) =>
              [
                'block w-full h-full flex flex-col items-center pl-[2.18rem] justify-center py-0',
                isActive ? 'text-black font-bold' : 'text-main',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <IcSvgMateFull className="w-8 h-8 text-main1" />
                ) : (
                  <IcSvgMate className="w-8 h-8 text-main" />
                )}
                <span>메이트</span>
              </>
            )}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavigation;
