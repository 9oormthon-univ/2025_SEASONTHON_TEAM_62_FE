import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import BottomNavigation from '../components/bottom-navigation';

const HIDDEN_BOTTOM_PATHS = ['/splash', '/onboarding', '/login'];

export default function GlobalLayout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();

  const showBottom =
    !HIDDEN_BOTTOM_PATHS.includes(pathname) &&
    !pathname.startsWith('/running/');

  return (
    <Suspense>
      <div className="flex justify-center bg-gray-100">
        <div className="flex flex-col w-full mx-auto min-w-[375px] max-w-[430px] min-h-[100dvh] bg-white">
          <main className={'flex-1'}>{children ?? <Outlet />}</main>
          {showBottom && (
            <nav className="pb-[env(safe-area-inset-bottom)]">
              <BottomNavigation />
            </nav>
          )}
        </div>
      </div>
    </Suspense>
  );
}
