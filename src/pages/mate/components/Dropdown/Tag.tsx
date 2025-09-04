import { useState, type ReactNode } from 'react';
import { IcSvgDropdown } from '../../../../shared/icons';
import { BottomSheet } from './BottomSheet';

type TagProps = {
  label: string;
  selected: boolean;
  onApply: () => void;
  onReset: () => void;
  children: ReactNode;
};

export function Tag({ label, selected, onApply, onReset, children }: TagProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={handleOpen}
        className={[
          'inline-flex items-center justify-center gap-1 rounded-full px-2 py-[6px] border transition-colors w-[74px]',
          selected
            ? 'bg-main2 text-white border-main2'
            : 'bg-white text-black border-gray2',
          'shadow-sm',
        ].join(' ')}
      >
        <span className="text-sm leading-none truncate">{label}</span>
        <IcSvgDropdown
          width={12}
          height={12}
        />
      </button>

      <BottomSheet
        open={open}
        onClose={handleClose}
        onApply={onApply}
        onReset={onReset}
      >
        {children}
      </BottomSheet>
    </>
  );
}
