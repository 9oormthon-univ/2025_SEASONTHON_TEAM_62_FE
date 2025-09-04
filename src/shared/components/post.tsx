interface PostProps {
  //id: string;
  selected?: boolean;
  onClick?: () => void;
  level: '안전' | '보통' | '최단';
  title: string;
  distanceFromHere: string;
  distance: string;
  pace: string;
  startTime: string;
  tags: string[];
  participants: number;
  maxParticipants: number;
  onJoin?: () => void;
}

const levelStyleMap: Record<PostProps['level'], string> = {
  안전: 'bg-safe text-black',
  보통: 'bg-yellow-100 text-black',
  최단: 'bg-blue-100 text-black',
};

const Post = ({
  //id,
  selected = false,
  onClick,
  level,
  title,
  distanceFromHere,
  distance,
  pace,
  startTime,
  tags,
  participants = 1,
  maxParticipants = 4,
}: PostProps) => {
  const infoList = [
    { label: '거리', value: distance },
    { label: '페이스', value: pace },
    { label: '시작', value: startTime },
  ];
  const cardBase =
    'flex flex-col w-full min-h-[6rem] gap-[0.375rem] rounded-[8px] bg-white transition-colors border';
  const cardWhenSelected = 'border-main3 bg-[#7155BE08]';
  const cardWhenIdle = 'border-gray2 hover:border-main3 hover:bg-[#7155BE08]';
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onClick}
      className={`${cardBase} ${selected ? cardWhenSelected : cardWhenIdle} pt-[0.75rem] pr-[0.5625rem] pb-[0.4375rem] pl-[1.25rem]`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
    >
      <div className="h-[1.56rem] flex gap-[0.5rem] items-center">
        <p
          className={` px-[0.375rem] py-[0.125rem] text-[0.75rem] font-normal rounded-[8px] ${levelStyleMap[level]}`}
        >
          {level}
        </p>
        <p className="font-medium text-[1.125rem] text-black">{title}</p>
        <p className="font-normal text-[0.75rem] text-gray1">
          {distanceFromHere}
        </p>
      </div>
      <div className="flex gap-[0.75rem]">
        {infoList.map((item) => (
          <p
            key={item.label}
            className="font-pretendard font-normal text-[0.75rem]"
          >
            <span className="text-black">{item.label} </span>
            <span className="text-main1">{item.value}</span>
          </p>
        ))}
      </div>
      <div className="flex justify-between">
        <div className="flex items-center h-[1.125rem] gap-[0.5rem]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[0.625rem] font-normal px-[0.5rem] py-[0.25rem] rounded-[8px] bg-gray2 text-gray1"
            >
              #{tag}
            </span>
          ))}
        </div>
        <button
          className="flex -mt-[0.5rem] gap-1 px-[0.5rem] py-[0.25rem] px-[0.5rem] bg-main3 text-white text-[0.75rem] font-semibold rounded-[8px]"
          onClick={() => {}}
        >
          <span>참여하기 </span>
          <span className="text-main2 opacity-80">|</span>
          <span className="tabular-nums">
            {participants}/{maxParticipants}
          </span>
        </button>
      </div>
    </div>
  );
};
export default Post;
