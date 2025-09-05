import IcSvgArrow from '../../../shared/icons/ic_arrow';
import type { RouteItem } from '../page';

const TAG_BG: Record<RouteItem['type'], string> = {
  safe: '#B3FFC6',
  normal: '#FFFAB3',
  fast: '#FFDFB3',
};
export default function RouteListItem({
  item,
  onClick,
}: {
  item: RouteItem;
  onClick: () => void;
}) {
  return (
    <li className="py-4 ">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-reg12 mb-2"
            style={{ background: TAG_BG[item.type], color: '#111827' }}
          >
            {item.type === 'safe'
              ? '안전'
              : item.type === 'normal'
                ? '보통'
                : '최단'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-med18 text-black truncate">{item.name}</span>
            <span className="text-reg16 text-gray1">{item.distanceKm}km</span>
          </div>
        </div>

        <button
          onClick={onClick}
          className="ml-3 grid h-9 w-9 place-items-center rounded-[12px] bg-main3 text-white shadow-sm active:scale-95"
        >
          <IcSvgArrow width={16} />
        </button>
      </div>
    </li>
  );
}
