import { useMemo, useState } from 'react';

interface MateRouteSheetProps {
  safe: '안전' | '보통' | '최단';
  place: string;
  distance: string;

  targetPace: { mm: number; ss: number };
  startTime: { hh: number; mm: number };
  participants: number;

  onCreate: (data: {
    targetPace: { mm: string; ss: string };
    startTime: { hh: string; mm: string };
    participants: number;
  }) => void;
}

const levelStyleMap: Record<MateRouteSheetProps['safe'], string> = {
  안전: 'bg-safe text-black',
  보통: 'bg-yellow-100 text-black',
  최단: 'bg-blue-100 text-black',
};

const to2 = (n: number | string) => String(n ?? 0).padStart(2, '0');
const sanitize = (val: string, maxLen = 2) =>
  val.replace(/[^\d]/g, '').slice(0, maxLen);

const MateRouteSheet = ({
  safe,
  place,
  distance,
  targetPace,
  startTime,
  participants,
  onCreate,
}: MateRouteSheetProps) => {
  // ✅ 인풋 상태 (초기값은 props에서 받아오기)
  const [paceMm, setPaceMm] = useState<string>(to2(targetPace.mm));
  const [paceSs, setPaceSs] = useState<string>(to2(targetPace.ss));
  const [startHh, setStartHh] = useState<string>(to2(startTime.hh));
  const [startMm, setStartMm] = useState<string>(to2(startTime.mm));
  const [count, setCount] = useState<string>(String(participants ?? 0));

  const clamp = (v: string, min: number, max: number) => {
    const n = Number(v || 0);
    return String(Math.min(Math.max(n, min), max));
  };

  const handleCreate = () => {
    const _mm = to2(clamp(paceMm, 0, 59));
    const _ss = to2(clamp(paceSs, 0, 59));
    const _hh = to2(clamp(startHh, 0, 23));
    const _smm = to2(clamp(startMm, 0, 59));
    const _cnt = Math.max(Number(count || 0), 0);

    onCreate({
      targetPace: { mm: _mm, ss: _ss },
      startTime: { hh: _hh, mm: _smm },
      participants: _cnt,
    });
  };

  const box = useMemo(
    () =>
      'h-9 w-[56px] rounded-[8px] border border-gray-200 bg-white px-2 text-[14px] text-center outline-none focus:border-gray-300',
    [],
  );
  const boxWide =
    'h-9 w-[68px] rounded-[8px] border border-gray-200 bg-white px-2 text-[14px] text-center outline-none focus:border-gray-300';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-[430px] rounded-t-2xl bg-white shadow-xl
                   animate-[sheetIn_.2s_ease-out] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="px-4 py-4">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <p
              className={`px-1.5 flex justify-center w-9 text-[0.75rem] font-normal rounded-[8px] ${levelStyleMap[safe]}`}
            >
              {safe}
            </p>
            <div className="flex gap-1 items-baseline">
              <span className="text-[18px] font-semibold">{place}</span>
              <span className="ml-1 text-[16px] text-gray1 font-medium">
                {distance}
              </span>
            </div>
          </div>

          {/* 폼 (입력 UI) */}
          <div className="mt-3 space-y-3">
            {/* 목표 페이스 */}
            <div className="flex items-center gap-6">
              <div className="w-24 text-med14 text-black">목표 페이스</div>
              <div className="flex items-center gap-2">
                <input
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="00"
                  className={box}
                  value={paceMm}
                  onChange={(e) => setPaceMm(sanitize(e.target.value))}
                  onBlur={(e) => setPaceMm(to2(clamp(e.target.value, 0, 59)))}
                  aria-label="페이스 분"
                />
                <span className="text-black">’</span>
                <input
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="00"
                  className={box}
                  value={paceSs}
                  onChange={(e) => setPaceSs(sanitize(e.target.value))}
                  onBlur={(e) => setPaceSs(to2(clamp(e.target.value, 0, 59)))}
                  aria-label="페이스 초"
                />
                <span className="text-black">”</span>
              </div>
            </div>

            {/* 시작 시간 */}
            <div className="flex items-center gap-6">
              <div className="w-24 text-med14 text-black">시작</div>
              <div className="flex items-center gap-2">
                <input
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="00"
                  className={box}
                  value={startHh}
                  onChange={(e) => setStartHh(sanitize(e.target.value))}
                  onBlur={(e) => setStartHh(to2(clamp(e.target.value, 0, 23)))}
                  aria-label="시작 시"
                />
                <span className="text-black">:</span>
                <input
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="00"
                  className={box}
                  value={startMm}
                  onChange={(e) => setStartMm(sanitize(e.target.value))}
                  onBlur={(e) => setStartMm(to2(clamp(e.target.value, 0, 59)))}
                  aria-label="시작 분"
                />
              </div>
            </div>

            {/* 모집 인원 */}
            <div className="flex items-center gap-6">
              <div className="w-24 text-med14 text-black">모집 인원</div>
              <div className="flex items-center gap-2">
                <input
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  className={boxWide}
                  value={count}
                  onChange={(e) => setCount(sanitize(e.target.value, 3))}
                  onBlur={(e) =>
                    setCount(String(Math.max(Number(e.target.value || 0), 0)))
                  }
                  aria-label="모집 인원"
                />
                <span className="text-black">명</span>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <button
            onClick={handleCreate}
            className="mt-4 h-12 w-full rounded-lg bg-main2 text-white font-semibold"
          >
            등록하기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sheetIn {
          from { transform: translateY(16px); opacity: .9; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MateRouteSheet;
