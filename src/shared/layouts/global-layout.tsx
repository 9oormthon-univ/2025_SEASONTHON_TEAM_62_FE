import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const HIDDEN_BOTTOM_PATHS = ['']; //하단바 안들어가는 곳

export default function GlobalLayout() {
  const { pathname } = useLocation();
  const showBottom = !HIDDEN_BOTTOM_PATHS.includes(pathname);

  return (
    <Suspense>
      <div className="flex flex-col w-full mx-auto min-w-[375px] max-w-[430px] min-h-[100dvh]">
        <main className={'flex-1'}>
          <Outlet />
        </main>
        {showBottom && (
          <div className="sticky bottom-0 h-17 bg-gray-100">하단바</div>
        )}
      </div>
    </Suspense>
  );
}
