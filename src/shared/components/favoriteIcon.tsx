
import { useEffect, useState } from 'react';
import { IcSvgEmptyHeart, IcSvgHeart } from '../icons';

type Props = {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
};

export function FavoriteIcon({
  checked,
  onChange,
  disabled,
  className,
  ...rest
}: Props) {
  const isControlled = typeof checked === 'boolean';
  const [internal, setInternal] = useState<boolean>(!!checked);

  useEffect(() => {
    if (isControlled) setInternal(!!checked);
  }, [isControlled, checked]);

  const isOn = isControlled ? !!checked : internal;

  const handleClick = () => {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // 카드 클릭 방지
        handleClick();
      }}
      disabled={disabled}
      className={className}
      {...rest}
    >
      {isOn ? (
        <IcSvgHeart
          width={22}
          height={22}
        />
      ) : (
        <IcSvgEmptyHeart
          width={22}
          height={22}
        />
      )}
    </button>
  );
}
