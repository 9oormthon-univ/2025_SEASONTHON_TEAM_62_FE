const API_BASE = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_RETURN = import.meta.env.VITE_OAUTH_RETURN_URL;

export default function GoogleLoginButton({ next }: { next?: string }) {
  const handleClick = () => {
    const returnUrl = next
      ? new URL(next, window.location.origin).toString()
      : DEFAULT_RETURN || window.location.origin;
const url = new URL(`${API_BASE}/oauth2/authorization/google`);
    url.searchParams.set('redirect_uri', returnUrl);
    const current = window.location.pathname + window.location.search;
    url.searchParams.set('state', encodeURIComponent(current));

    window.location.href = url.toString();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-lg bg-[#4285F4] py-2.5 text-sm font-semibold text-white hover:brightness-110 active:brightness-95 transition"
    >
      구글로 시작하기
    </button>
  );
}
