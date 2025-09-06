import { FavoriteIcon } from '../../../shared/components/favoriteIcon';
import type { PlanCard } from '../pathPage';

export function PlanCardItem({
  item,
  selected,
  onClick,
  favoriteChecked,
  favoriteLoading,
  onFavoriteChange,
}: {
  item: PlanCard;
  selected: boolean;
  onClick: () => void;
  favoriteChecked: boolean;
  favoriteLoading: boolean;
  onFavoriteChange: (next: boolean) => void;
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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={[
        'snap-start pointer-events-auto h-[110px] w-[150px] shrink-0 rounded-[8px] bg-white px-3 py-2 text-left',
        selected ? 'border-[2px] border-main3' : 'border-[2px] border-white',
      ].join(' ')}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="min-w-0 flex items-center gap-1">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-reg12"
            style={{ background: TAG_BG[item.id], color: '#111827' }}
          >
            {item.label}
          </span>
          <span className="text-[11px] text-gray-500">
            · {item.safetyScore}
          </span>
        </div>

        <FavoriteIcon
          checked={favoriteChecked}
          onChange={onFavoriteChange}
          disabled={favoriteLoading}
          aria-label={favoriteChecked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          className="grid h-6 w-6 place-items-center"
        />
      </div>

      <div className="flex items-baseline whitespace-nowrap tabular-nums leading-none">
        {hours && (
          <>
            <span className="text-[28px] font-extrabold tracking-tight">
              {hours}
            </span>
            <span className="mr-1 text-[16px] font-medium">시간</span>
          </>
        )}
        <span className="text-[28px] font-extrabold tracking-tight">
          {mins}
        </span>
        <span className="text-[16px] font-medium">분</span>
      </div>

      <div className="mt-1 text-[13px] text-gray1">
        {item.distanceKm.toFixed(1)}km · {item.steps.toLocaleString()}걸음
      </div>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex items-center gap-6">
      <div className="w-20 text-med14 text-black">{label}</div>
      <div className="text-sem16 text-black">{value}</div>
    </div>
  );
}
