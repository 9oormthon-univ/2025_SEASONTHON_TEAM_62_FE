import api from '../shared/apis/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MeResponse = {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  runningStats?: unknown;
};

type UserState = {
  userId: any;
  profile: MeResponse | null;
  ready: boolean; // /me 호출 완료 여부
  hydrateUserFromMe: () => Promise<void>;
  clear: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      profile: null,
      ready: false,
      hydrateUserFromMe: async () => {
        try {
          const { data } = await api.get<MeResponse>('/api/user/me'); // 쿠키 기반
          set({
            userId: data.id ?? null,
            profile: data ?? null,
            ready: true,
          });
        } catch (error) {
          console.log('사용자 정보 로드 실패 (로그인되지 않음):', error);
          set({
            userId: null,
            profile: null,
            ready: true,
          });
        }
      },
      clear: () => set({ userId: null, profile: null, ready: true }),
    }),
    { name: 'user-store' }, // 로컬스토리지에 유지(선택)
  ),
);
