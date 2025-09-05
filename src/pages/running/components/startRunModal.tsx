import { useEffect, useRef } from 'react';

type StartRunModalProps = {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  planId: 'safe' | 'normal' | 'fast';
  startName: string;
  distanceKm: number | string;
  planLabel?: '안전' | '보통' | '최단'; 
};

const TAG_BG: Record<StartRunModalProps['planId'], string> = {
  safe: '#B3FFC6',
  normal: '#FFFAB3',
  fast: '#FFDFB3',
};
const PLAN_LABEL: Record<
  StartRunModalProps['planId'],
  '안전' | '보통' | '최단'
> = {
  safe: '안전',
  normal: '보통',
  fast: '최단',
};

export default function StartRunModal({
  open,
  onClose,
  onStart,
  planId,
  startName,
  distanceKm,
  planLabel,
}: StartRunModalProps) {
  const label = planLabel ?? PLAN_LABEL[planId];
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 "
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose(); 
      }}
    >
      <div className="w-full max-w-[250px] rounded-2xl bg-white p-5 shadow-xl">
        <span
          className="inline-block rounded-full px-2.5 py-1 text-reg12"
          style={{ background: TAG_BG[planId], color: '#111827' }}
        >
          {label}
        </span>

        <div className="mt-3 space-y-2">
          <Row
            label="출발지점"
            value={startName}
          />
          <Row
            label="거리"
            value={`${distanceKm}km`}
          />
        </div>

        <p className="mt-4 text-center text-med16 text-black">
          러닝을 시작할까요?
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-9 rounded-[8px] bg-main3 text-white text-sem14 "
            onClick={onStart}
          >
            시작
          </button>
          <button
            className="h-9 rounded-[8px] border border-gray3 bg-white text-black text-sem14 "
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-[64px] text-med14 text-black">{label}</div>
      <div className="flex-1 text-sem16 text-black">{value}</div>
    </div>
  );
}
