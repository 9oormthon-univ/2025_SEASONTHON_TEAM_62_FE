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
    if (dragY > 80) {
      onClose();
    }
    setDragY(0);
  };

  return (
    <div
      className={[
        'fixed inset-0 z-[100] transition-opacity duration-300',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
    >
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={[
          'absolute inset-x-0 bottom-0',
          'h-[420px] pb-[calc(env(safe-area-inset-bottom)+12px)]',
          'rounded-t-[20px] bg-white ',
          'transform transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{
          transform: open ? `translateY(${dragY}px)` : 'translateY(100%)',
          transition: dragY > 0 ? 'none' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1 bg-gray1/70 rounded-full mx-auto mt-3 mb-3" />
        {children}
        <div className="flex px-4 gap-[10px] py-4">
          <button
            onClick={onReset}
            className="w-[100px] rounded-[8px] py-3 text-sm bg-white border border-gray2 text-black"
          >
            초기화
          </button>
          <button
            onClick={onApply}
            className="flex-1 rounded-[8px] py-3 text-sm font-medium bg-main2 text-white"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
