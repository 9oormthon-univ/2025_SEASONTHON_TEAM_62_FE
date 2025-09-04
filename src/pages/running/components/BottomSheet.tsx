import { useRef, useState } from 'react';

type RunningBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function RunningBottomSheet({
  open,
  children,
}: RunningBottomSheetProps) {
  const [currentHeight, setCurrentHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(250);
  const minHeight = 250;
  const maxHeight = 480;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startHeight.current = currentHeight;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaY = startY.current - e.touches[0].clientY;
    const newHeight = startHeight.current + deltaY;

    if (newHeight <= maxHeight && newHeight >= minHeight) {
      setCurrentHeight(newHeight);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (currentHeight > (minHeight + maxHeight) / 2) {
      setCurrentHeight(maxHeight);
    } else {
      setCurrentHeight(minHeight);
    }
  };

  return (
    <div
      className={[
        'fixed inset-0 z-[0] transition-opacity duration-300 flex justify-center items-end',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
    >
      <div className="relative w-full min-w-[375px] max-w-[430px] border-t border-gray2 rounded-t-[20px]">
        <div
          role="dialog"
          aria-modal="true"
          className={[
            'relative w-full pb-[calc(env(safe-area-inset-bottom)+12px)]',
            'rounded-t-[20px] bg-white pt-1',
            'transform transition-transform duration-300',
            open ? 'translate-y-0' : 'translate-y-full',
          ].join(' ')}
          style={{
            height: `${currentHeight}px`,
            transition: isDragging ? 'none' : 'height 0.3s ease-in-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 mt-3 bg-gray1/30 rounded-full mx-auto mb-3 cursor-grab" />
          <div className="h-full overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
