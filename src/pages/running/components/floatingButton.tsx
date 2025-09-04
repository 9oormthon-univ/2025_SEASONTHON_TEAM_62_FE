import IcSvgLeftArrow from '../../../shared/icons/ic_leftarrow';

type Props = {
  onClick?: () => void;
  className?: string;
};

export default function FloatingBackButton({ onClick, className = '' }: Props) {
  const handleClick = () => {
    if (onClick) return onClick();
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  return (
    <button
      aria-label="뒤로가기"
      onClick={handleClick}
      className={[
        'w-10 h-10 rounded-full bg-white border-1 border-gray1 shadow-xl',
        'flex items-center justify-center',
        'transition active:scale-95 0',
        className,
      ].join(' ')}
      style={{ pointerEvents: 'auto' }}
    >
      <IcSvgLeftArrow
        height={18}
        width={18}
      />
    </button>
  );
}
