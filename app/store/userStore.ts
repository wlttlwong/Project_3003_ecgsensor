import { create } from 'zustand';

interface UserProfile {
  username: string;
  age: string;
  height: string;
  stressTrigger: string;
  goals: string;
}

interface UserStore extends UserProfile {
  // Updates the UI state immediately
  setUser: (data: Partial<UserProfile>) => void;
  
  // Sends the UI state to the team's demo-db.json
  syncWithServer: () => Promise<boolean>;
  
  // Grabs the data from demo-db.json to fill the UI
  loadFromServer: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  username: '',
  age: '',
  height: '',
  stressTrigger: '',
  goals: '',

  setUser: (data) => set((state) => ({ ...state, ...data })),

  syncWithServer: async () => {
    const state = get();
    const token = localStorage.getItem("token"); // From the team's login

    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        age: state.age,
        height: state.height,
        goals: state.goals,
        stressTrigger: state.stressTrigger,
      }),
    });
    return res.ok;
  },

  loadFromServer: async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/user/profile", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const { profile } = await res.json();
      set({
        username: profile.name,
        age: profile.age?.toString() || '',
        height: profile.height?.toString() || '',
        // Handle their array format vs your string format
        stressTrigger: Array.isArray(profile.stressTriggers) ? profile.stressTriggers[0] : '',
        goals: Array.isArray(profile.goals) ? profile.goals[0] : ''
      });
    }
  }
}));