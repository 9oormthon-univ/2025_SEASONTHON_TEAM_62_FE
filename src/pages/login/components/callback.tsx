// OAuthCallbackPage.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from 'store/useAuthStore';

export default function OAuthCallbackPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(search);
    const next = sp.get('next') || '/';
    (async () => {
      try {
        await checkAuth();
        setStatus('success');
        setTimeout(() => navigate(next), 800);
      } catch (e) {
        setStatus('error');
        setErr('사용자 정보 조회 실패');
        setTimeout(() => navigate('/login'), 1500);
      }
    })();
  }, [search, navigate, checkAuth]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray3">
      {status === 'loading' && <p>로그인 처리 중…</p>}
      {status === 'success' && <p>로그인 성공! 이동 중…</p>}
      {status === 'error' && <p>로그인 실패: {err}</p>}
    </div>
  );
}
