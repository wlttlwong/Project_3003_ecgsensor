// app/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
    name: string;
    age?: number;
    stressTriggers?: string[];
    goals?: string;
}

export const useUserStore = create<
    UserProfile & {
        setName: (name: string) => void;
        updateProfile: (data: Partial<UserProfile) => void;
    }
>()(
    persist(
        (set) => ({
            name: '',
            age: undefined,
            stressTriggers: [],
            goals: '',

            setName: (name: string) => set({ name: name.trim() }),

            updateProfile: (data) => set((state) => ({ ...state, ...data }))
        }),
        {
            name: 'stressguard-user-profile', 
        }
    )
);