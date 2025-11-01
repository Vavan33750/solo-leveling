import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { UserProfile } from '../types';

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  updateStats: (stat: keyof UserProfile['stats'], value: number) => Promise<void>;
  calculateLevel: (xp: number) => number;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        level: data.level || 1,
        xp: data.xp || 0,
        stats: data.stats || { strength: 0, intelligence: 0, motivation: 0 },
      };

      set({ profile, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { profile } = get();
    if (!profile) return;

    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      set({
        profile: { ...profile, ...updates },
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addXP: async (amount: number) => {
    const { profile, updateProfile, calculateLevel } = get();
    if (!profile) return;

    const newXP = profile.xp + amount;
    const newLevel = calculateLevel(newXP);

    if (newLevel > profile.level) {
      // Level up occurred
      const statKeys: (keyof UserProfile['stats'])[] = ['strength', 'intelligence', 'motivation'];
      const randomStat = statKeys[Math.floor(Math.random() * statKeys.length)];
      const newStats = { ...profile.stats, [randomStat]: profile.stats[randomStat] + 1 };
      await updateProfile({ level: newLevel, xp: newXP, stats: newStats });
      // TODO: Trigger level up notification and animation
    } else {
      await updateProfile({ xp: newXP });
    }
  },

  updateStats: async (stat: keyof UserProfile['stats'], value: number) => {
    const { profile, updateProfile } = get();
    if (!profile) return;

    const newStats = { ...profile.stats, [stat]: value };
    await updateProfile({ stats: newStats });
  },

  calculateLevel: (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1,
}));