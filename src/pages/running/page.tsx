import { useState } from 'react';
import { RunningBottomSheet } from './components/BottomSheet';
export default function RunningPage() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites');

  const handleClose = () => {
    setIsBottomSheetOpen(false);
  };

  return (
    <div className="p-4">
      러닝 페이지
      <RunningBottomSheet
        open={isBottomSheetOpen}
        onClose={handleClose}
      >
        <div className="p-4">
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`rounded-[20px] py-2 px-12 font-bold transition-colors duration-200 
                ${activeTab === 'favorites' ? 'border-2 border-main2 text-main2' : 'border-2 border-gray3 text-gray1'}`}
            >
              즐겨찾기
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`rounded-[20px] py-2 px-12 font-bold transition-colors duration-200 
                ${activeTab === 'recent' ? 'border-2 border-main2 text-main2' : 'border-2 border-gray3 text-gray1'}`}
            >
              최근 경로
            </button>
          </div>
          <div className="mt-4">
            {activeTab === 'favorites' && <div>즐겨찾기 리스트</div>}
            {activeTab === 'recent' && <div>최근 경로리스트</div>}
          </div>
        </div>
      </RunningBottomSheet>
    </div>
  );
}
