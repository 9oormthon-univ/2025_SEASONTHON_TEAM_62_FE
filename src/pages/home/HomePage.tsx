import { useState } from 'react';
import Post from '../../shared/components/post';

export default function HomePage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isModalOpen = activeId !== null;
  return (
    <div className="p-4 space-y-4">
      <Post
        id="post-1"
        selected={activeId === 'post-1' && isModalOpen}
        onClick={() => setActiveId('post-1')}
        level="안전"
        title="경북대학교 정문"
        distanceFromHere="302m"
        distance="5km"
        pace="6'30/km"
        startTime="18:00"
        tags={['대학생', '취업준비중', '초보']}
        participants={1}
        maxParticipants={4}
      />
    </div>
  );
}
