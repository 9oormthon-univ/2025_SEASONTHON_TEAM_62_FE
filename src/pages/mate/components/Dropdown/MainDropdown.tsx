import { useState } from 'react';
import { Tag } from './Tag';
import { IcSvgInputDelete } from '../../../../shared/icons';

export default function MainDropDown() {
  const [isDistanceSelected, setDistanceSelected] = useState(false);
  const [isPaceSelected, setPaceSelected] = useState(false);
  const [isTimeSelected, setTimeSelected] = useState(false);

  const [minDistance, setMinDistance] = useState('');
  const [maxDistance, setMaxDistance] = useState('');

  const handleMinDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setMinDistance(value);
    }
  };

  const handleMaxDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setMaxDistance(value);
    }
  };

  const clearDistance = () => {
    setMinDistance('');
    setMaxDistance('');
  };

  return (
    <div className="flex flex-row flex-wrap justify-left p-4 gap-3">
      <Tag
        label="거리"
        selected={isDistanceSelected}
        onApply={() => setDistanceSelected(true)}
        onReset={() => {
          setDistanceSelected(false);
          clearDistance();
        }}
      >
        <div className="px-4 pt-3 pb-">
          <p className="text-[18px] font-bold pl-3 text-black">거리</p>
          <div className="my-4 flex items-center justify-center space-x-2 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="0"
                className="w-[112px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left pr-8"
                value={minDistance}
                onChange={handleMinDistanceChange}
              />
              {minDistance && (
                <button
                  onClick={() => setMinDistance('')} // 첫 번째 입력값만 초기화
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <IcSvgInputDelete
                    width={16}
                    height={16}
                  />
                </button>
              )}
            </div>
            <span className="text-[14px] ">Km</span>
            <span className="text-[14px] mx-2">~</span>
            {/* 두 번째 입력란 (최대 거리) */}
            <div className="relative">
              <input
                type="text"
                placeholder="0"
                className="w-[112px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left pr-8"
                value={maxDistance}
                onChange={handleMaxDistanceChange}
              />
              {maxDistance && (
                <button
                  onClick={() => setMaxDistance('')} // 두 번째 입력값만 초기화
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <IcSvgInputDelete
                    width={16}
                    height={16}
                  />
                </button>
              )}
            </div>
            <span className="text-[14px]">Km</span>
          </div>
        </div>
      </Tag>

      <Tag
        label="페이스"
        selected={isPaceSelected}
        onApply={() => setPaceSelected(true)}
        onReset={() => setPaceSelected(false)}
      >
        <div className="px-4 pt-3">
          <p className="text-lg font-bold text-black">페이스</p>
          <div className="my-4 flex items-center justify-center space-x-2">
            <input
              type="text"
              placeholder="00"
              className="w-[42px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left "
            />
            <span className="text-[24px]">'</span>
            <input
              type="text"
              placeholder="00"
              className="w-[42px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left "
            />
            <span className="text-[24px]">"</span>
            <span className="text-[24px] mx-2">~</span>
            <input
              type="text"
              placeholder="00"
              className="w-[42px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left "
            />
            <span className="text-xl font-bold">'</span>
            <input
              type="text"
              placeholder="00"
              className="w-[42px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left "
            />
            <span className="text-[24px]">"</span>
          </div>
        </div>
      </Tag>
      <Tag
        label="시작"
        selected={isTimeSelected}
        onApply={() => setTimeSelected(true)}
        onReset={() => setTimeSelected(false)}
      >
        <div className="px-4 pt-3">
          <p className="text-lg font-bold text-black">시작</p>
          <div className="my-4 flex items-center justify-center space-x-2">
            <input
              type="text"
              placeholder="00"
              className="w-[42px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left "
            />
            <span className="text-[24px]">:</span>
            <input
              type="text"
              placeholder="00"
              className="w-[42px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left "
            />
            <span className="text-[24px] mx-2">~</span>
            <input
              type="text"
              placeholder="00"
              className="w-[42px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left "
            />
            <span className="text-xl font-bold">:</span>
            <input
              type="text"
              placeholder="00"
              className="w-[42px] h-9 px-3 rounded-md border border-gray-300 text-[14px] text-left "
            />
            <span className="text-[24px]">"</span>
          </div>
        </div>
      </Tag>
    </div>
  );
}
