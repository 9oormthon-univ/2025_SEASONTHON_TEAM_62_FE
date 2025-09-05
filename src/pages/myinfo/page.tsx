import { useMemo } from 'react';

type RunItem = {
  id: number;
  type: 'safe' | 'normal' | 'fast';
  name: string;
  distanceKm: number;
  date: string;
  duration: string;
};

const runs: RunItem[] = [
  {
    id: 1,
    type: 'safe',
    name: '경북대학교 정문',
    distanceKm: 5,
    date: '8.13',
    duration: '00:00',
  },
  {
    id: 2,
    type: 'safe',
    name: '경북대학교 정문',
    distanceKm: 5,
    date: '8.13',
    duration: '00:00',
  },
  {
    id: 3,
    type: 'safe',
    name: '경북대학교 정문',
    distanceKm: 5,
    date: '8.13',
    duration: '00:00',
  },
];

const TAG_BG = {
  safe: '#B3FFC6',
  normal: '#FFFAB3',
  fast: '#FFDFB3',
} as const;

//  정보 목데이터
const mockUser = {
  name: '홍길동',
  stats: {
    totalDistanceKm: 15.0,
    avgPace: `05'45"`,
    bestPace: `04'58"`,
    totalRuns: runs.length,
    totalTime: '01:15:00',
  },
};

export default function MyinfoPage() {
  const totalDistanceText = useMemo(
    () => mockUser.stats.totalDistanceKm.toFixed(2),
    [],
  );

  return (
    <div className="relative min-h-dvh bg-white pb-[120px]">
      <header className="px-5 pt-6">
        <div className="flex items-center gap-3 pb-2">
          <div className="h-14 w-14 rounded-full bg-gray3" />
          <div className="text-med18 text-black">{mockUser.name} 님</div>
        </div>

        <div className="mt-5">
          <button className="inline-flex items-center gap-1 rounded-md text-sem18 text-black">
            2025년 8월
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric
            title="총 거리"
            value={
              <span className="text-[30px] font-extrabold tabular-nums">
                {totalDistanceText}
              </span>
            }
          />
          <Metric
            title="평균 페이스"
            value={
              <span className="text-[30px] font-extrabold tabular-nums">
                {mockUser.stats.avgPace}
              </span>
            }
          />
          <Metric
            title="최고 페이스"
            value={
              <span className="text-[30px] font-extrabold tabular-nums">
                {mockUser.stats.bestPace}
              </span>
            }
          />
        </div>

        <div className="mt-8 flex items-start gap-12">
          <Metric
            title="러닝"
            value={
              <span className="text-[24px] font-extrabold tabular-nums">
                {mockUser.stats.totalRuns.toString().padStart(2, '0')}
              </span>
            }
          />
          <Metric
            title="시간"
            value={
              <span className="text-[24px] font-extrabold tabular-nums">
                {mockUser.stats.totalTime}
              </span>
            }
          />
        </div>
      </header>

      <section className="mt-4 border-t border-gray3">
        <h2 className="px-5 py-3 text-sem18 text-black">나의 러닝 기록</h2>

        <ul className="divide-y divide-gray3">
          {runs.map((r) => (
            <li
              key={r.id}
              className="px-5 py-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-reg12 mb-1"
                    style={{ background: TAG_BG[r.type], color: '#111827' }}
                  >
                    {r.type === 'safe'
                      ? '안전'
                      : r.type === 'normal'
                        ? '보통'
                        : '최단'}
                  </span>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-med18 text-black">{r.name}</span>
                    <span className="text-reg16 text-gray1">
                      {r.distanceKm}km
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-med14 text-black mr-3">{r.date}</div>
                  <div className="text-sem18 text-black font-bold tabular-nums">
                    {r.duration}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-sem16 text-gray1">{title}</div>
      <div className="leading-tight">{value}</div>
    </div>
  );
}
