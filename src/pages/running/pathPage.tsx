'use client';

import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RouteFromLinks from '../../shared/components/kakaomap/routeFromLinks';
import IcSvgLeftArrow2 from '../../shared/icons/ic_leftarrow2';
import StartRunModal from './components/startRunModal';

type LatLng = { lat: number; lng: number };
type GraphNode = { id: string; lat: number; lng: number };
type GraphLink = {
  id: string;
  from: string;
  to: string;
  geometry?: LatLng[];
  color?: string;
};
type PlanCard = {
  id: 'safe' | 'normal' | 'fast';
  label: '안전' | '보통' | '최단';
  distanceKm: number;
  steps: number;
  etaText: string;
  color: string;
  favorite?: boolean;
};

const nodes: GraphNode[] = [
  { id: 'start', lat: 35.8887, lng: 128.6111 },
  { id: 'n1', lat: 35.8881, lng: 128.6129 },
  { id: 'n2', lat: 35.8871, lng: 128.6125 },
  { id: 'n3', lat: 35.8866, lng: 128.611 },
  { id: 'n4', lat: 35.8864, lng: 128.609 },
  { id: 'n5', lat: 35.8878, lng: 128.6079 },
  { id: 'n6', lat: 35.8898, lng: 128.6089 },
  { id: 'n7', lat: 35.8906, lng: 128.6109 },
  { id: 'end', lat: 35.891, lng: 128.6149 },
];

const PLAN_COLORS: Record<'safe' | 'normal' | 'fast', string> = {
  safe: '#37DE61',
  normal: '#FFDA46',
  fast: '#FFA42C',
};

function buildLinksByPlan(plan: 'safe' | 'normal' | 'fast'): GraphLink[] {
  const c = PLAN_COLORS[plan];
  if (plan === 'safe') {
    return [
      { id: 's1', from: 'start', to: 'n1', color: c },
      { id: 's2', from: 'n1', to: 'n2', color: c },
      { id: 's3', from: 'n2', to: 'n3', color: c },
      { id: 's4', from: 'n3', to: 'n4', color: c },
      { id: 's5', from: 'n4', to: 'n5', color: c },
      { id: 's6', from: 'n5', to: 'n6', color: c },
      { id: 's7', from: 'n6', to: 'n7', color: c },
      { id: 's8', from: 'n7', to: 'end', color: c },
    ];
  }
  if (plan === 'normal') {
    return [
      { id: 'm1', from: 'start', to: 'n2', color: c },
      { id: 'm2', from: 'n2', to: 'n3', color: c },
      { id: 'm3', from: 'n3', to: 'n5', color: c },
      { id: 'm4', from: 'n5', to: 'n7', color: c },
      { id: 'm5', from: 'n7', to: 'end', color: c },
    ];
  }
  return [
    { id: 'f1', from: 'start', to: 'n3', color: c },
    { id: 'f2', from: 'n3', to: 'n6', color: c },
    { id: 'f3', from: 'n6', to: 'end', color: c },
  ];
}

function PlanCardItem({
  item,
  selected,
  onClick,
}: {
  item: PlanCard;
  selected: boolean;
  onClick: () => void;
}) {
  const TAG_BG: Record<PlanCard['id'], string> = {
    safe: '#B3FFC6',
    normal: '#FFFAB3',
    fast: '#FFDFB3',
  };

  const hh = item.etaText.match(/(\d+)\s*시간/);
  const mm = item.etaText.match(/(\d+)\s*분/);
  const hours = hh?.[1] ?? '';
  const mins = mm?.[1] ?? '';

  return (
    <button
      onClick={onClick}
      className={[
        'snap-start pointer-events-auto shrink-0 w-[140px] h-[110px] rounded-[8px] bg-white px-3 py-2 text-left shadow-md',
        selected ? 'border-[2px] border-main3' : 'border-[2px] border-white',
      ].join(' ')}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-reg12"
          style={{ background: TAG_BG[item.id], color: '#111827' }}
        >
          {item.label}
        </span>
        <span className="text-main3 text-lg">♡</span>
      </div>

      <div className="flex items-baseline leading-none whitespace-nowrap tabular-nums">
        <span className="text-[28px] font-extrabold tracking-tight">
          {hours}
        </span>
        <span className="text-[16px] font-medium">시간</span>
        <span className="text-[28px] font-extrabold tracking-tight">
          {mins}
        </span>
        <span className="text-[16px] font-medium">분</span>
      </div>

      <div className="mt-1 text-[13px] text-gray1">
        {item.distanceKm}km · {item.steps.toLocaleString()}걸음
      </div>
    </button>
  );
}

export default function PathPage() {
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const startName = qs.get('start') ?? '경북대학교 정문';
  const targetDistanceKm = Number(qs.get('distance') ?? '5');
  const paceMin = qs.get('paceMin') ?? '5';
  const paceSec = qs.get('paceSec') ?? '50';
  const targetPace = `${paceMin}'${paceSec}"`;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    setIsOpen(false);
    navigate(`/running/start`);
  };

  const planCards = useMemo<PlanCard[]>(
    () => [
      {
        id: 'safe',
        label: '안전',
        distanceKm: targetDistanceKm,
        steps: 3333,
        etaText: '2시간 10분',
        color: PLAN_COLORS.safe,
        favorite: true,
      },
      {
        id: 'normal',
        label: '보통',
        distanceKm: targetDistanceKm,
        steps: 3333,
        etaText: '2시간 10분',
        color: PLAN_COLORS.normal,
      },
      {
        id: 'fast',
        label: '최단',
        distanceKm: targetDistanceKm,
        steps: 3333,
        etaText: '2시간 10분',
        color: PLAN_COLORS.fast,
      },
    ],
    [targetDistanceKm],
  );

  const [selectedId, setSelectedId] = useState<'safe' | 'normal' | 'fast'>(
    'safe',
  );

  const links: GraphLink[] = useMemo(
    () => buildLinksByPlan(selectedId),
    [selectedId],
  );

  return (
    <div className="flex h-dvh flex-col bg-white">
      <div className="flex items-center px-4 pt-[12px] pb-4">
        <button
          aria-label="뒤로"
          className="grid h-9 w-9 place-items-center rounded-full"
          onClick={() => history.back()}
        >
          <IcSvgLeftArrow2 width={7} />
        </button>
        <div className="flex-grow text-center">
          <h1 className="text-med18 pr-3">경로 찾기</h1>
        </div>
      </div>

      <div className="px-6 pb-3 border-b shadow-2xl">
        <InfoRow
          label="출발지점"
          value={startName}
        />
        <InfoRow
          label="거리"
          value={`${targetDistanceKm}km`}
        />
        <InfoRow
          label="목표 페이스"
          value={targetPace}
        />
      </div>

      <div className="relative flex-1">
        <RouteFromLinks
          nodes={nodes}
          links={links}
          showStartPin={false}
          showEndPin={false}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(56px+12px+env(safe-area-inset-bottom))] z-40">
          <div className="mx-auto w-full max-w-[560px] px-4">
            <div className="rounded-3xl bg-gradient-to-t from-black/10 to-transparent p-3">
              <div
                className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{ scrollbarWidth: 'none' }}
              >
                {planCards.map((c) => (
                  <PlanCardItem
                    key={c.id}
                    item={c}
                    selected={selectedId === c.id}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="w-full flex justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto h-14 w-full max-w-[430px] bg-main3 text-white text-sem16 px-4 pb-[env(safe-area-inset-bottom)]"
          >
            러닝 시작하기
          </button>
        </div>
      </div>
      <StartRunModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onStart={handleStart}
        planId={selectedId}
        startName={startName}
        distanceKm={targetDistanceKm}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex items-center gap-6">
      <div className="w-20 text-med14 text-black">{label}</div>
      <div className="text-sem16 text-black">{value}</div>
    </div>
  );
}
