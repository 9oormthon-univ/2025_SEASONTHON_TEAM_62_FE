import { useRef, useState } from 'react';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onApply: () => void;
  onReset: () => void;
};
export function BottomSheet({
  open,
  onClose,
  children,
  onApply,
  onReset,
}: BottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) setDragY(deltaY);
  };
  const handleTouchEnd = () => {
    if (dragY > 80) onClose();
    setDragY(0);
  };

  return (
    <div
      className={[
        'fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
    >
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div className="relative w-full min-w-[375px] max-w-[430px]">
        <div
          role="dialog"
          aria-modal="true"
          className={[
            'relative w-full rounded-t-[20px] bg-white pt-1',
            'h-[240px] focus-within:h-[420px] max-h-[90svh]',
            'grid grid-rows-[auto,1fr,auto]',
            'transform transition-[height,transform] duration-300',
            open ? 'translate-y-0' : 'translate-y-full',
          ].join(' ')}
          style={{
            transform: open ? `translateY(${dragY}px)` : 'translateY(100%)',
            transition: dragY > 0 ? 'height 300ms' : undefined,
          }}
        >
          <div
            className="w-full select-none touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="mx-auto mb-3 mt-4 h-1 w-10 cursor-grab rounded-full bg-gray1/70" />
          </div>
          <div className="min-h-0 overflow-y-auto">{children}</div>

          <div className="flex gap-[10px] px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+12px)] s">
            <button
              onClick={onReset}
              className="w-[100px] rounded-[8px] border border-gray2 bg-white py-3 text-sm text-black"
            >
              초기화
            </button>
            <button
              onClick={onApply}
              className="flex-1 rounded-[8px] bg-main2 py-3 text-sm font-medium text-white"
            >
              적용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
