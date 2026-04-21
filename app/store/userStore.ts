import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  username: string;
  age: number | string;
  stressTrigger: string;
  goals: string;
}

interface UserStore extends UserProfile {
  setUser: (data: Partial<UserProfile>) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      username: '',
      age: '',
      stressTrigger: '',
      goals: '',

      setUser: (data) => set((state) => ({ ...state, ...data })),
      
      resetUser: () => set({ username: '', age: '', stressTrigger: '', goals: '' }),
    }),
    {
      name: 'user-profile-storage', // Key used in localStorage
    }
  )
);