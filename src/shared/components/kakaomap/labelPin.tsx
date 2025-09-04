import { CustomOverlayMap } from 'react-kakao-maps-sdk';

type LabelPinProps = {
  lat: number;
  lng: number;
  text: string;
  bg?: string;
  color?: string;
  zIndex?: number;
};

export default function LabelPin({
  lat,
  lng,
  text,
  bg = '#6043AE',
  color = '#ffffff',
  zIndex = 5,
}: LabelPinProps) {
  return (
    <CustomOverlayMap
      position={{ lat, lng }}
      zIndex={zIndex}
    >
      <div style={{ position: 'relative', pointerEvents: 'none' }}>
        <span
          className="label-pin"
          style={
            {
              '--pin-bg': bg,
              '--pin-fg': color,
            } as React.CSSProperties
          }
        >
          {text}
        </span>
      </div>

      <style>{`
        .label-pin {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          min-width: 50px;
          height: 28px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
          color: var(--pin-fg);
          background: var(--pin-bg);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          /* 말풍선의 '꼭짓점'이 좌표에 오도록 위치 보정 */
          transform: translate(-50%, calc(-100% - 6px));
        }
        /* 아래 삼각형 포인터 */
        .label-pin::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 100%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 10px solid var(--pin-bg);
        }
      `}</style>
    </CustomOverlayMap>
  );
}
