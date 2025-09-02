import { createBrowserRouter } from 'react-router-dom';
import GlobalLayout from '../shared/layouts/global-layout';
import NotFoundPage from '../pages/NotFoundPage';

import HomePage from '../pages/home/HomePage';
import SplashPage from '../pages/splash/SplashPage';
import OnboardingPage from '../pages/onboarding/onboardingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'splash', element: <SplashPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
    ],
  },
]);
