import { createBrowserRouter } from 'react-router-dom';
import GlobalLayout from '../shared/layouts/global-layout';
import NotFoundPage from '../pages/NotFoundPage';

import SplashPage from '../pages/splash/SplashPage';
import LoginPage from '../pages/login/LoginPage';
import RunningPage from '../pages/running/page';
import MatePage from '../pages/mate/page';
import MyinfoPage from '../pages/myinfo/page';
import DetailPage from '../pages/running/[id]';
import PathPage from '../pages/running/path';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <RunningPage /> },
      { path: 'splash', element: <SplashPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'mate', element: <MatePage /> },
      { path: 'myinfo', element: <MyinfoPage /> },
      { path: 'running/:id', element: <DetailPage /> },
      { path: 'running/:id/path', element: <PathPage /> },
    ],
  },
]);
