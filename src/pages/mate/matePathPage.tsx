import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IcSvgLeftArrow2 from '../../shared/icons/ic_leftarrow2';
import KakaoMapBasic from '../../shared/components/kakaomap/kakaomapBase';
import MateRouteSheet from './components/mateRouteSheet';

const MatePathPage = () => {
  const navigate = useNavigate();
  const [mm, setMm] = useState('');
  const [ss, setSs] = useState('');
  const [hh, setHh] = useState('');
  const [startMm, setStartMm] = useState('');
  const [participants, setParticipants] = useState('');

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center px-4 pt-[12px] pb-4 bg-white">
        <button
          aria-label="뒤로"
          className="grid h-9 w-9 place-items-center rounded-full"
          onClick={() => window.history.back()}
        >
          <IcSvgLeftArrow2 width={7} />
        </button>
        <div className="text-center">
          <h1 className="text-med18 pl-[5.5rem]">메이트 모집하기</h1>
        </div>
      </div>

      {/* 경로 버튼 */}
      <div>
        <p className="px-7 text-[18px] font-semibold">경로</p>
        <div className="w-full flex justify-center pt-2 pb-3 px-7">
          <button
            className="w-full py-1.5 bg-main2 text-white items-center font-semibold text-[14px] rounded-[8px]"
            onClick={() => navigate('/', { state: { hideBottom: true } })}
          >
            경로 찾기
          </button>
        </div>
      </div>

      {/* 지도 */}
      <div className="w-full h-[calc(100dvh-56px)]">
        <KakaoMapBasic />
      </div>

      {/* 입력 필드 */}
      <div className="px-7 py-3 space-y-2">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="페이스 분"
            value={mm}
            onChange={(e) => setMm(e.target.value)}
            className="border p-2 rounded w-20"
          />
          <input
            type="number"
            placeholder="페이스 초"
            value={ss}
            onChange={(e) => setSs(e.target.value)}
            className="border p-2 rounded w-20"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="시작 시"
            value={hh}
            onChange={(e) => setHh(e.target.value)}
            className="border p-2 rounded w-20"
          />
          <input
            type="number"
            placeholder="시작 분"
            value={startMm}
            onChange={(e) => setStartMm(e.target.value)}
            className="border p-2 rounded w-20"
          />
        </div>
        <input
          type="number"
          placeholder="참가 인원"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          className="border p-2 rounded w-32"
        />
      </div>

      {/* 바텀 시트 */}
      <MateRouteSheet
        safe="안전"
        place="경북대학교 정문"
        distance="5km"
        targetPace={{ mm: Number(mm) || 0, ss: Number(ss) || 0 }}
        startTime={{ hh: Number(hh) || 0, mm: Number(startMm) || 0 }}
        participants={Number(participants) || 0}
        onCreate={(data) => {
          // ✅ 입력받은 값만 출력/전송
          console.log('사용자가 입력한 값:', data);
        }}
      />
    </div>
  );
};

export default MatePathPage;
