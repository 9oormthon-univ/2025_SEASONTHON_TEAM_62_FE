import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from 'store/useUserStore';

export default function OAuthCallbackPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const hydrateUserFromMe = useUserStore((s) => s.hydrateUserFromMe);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(search);

    const providerError = sp.get('error') || sp.get('error_description');

    const rawState = sp.get('state');
    const rawNext = sp.get('next');
    const next = rawState ? decodeURIComponent(rawState) : rawNext || '/';

    let timer: number | undefined;

    (async () => {
      if (providerError) {
        setStatus('error');
        setErr(`인증 실패: ${providerError}`);
        timer = window.setTimeout(
          () => navigate('/login', { replace: true }),
          1500,
        );
        return;
      }

      try {
        
        await hydrateUserFromMe();

        setStatus('success');
        timer = window.setTimeout(() => navigate(next, { replace: true }), 600);
      } catch (e: any) {
        setStatus('error');
        setErr(e?.message || '사용자 정보 조회 실패');
        timer = window.setTimeout(
          () => navigate('/login', { replace: true }),
          1500,
        );
      }
    })();

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [search, navigate, hydrateUserFromMe]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray3 px-6">
      {status === 'loading' && (
        <div className="text-center">
          <p className="text-lg font-semibold">로그인 처리 중…</p>
          <p className="text-gray-600 mt-1">잠시만 기다려주세요.</p>
        </div>
      )}
      {status === 'success' && (
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600">로그인 성공!</p>
          <p className="text-gray-600 mt-1">페이지로 이동하는 중…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">로그인 실패</p>
          <p className="text-gray-600 mt-1">{err}</p>
          <p className="text-sm text-gray-500 mt-2">
            로그인 페이지로 돌아갑니다…
          </p>
        </div>
      )}
    </div>
  );
}
