import { useState, useEffect } from 'react';
import Post from '../../shared/components/post';
import InfoModal from './components/modal/infomodal';
import api from '../../shared/apis/api';
import Input from '../../shared/components/input';
import { reverseGeocode } from '../../shared/lib/kakaoGeocoder';
import MainDropDown from './components/Dropdown/MainDropdown';
import FloatingActions from './components/FloatingButton';
import { formatTime } from '../../shared/lib/dateFormat';

function mapSafetyLevel(s: unknown): '안전' | '보통' | '최단' {
  const v = String(s ?? '')
    .toLowerCase()
    .trim();
  if (['safe', '안전', 'low', 'easy'].includes(v)) return '안전';
  if (['shortest', '최단', 'short', 'fast'].includes(v)) return '최단';
  return '보통';
}

export default function MatePage() {
  const [data, setData] = useState<any[]>([]);
  const [placeholder, setPlaceholder] = useState('내 위치 불러오는 중...');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    async function setCurrentLocationPlaceholder() {
      if (!('geolocation' in navigator)) {
        setPlaceholder('위치 서비스를 사용할 수 없어요');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const addr = await reverseGeocode(coords.latitude, coords.longitude);
          setPlaceholder(addr ?? '현재 위치를 불러올 수 없어요');
        },
        () => {
          setPlaceholder('위치 권한이 필요해요');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    }

    async function loadCrews() {
      try {
        const res = await api.get('/api/test/crews');
        const crews = Array.isArray(res.data?.crews) ? res.data.crews : [];
        console.log('✅ 응답 성공:', res.status, res.data);

        const mapped = crews.map((c: any) => ({
          ...c,
          startTime: formatTime(c.startTime),
          level: mapSafetyLevel(c.safetyLevel),
          tags: Array.isArray(c.tags) ? c.tags : [],
        }));

        setData(mapped);
      } catch (err) {
        console.error('❌ 요청 실패:', err);
        setData([]);
      }
    }

    setCurrentLocationPlaceholder();
    loadCrews();
  }, []);

  const handleOpen = (crew: any) => {
    setSelected(crew);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-1 justify-center">
      <Input
        value=""
        placeholder={placeholder}
        onChange={() => {}}
        onSubmit={() => {}}
      />
      <MainDropDown />

      <div className="flex flex-col px-4 gap-1">
        {data.length === 0 ? (
          <div className="text-gray-500">모집 중인 메이트가 없어요.</div>
        ) : (
          data.map((crew: any) => (
            <Post
              key={crew.id}
              id={crew.id}
              level={crew.level}
              title={crew.startLocation}
              distanceFromHere={crew.durationMin}
              distance={crew.distanceKm}
              pace={crew.pace}
              startTime={crew.startTime}
              tags={crew.tags || []}
              participants={crew.currentParticipants}
              maxParticipants={crew.maxParticipants}
              onClick={() => handleOpen(crew)}
            />
          ))
        )}
      </div>
      <FloatingActions />
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative z-10 pointer-events-none flex items-center justify-center p-4 w-full h-full">
            <div className="pointer-events-auto relative">
              <button
                onClick={handleClose}
                aria-label="Close"
                className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              >
                ✕
              </button>

              <InfoModal
                level={selected.level}
                place={selected.startLocation}
                placedetail={selected.placedetail ?? selected.address ?? ''}
                distance={selected.distanceKm}
                pace={selected.pace}
                startTime={selected.startTime}
                participants={selected.currentParticipants}
                maxParticipants={selected.maxParticipants}
                tags={selected.tags || []}
                startLocation={selected.startLocation}
                onJoin={() => {
                  console.log('join', selected.id);
                  handleClose();
                }}
              />
            </div>
          </div>
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
