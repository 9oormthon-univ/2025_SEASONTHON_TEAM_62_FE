import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const HIDDEN_BOTTOM_PATHS = ['/splash', '/onboarding']; //하단바 안들어가는 곳

export default function GlobalLayout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const showBottom = !HIDDEN_BOTTOM_PATHS.includes(pathname);

  return (
    <Suspense>
      <div className="flex justify-center bg-gray-100">
        <div className="flex flex-col w-full mx-auto min-w-[375px] max-w-[430px] min-h-[100dvh] bg-white">
          <main className={'flex-1'}>{children ?? <Outlet />}</main>
          {showBottom && (
            <nav className="sticky bottom-0 h-[68px] bg-gray-200 border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
              하단바
            </nav>
          )}
        </div>
      </div>
    </Suspense>
  );
}
