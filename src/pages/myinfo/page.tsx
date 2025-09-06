import { useEffect, useMemo, useState } from 'react';
import api from '../../shared/apis/api';

type Stats = {
  totalRuns: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  averagePace: string;
  bestPace: string;
  averageDistanceKm: number;
  averageDurationMinutes: number;
  lastRunDate: string;
  recentRuns: Array<{
    id: number;
    safetyLevel: 'SAFE' | 'MEDIUM' | 'FAST';
    distanceKm: number;
    durationMinutes: number;
    pace: string;
    startTime: string;
  }>;
};

type StatsResponse =
  | { success: 'true' | true; data: Stats }
  | { success: 'false' | false; data?: never };

const SAFETY_BG: Record<string, string> = {
  SAFE: '#B3FFC6',
  MEDIUM: '#FFFAB3',
  FAST: '#FFDFB3',
};

const SAFETY_LABEL: Record<string, string> = {
  SAFE: '안전',
  MEDIUM: '보통',
  FAST: '최단',
};

function minutesToHHMM(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function minutesToPrettyHM(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function monthLabelFrom(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function dateMD(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

function stripKmSuffix(pace: string) {
  // "6'10\"/km" -> "6'10\""
  const idx = pace.indexOf('/km');
  return idx > 0 ? pace.slice(0, idx) : pace;
}

function Metric({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-sem16 text-gray1">{title}</div>
      <div className="leading-tight">{value}</div>
    </div>
  );
}

export default function MyinfoPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get<StatsResponse>('/api/running/stats');
        const ok =
          (data as any)?.success === 'true' || (data as any)?.success === true;
        if (!ok) throw new Error('러닝 통계 조회 실패');
        if (!ignore) setStats((data as any).data);
      } catch (e: any) {
        if (!ignore) setError(e?.message ?? '러닝 통계를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const monthLabel = useMemo(
    () => monthLabelFrom(stats?.lastRunDate),
    [stats?.lastRunDate],
  );

  const totalDistanceText = useMemo(
    () => (stats ? stats.totalDistanceKm.toFixed(2) : '0.00'),
    [stats],
  );

  const avgPace = useMemo(
    () => (stats ? stripKmSuffix(stats.averagePace) : `00'00"`),
    [stats],
  );

  const bestPace = useMemo(
    () => (stats ? stripKmSuffix(stats.bestPace) : `00'00"`),
    [stats],
  );

  const totalTime = useMemo(
    () =>
      stats ? `${minutesToHHMM(stats.totalDurationMinutes)}:00` : '00:00:00',
    [stats],
  );

  return (
    <div className="relative min-h-dvh bg-white pb-[120px]">
      <header className="px-5 pt-6">
        <div className="flex items-center gap-3 pb-2">
          <div className="h-14 w-14 rounded-full bg-gray3" />
          <div className="text-med18 text-black">유니브</div>
        </div>

        <div className="mt-5">
          <button className="inline-flex items-center gap-1 rounded-md text-sem18 text-black">
            {monthLabel}
          </button>
        </div>

        {/* 메트릭 3개 */}
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
                {avgPace}
              </span>
            }
          />
          <Metric
            title="최고 페이스"
            value={
              <span className="text-[30px] font-extrabold tabular-nums">
                {bestPace}
              </span>
            }
          />
        </div>

        <div className="mt-8 flex items-start gap-12">
          <Metric
            title="러닝"
            value={
              <span className="text-[24px] font-extrabold tabular-nums">
                {(stats?.totalRuns ?? 0).toString().padStart(2, '0')}
              </span>
            }
          />
          <Metric
            title="시간"
            value={
              <span className="text-[24px] font-extrabold tabular-nums">
                {totalTime}
              </span>
            }
          />
        </div>
      </header>

      <section className="mt-4 border-t border-gray3">
        <h2 className="px-5 py-3 text-sem18 text-black">나의 러닝 기록</h2>

        {loading && <div className="px-5 pb-6 text-gray1">불러오는 중…</div>}

        {!loading && error && (
          <div className="px-5 pb-6 text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <ul className="divide-y divide-gray3">
            {(stats?.recentRuns ?? []).map((r) => {
              const paceNoKm = stripKmSuffix(r.pace);
              const dateLabel = dateMD(r.startTime);
              const dur = minutesToPrettyHM(r.durationMinutes); // "HH:MM"
              const tagBg = SAFETY_BG[r.safetyLevel] ?? '#E5E7EB';
              const tagLabel = SAFETY_LABEL[r.safetyLevel] ?? '';

              return (
                <li
                  key={r.id}
                  className="px-5 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className="mb-1 inline-block rounded-full px-2 py-0.5 text-reg12"
                        style={{ background: tagBg, color: '#111827' }}
                      >
                        {tagLabel}
                      </span>

                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-med18 text-black">
                          {r.distanceKm}km
                        </span>
                        <span className="text-reg16 text-gray1">
                          {paceNoKm}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="mr-3 text-med14 text-black">
                        {dateLabel}
                      </div>
                      <div className="tabular-nums text-sem18 font-bold text-black">
                        {dur}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {stats && stats.recentRuns.length === 0 && (
              <li className="px-5 py-6 text-center text-gray1">
                기록이 아직 없어요.
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
