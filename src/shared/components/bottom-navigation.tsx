import { NavLink } from 'react-router-dom';
import { IcSvgShoes, IcSvgMate, IcSvgMyinfo } from '../icons';

const BottomNavigation = () => {
  return (
    <nav
      className="fixed bottom-0 shadow-[0_-2px_16px_rgba(0,0,0,0.1)] left-0 right-0 
      rounded-t-[20px] h-[3.75rem] bg-white"
    >
      <ul className="relative flex items-center h-full">
        <li className="flex-1 h-full">
          <NavLink
            to="/myinfo"
            className={({ isActive }) =>
              [
                'block w-full h-full flex flex-col items-center pr-[2.18rem] justify-center py-0',
                isActive ? 'text-black font-bold' : 'text-gray-400',
              ].join(' ')
            }
          >
            <IcSvgMyinfo className="w-8 h-8" />
            <span>내 정보</span>
          </NavLink>
        </li>
        <li className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[20px] z-10">
          <NavLink
            to="/runningPage"
            className={({ isActive }) =>
              [
                'pointer-events-auto flex flex-col items-center justify-center w-[4.375rem] h-[4.375rem] rounded-full shadow-lg',
                isActive
                  ? 'bg-gray-300 text-black font-bold'
                  : 'bg-gray-200 text-gray-400',
              ].join(' ')
            }
          >
            <IcSvgShoes className="w-8 h-8" />
            <span>런닝</span>
          </NavLink>
        </li>
        <li className="flex-1 h-full">
          <NavLink
            to="/matePage"
            className={({ isActive }) =>
              [
                'block w-full h-full flex flex-col items-center pl-[2.18rem] justify-center py-0',
                isActive ? 'text-black font-bold' : 'text-gray-400',
              ].join(' ')
            }
          >
            <IcSvgMate className="w-8 h-8" />
            <span>메이트</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavigation;
