import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanId = 'safe' | 'normal' | 'fast';

export type RunSummary = {
  startedAt: string; // ISO string
  totalKm: number; // 달린 총 거리 (km)
  avgPaceText: string; // 예: 5'30"
  durationText: string; // 예: 32:10
  plan: PlanId; // safe | normal | fast
  routeName: string; // 코스 이름
  routeDistanceKm: number; // 목표/코스 거리 (km)
  isFavorite: boolean; // 대략적인 힌트
};

type RunState = {
  summary: RunSummary | null;
  setSummary: (s: RunSummary) => void;
  clearSummary: () => void;
};

export const useRunStore = create<RunState>()(
  persist(
    (set) => ({
      summary: null,
      setSummary: (s) => set({ summary: s }),
      clearSummary: () => set({ summary: null }),
    }),
    { name: 'run-summary' }, // 필요 없으면 persist 제거
  ),
);
