import { NavLink } from 'react-router-dom';

const BottomNavigation = () => {
  return (
    <nav
      className="fixed bottom-0 shadow-[0_-2px_16px_rgba(0,0,0,0.1)] text-2xl left-0 right-0 
    rounded-t-[20px] h-[3.75rem] bg-white"
    >
      <ul className="relative flex items-center h-full">
        <li className="flex-1 h-full">
          <NavLink
            to="/myPage"
            className={({ isActive }) =>
              [
                'block w-full h-full flex items-center justify-center py-0',
                isActive ? 'font-bold text-black' : 'text-black',
              ].join(' ')
            }
          >
            마이
          </NavLink>
        </li>
        <li className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[20px] z-10">
          <NavLink
            to="/runningPage"
            className={({ isActive }) =>
              [
                'pointer-events-auto flex items-center justify-center w-[4.375rem] h-[4.375rem] rounded-full bg-gray-300 shadow-lg',
                isActive ? 'font-bold text-black' : 'text-black',
              ].join(' ')
            }
          >
            런닝
          </NavLink>
        </li>
        <li className="flex-1 h-full">
          <NavLink
            to="/matePage"
            className={({ isActive }) =>
              [
                'block w-full h-full flex items-center justify-center py-0',
                isActive ? 'font-bold text-black' : 'text-black',
              ].join(' ')
            }
          >
            메이트
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavigation;
