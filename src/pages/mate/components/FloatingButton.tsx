import type { ReactNode } from 'react';
import { IcSvgPencil, IcSvgTalk } from '../../../shared/icons';

type FloatingButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  label?: string;
};
function FloatingButton({ children, onClick, label }: FloatingButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="h-12 w-12 rounded-full bg-main2 text-white flex items-center justify-center transition-transform active:scale-95"
    >
      {children}
    </button>
  );
}

export default function FloatingActions() {
  return (
    <div className="fixed inset-x-0 z-[5] bottom-[calc(76px+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto w-[375px] max-w-full px-2 flex flex-col items-end gap-2 pointer-events-auto">
        <FloatingButton label="채팅">
          <IcSvgTalk
            width={16.5}
            height={16.5}
          />
        </FloatingButton>

        <FloatingButton label="글쓰기">
          <IcSvgPencil
            width={20}
            height={20}
          />
        </FloatingButton>
      </div>
    </div>
  );
}
