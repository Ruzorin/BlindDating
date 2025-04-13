import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

interface ProfileState {
  badges: string[];
  matchScore: number;
  isOnline: boolean;
  currentMatch: string | null;
  setBadges: (badges: string[]) => void;
  setMatchScore: (score: number) => void;
  setOnlineStatus: (status: boolean) => void;
  setCurrentMatch: (matchId: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  badges: [],
  matchScore: 0,
  isOnline: false,
  currentMatch: null,
  setBadges: (badges) => set({ badges }),
  setMatchScore: (score) => set({ matchScore: score }),
  setOnlineStatus: (status) => set({ isOnline: status }),
  setCurrentMatch: (matchId) => set({ currentMatch: matchId }),
}));