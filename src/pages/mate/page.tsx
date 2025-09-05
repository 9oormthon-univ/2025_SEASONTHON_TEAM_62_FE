import { useState, useEffect } from 'react';
import Post from '../../shared/components/post';
import api from '../../shared/apis/api';
import Input from '../../shared/components/input';
import { reverseGeocode } from '../../shared/lib/kakaoGeocoder';
import MainDropDown from './components/Dropdown/MainDropdown';
import FloatingActions from './components/FloatingButton';

export default function MatePage() {
  const [data, setData] = useState<any[]>([]);
  const [placeholder, setPlaceholder] = useState('내 위치 불러오는 중...');

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
        const crews = Array.isArray(res.data) ? res.data : [];
        setData(crews);
      } catch (err) {
        console.error(err);
        setData([]);
      }
    }

    setCurrentLocationPlaceholder();
    loadCrews();
  }, []);

  return (
    <div className="flex flex-col gap-1 justify-center">
      <Input
        value=""
        placeholder={placeholder}
        onChange={() => {}}
        onSubmit={() => {}}
      />
      <MainDropDown />
      {data.length === 0 ? (
        <div className="text-gray-500">모집 중인 메이트가 없어요.</div>
      ) : (
        data.map((crew: any) => (
          <Post
            key={crew.id}
            id={crew.id}
            level={crew.level}
            title={crew.title}
            distanceFromHere={crew.distanceFromHere}
            distance={crew.distance}
            pace={crew.pace}
            startTime={crew.startTime}
            tags={crew.tags || []}
            participants={crew.participants}
            maxParticipants={crew.maxParticipants}
          />
        ))
      )}
      <FloatingActions />
    </div>
  );
}
