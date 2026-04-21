import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  username: string | null;
  age: string;
  height: string;
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
        // 1. Initialize all fields with empty strings
        username: '',
        age: '',
        height: '',
        stressTrigger: '',
        goals: '',

        // 2. Setter uses a spread operator to merge new data
        setUser: (data) => set((state) => ({ ...state, ...data })),
        
        // 3. Reset all fields back to initial state
        resetUser: () => set({ 
            username: '', 
            age: '', 
            height: '',
            stressTrigger: '', 
            goals: '' }),
    }),
    {
      name: 'user-profile-storage', // Key used in localStorage
    }
  )
);