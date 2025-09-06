import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import { useUserStore } from './store/useUserStore';
import './index.css';

// 앱 시작 시 사용자 정보 로드
useUserStore.getState().hydrateUserFromMe().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
