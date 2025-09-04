import { createBrowserRouter } from 'react-router-dom';
import GlobalLayout from '../shared/layouts/global-layout';
import NotFoundPage from '../pages/NotFoundPage';

import HomePage from '../pages/home/HomePage';
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
      { index: true, element: <HomePage /> },
      { path: 'splash', element: <SplashPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'mate', element: <MatePage /> },
      { path: 'running', element: <RunningPage /> },
    ],
  },
]);
