import { createBrowserRouter } from 'react-router-dom';
import GlobalLayout from '../shared/layouts/global-layout';
import NotFoundPage from '../pages/NotFoundPage';

import SplashPage from '../pages/splash/SplashPage';
import LoginPage from '../pages/login/LoginPage';
import MatePage from '../pages/mate/MatePage';
import RunningPage from '../pages/running/page';

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
    ],
  },
]);
