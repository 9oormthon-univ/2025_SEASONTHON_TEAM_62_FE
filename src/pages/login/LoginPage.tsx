const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

type Provider = 'google' | 'kakao' | 'naver';

function goOAuth(provider: Provider, next?: string) {
  const url = new URL(`${API_BASE}/oauth2/authorization/${provider}`);
  const state = next ?? window.location.pathname + window.location.search;
  url.searchParams.set('state', encodeURIComponent(state));
  window.location.href = url.toString();
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-gray3">
      <div className="flex-1" />

      <footer className="bg-[#1B0B64] px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="mx-auto w-full max-w-[430px] space-y-3">
          <button
            onClick={() => goOAuth('google', '/')}
            aria-label="구글로 시작하기"
            className="
              w-full h-14 rounded-2xl bg-white font-semibold
               transition
              grid grid-cols-[28px,1fr,28px] items-center
            "
          >
            <span className="col-start-1 col-end-2 grid place-items-center">
              {/* 아이콘 */}
            </span>
            <span className="col-start-2 col-end-3 text-center text-[17px]">
              구글로 시작하기
            </span>
            <span className="col-start-3" />
          </button>

          <button
            onClick={() => goOAuth('kakao', '/')}
            aria-label="카카오로 시작하기"
            className="
              w-full h-14 rounded-2xl bg-[#FEE500] text-black font-semibold
               transition
              grid grid-cols-[28px,1fr,28px] items-center
            "
          >
            <span className="col-start-1 col-end-2 grid place-items-center">
              {/* 아이콘 */}
            </span>
            <span className="col-start-2 col-end-3 text-center text-[17px]">
              카카오로 시작하기
            </span>
            <span className="col-start-3" />
          </button>

          {/* 네이버로 시작하기 */}
          <button
            onClick={() => goOAuth('naver', '/')}
            aria-label="네이버로 시작하기"
            className="
              w-full h-14 rounded-2xl bg-[#03C75A] text-white font-semibold
               transition
              grid grid-cols-[28px,1fr,28px] items-center
            "
          >
            <span className="col-start-1 col-end-2 grid place-items-center">
              {/* 아이콘 */}
            </span>
            <span className="col-start-2 col-end-3 text-center text-[17px]">
              네이버로 시작하기
            </span>
            <span className="col-start-3" />
          </button>
        </div>
      </footer>
    </div>
  );
}
