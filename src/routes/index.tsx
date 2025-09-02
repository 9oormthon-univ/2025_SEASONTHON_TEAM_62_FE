import { createBrowserRouter } from 'react-router-dom';
import GlobalLayout from '../shared/layouts/global-layout';
import NotFoundPage from '../pages/NotFoundPage';

import HomePage from '../pages/home/HomePage';
import SplashPage from '../pages/splash/SplashPage';
import OnBoardingPage from '../pages/onboarding/OnBoardingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'splash', element: <SplashPage /> },
      { path: 'onboarding', element: <OnBoardingPage /> },
    ],
  },
]);
