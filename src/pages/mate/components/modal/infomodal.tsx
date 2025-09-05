import SearchStart from '../../../../shared/components/kakaomap/searchStart';
import IcSvgVector from '../../../../shared/icons/ic_vector';

interface InfoModalProps {
  level: '안전' | '보통' | '최단';
  place: string;
  placedetail: string;
  distance: string;
  pace: string;
  startTime: string;
  participants: number;
  maxParticipants: number;
  tags: string[];
  startLocation: string;
  onJoin?: () => void;
}

function mapSafetyLevel(s: unknown): '안전' | '보통' | '최단' {
  const v = String(s ?? '')
    .toLowerCase()
    .trim();
  if (['safe', '안전', 'low', 'easy'].includes(v)) return '안전';
  if (['shortest', '최단', 'short', 'fast'].includes(v)) return '최단';
  return '보통';
}

const levelStyleMap: Record<InfoModalProps['level'], string> = {
  안전: 'bg-safe text-black',
  보통: 'bg-yellow-100 text-black',
  최단: 'bg-blue-100 text-black',
};

const InfoModal = ({
  level,
  place,
  placedetail,
  distance,
  pace,
  startTime,
  participants,
  maxParticipants,
  tags,
  startLocation,
  onJoin,
}: InfoModalProps) => {
  const safeLevel = mapSafetyLevel(level);
  const isFull = participants >= maxParticipants;

  return (
    <div className="flex flex-col w-60  px-4 rounded-[8px] pt-8 bg-white shadow-xl overflow-hidden">
      <div className="w-full h-pull">
        <SearchStart
          showSearch={false}
          heightPx={160}
          initialQuery={startLocation} // ⬅︎ 여기! startLocation 대신 initialQuery로 전달
        />
      </div>
      <div className="pt-2">
        <span
          className={`inline-flex rounded-[8px] px-2 py-1 text-xs ${levelStyleMap[safeLevel]}`}
        >
          {safeLevel}
        </span>
      </div>
      <div className="pb-1.5">
        <span className="block text-lg font-semibold">{place}</span>
        <span className="flex gqp-1 block text-xs text-gray-500">
          <IcSvgVector
            width={12}
            height={12}
            color="text-gray1"
          />
          {placedetail}
        </span>
      </div>
      <div className="pb-2.5 text-sm">
        <div>
          <span className="text-black">거리 </span>
          <span className="text-main1">{distance}</span>
          <span className="text-black"> 페이스 </span>
          <span className="text-main1">{pace}</span>
        </div>
        <div>
          <span className="text-black">시작 </span>
          <span className="text-main1">{startTime}</span>
          <span className="text-black"> 모집 인원 </span>
          <span className="text-main1 tabular-nums">
            {participants}/{maxParticipants}
          </span>
        </div>
      </div>
      <div className="pb-2.5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[0.625rem] font-normal px-[0.5rem] py-[0.25rem] rounded-[8px] bg-gray2 text-gray1"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="px-4 mt-auto pb-4">
        <button
          className={`w-full h-10 rounded-[8px] font-semibold ${
            isFull
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-main2 text-white'
          }`}
          onClick={onJoin}
          disabled={isFull}
        >
          {isFull ? '모집 마감' : '채팅 참여하기'}
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
