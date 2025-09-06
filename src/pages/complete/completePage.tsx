import { useMemo } from 'react';
import IcSvgLeftArrow2 from '../../shared/icons/ic_leftarrow2';
import { FavoriteIcon } from '../../shared/components/favoriteIcon';

type Props = {
  startedAt?: Date | string; // 러닝 끝난 시각 (표기용)
  totalKm?: number; // 총 거리 (km)
  avgPaceText?: string; // 평균 페이스: 00'00"
  durationText?: string; // 시간: 00:00
  plan?: 'safe' | 'normal' | 'fast';
  routeName?: string;
  routeDistanceKm?: number;
  isFavorite?: boolean;
  onBack?: () => void;
  onToggleFavorite?: () => void;
};

const PLAN_LABEL: Record<NonNullable<Props['plan']>, string> = {
  safe: '안전',
  normal: '보통',
  fast: '최단',
};

const PLAN_TAG_BG: Record<NonNullable<Props['plan']>, string> = {
  safe: '#B3FFC6',
  normal: '#FFFAB3',
  fast: '#FFDFB3',
};

export default function CompletePage({
  startedAt,
  totalKm = 0,
  avgPaceText = `00'00"`,
  durationText = '00:00',
  plan = 'safe',
  routeName = '경북대학교 정문',
  routeDistanceKm = 5,
}: Props) {
  const dateText = useMemo(() => {
    const d = startedAt ? new Date(startedAt) : new Date();
    const dayNames = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];
    const yy = d.getFullYear();
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    const day = dayNames[d.getDay()];
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yy}.${mm}.${dd} ${day} - ${hh}:${mi}`;
  }, [startedAt]);

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-4 py-3">
        <button
          aria-label="뒤로"
          className="grid h-9 w-9 place-items-center rounded-full"
          onClick={() => window.history.back()}
        >
          <IcSvgLeftArrow2 width={7} />
        </button>
        <div className="flex-1 text-center pr-9">
          <h1 className="text-[17px] font-semibold text-black">러닝 완료</h1>
        </div>
      </div>

      {/* 상단 정보 */}
      <div className="px-5 pt-4 pb-6">
        <div className="text-[14px] text-gray-500">{dateText}</div>

        <div className="mt-4">
          <div className="text-[16px] font-semibold text-gray-500">총 거리</div>
          <div className="mt-1 text-[50px] leading-none font-extrabold tabular-nums text-black">
            {totalKm.toFixed(2)}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="text-[16px] font-semibold text-gray-500">
              평균 페이스
            </div>
            <div className="mt-2 text-[30px] leading-none font-extrabold tabular-nums text-black">
              {avgPaceText}
            </div>
          </div>
          <div>
            <div className="text-[16px] font-semibold text-gray-500">시간</div>
            <div className="mt-2 text-[30px] leading-none font-extrabold tabular-nums text-black">
              {durationText}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-200" />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto w-full max-w-none md:max-w-[560px] px-0 md:px-4 pb-[env(safe-area-inset-bottom)]">
          <div className="pointer-events-auto w-full rounded-t-[28px] bg-white p-5 shadow-[0_-12px_24px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-[12px] font-semibold text-black"
                  style={{ background: PLAN_TAG_BG[plan] }}
                >
                  {PLAN_LABEL[plan]}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="truncate text-[20px] font-semibold text-black">
                    {routeName}
                  </div>
                  <div className="text-[18px] font-medium text-gray-500">
                    {routeDistanceKm}km
                  </div>
                </div>
              </div>

              {/* 바깥은 div로 유지 (중첩 버튼 방지). onClick 필요하면 여기 div 대신 button 사용 */}
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F3EEFF]">
                <FavoriteIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
