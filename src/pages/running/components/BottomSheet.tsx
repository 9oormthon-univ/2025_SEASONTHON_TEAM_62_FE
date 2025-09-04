import { useEffect, useRef, useState } from 'react';

type RunningBottomSheetProps = {
  open: boolean;
  children: React.ReactNode;
  onInteractStart?: () => void;
  onInteractEnd?: () => void;
  dragZoneHeight?: number;
};

export function RunningBottomSheet({
  open,
  children,
  onInteractStart,
  onInteractEnd,
  dragZoneHeight = 35,
}: RunningBottomSheetProps) {
  const [currentHeight, setCurrentHeight] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(280);

  const minHeight = 280;
  const maxHeight = 480;

  const beginDrag = (clientY: number) => {
    setIsDragging(true);
    startY.current = clientY;
    startHeight.current = currentHeight;
    onInteractStart?.();
  };

  const updateDrag = (clientY: number, e?: Event) => {
    if (!isDragging) return;
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const deltaY = startY.current - clientY;
    const newHeight = startHeight.current + deltaY;

    if (newHeight <= maxHeight && newHeight >= minHeight) {
      setCurrentHeight(newHeight);
    }
  };

  const endDrag = (e?: Event) => {
    if (!isDragging) return;
    e?.preventDefault?.();
    e?.stopPropagation?.();

    setIsDragging(false);
    onInteractEnd?.();

    if (currentHeight > (minHeight + maxHeight) / 2) {
      setCurrentHeight(maxHeight);
    } else {
      setCurrentHeight(minHeight);
    }
  };

  useEffect(() => {
    const onMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return;
      if ('touches' in e) {
        updateDrag(e.touches[0].clientY, e);
      } else {
        updateDrag((e as MouseEvent).clientY, e);
      }
    };
    const onEnd = (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return;
      endDrag(e);
    };

    if (isDragging) {
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd, { passive: false });
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    }
    return () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
    };
  }, [isDragging, currentHeight]);

  const onDragTouchStart = (e: React.TouchEvent) => {
    beginDrag(e.touches[0].clientY);
  };
  const onDragMouseDown = (e: React.MouseEvent) => {
    beginDrag(e.clientY);
  };

  return (
    <div
      className={[
        'fixed inset-0 z-[0] flex items-end justify-center transition-opacity duration-300',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      style={{ pointerEvents: 'none' }}
    >
      <div className="relative w-full min-w-[375px] max-w-[430px] rounded-t-[20px] border-t border-gray2">
        <div
          role="dialog"
          aria-modal="true"
          className={[
            'relative w-full rounded-t-[20px] bg-white',
            'pb-[calc(env(safe-area-inset-bottom)+12px)]',
            'transform transition-transform duration-300',
            open ? 'translate-y-0' : 'translate-y-full',
            'pointer-events-auto',
          ].join(' ')}
          style={{
            height: `${currentHeight}px`,
            transition: isDragging ? 'none' : 'height 0.3s ease-in-out',
            touchAction: 'pan-y',
          }}
        >
          <div
            className="relative w-full"
            style={{
              height: dragZoneHeight,
              touchAction: 'none',
              userSelect: 'none',
            }}
            onTouchStart={onDragTouchStart}
            onMouseDown={onDragMouseDown}
          >
            <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-gray1/30" />
          </div>

          <div
            className="h-[calc(100%-var(--drag-zone))] overflow-y-auto"
            style={{ ['--drag-zone' as any]: `${dragZoneHeight}px` }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
