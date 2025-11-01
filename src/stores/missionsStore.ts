import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { Mission, MissionHistory, CreateMissionInput, UpdateMissionInput, UserProfile, Objective, Schedule } from '../types';

interface MissionsState {
  missions: Mission[];
  missionHistory: MissionHistory[];
  loading: boolean;
  error: string | null;
  fetchMissions: (userId: string) => Promise<void>;
  fetchMissionHistory: (userId: string) => Promise<void>;
  createMission: (userId: string, input: CreateMissionInput) => Promise<void>;
  updateMission: (id: string, updates: UpdateMissionInput) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  markMissionComplete: (id: string) => Promise<void>;
  generateDailyMissions: (userId: string, profile: UserProfile, objectives: Objective[], schedules: Schedule[]) => Promise<void>;
  trackMissionHistory: (missionId: string, userId: string, action: MissionHistory['action'], oldStatus?: string, newStatus?: string, xpGained?: number, notes?: string) => Promise<void>;
}

const getDifficultyMultiplier = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 1.5;
    case 'hard': return 2;
  }
};

const getXPReward = (difficulty: 'easy' | 'medium' | 'hard', userLevel: number): number => {
  const baseXP = { easy: 10, medium: 26, hard: 51 };
  const levelMultiplier = 1 + (userLevel - 1) * 0.1;
  const difficultyMultiplier = getDifficultyMultiplier(difficulty);
  return Math.floor(baseXP[difficulty] * levelMultiplier * difficultyMultiplier);
};

const getMissionTemplates = (category: 'sport' | 'studies' | 'routine') => {
  const templates = {
    sport: [
      { title: 'Morning Run', description: 'Complete a 30-minute run', type: 'timed' },
      { title: 'Strength Training', description: 'Do 3 sets of push-ups and squats', type: 'repetition' },
      { title: 'Yoga Session', description: 'Practice yoga for 20 minutes', type: 'timed' },
      { title: 'Cardio Workout', description: 'Complete 45 minutes of cardio exercise', type: 'timed' },
      { title: 'Skill Building', description: 'Learn a new exercise technique', type: 'skill' },
    ],
    studies: [
      { title: 'Reading Session', description: 'Read for 45 minutes', type: 'timed' },
      { title: 'Practice Problems', description: 'Solve 20 math problems', type: 'repetition' },
      { title: 'Language Learning', description: 'Study vocabulary for 30 minutes', type: 'timed' },
      { title: 'Research Project', description: 'Work on research for 1 hour', type: 'timed' },
      { title: 'Skill Practice', description: 'Practice a new study technique', type: 'skill' },
    ],
    routine: [
      { title: 'Meal Prep', description: 'Prepare healthy meals for the day', type: 'task' },
      { title: 'Cleaning Routine', description: 'Clean your living space for 30 minutes', type: 'timed' },
      { title: 'Meditation', description: 'Meditate for 15 minutes', type: 'timed' },
      { title: 'Journaling', description: 'Write in your journal for 20 minutes', type: 'timed' },
      { title: 'Habit Building', description: 'Practice a new daily habit', type: 'skill' },
    ],
  };
  return templates[category];
};

const selectDifficulty = (userLevel: number, stats: UserProfile['stats']): 'easy' | 'medium' | 'hard' => {
  const totalStats = stats.strength + stats.intelligence + stats.motivation;
  const statLevel = totalStats / 30; // Assuming max stat is 10, total 30

  if (userLevel <= 3 || statLevel < 0.5) return 'easy';
  if (userLevel <= 7 || statLevel < 1.5) return 'medium';
  return 'hard';
};

const checkScheduleAvailability = (schedules: Schedule[]): boolean => {
  const now = new Date();
  const currentHour = now.getHours();

  // Check if any active schedule covers current time
  return schedules.some(schedule => {
    if (!schedule.is_active) return false;

    const startDate = new Date(schedule.start_date);
    const endDate = schedule.end_date ? new Date(schedule.end_date) : null;

    // Check date range
    if (now < startDate || (endDate && now > endDate)) return false;

    // For simplicity, assume schedules are active during typical daytime hours (8 AM - 8 PM)
    // In a real app, you'd parse the schedule details more thoroughly
    return currentHour >= 8 && currentHour <= 20;
  });
};

export const useMissionsStore = create<MissionsState>((set, get) => ({
  missions: [],
  missionHistory: [],
  loading: false,
  error: null,

  fetchMissions: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ missions: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMissionHistory: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('mission_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ missionHistory: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createMission: async (userId: string, input: CreateMissionInput) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        missions: [data, ...state.missions],
        loading: false,
      }));

      // Track history
      await get().trackMissionHistory(data.id, userId, 'created', undefined, 'pending');
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateMission: async (id: string, updates: UpdateMissionInput) => {
    set({ loading: true, error: null });
    try {
      const { missions } = get();
      const mission = missions.find((m) => m.id === id);
      if (!mission) return;

      const { data, error } = await supabase
        .from('missions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        missions: state.missions.map((m) =>
          m.id === id ? data : m
        ),
        loading: false,
      }));

      // Track history if status changed
      if (updates.status && updates.status !== mission.status) {
        await get().trackMissionHistory(id, mission.user_id, 'updated', mission.status, updates.status);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteMission: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        missions: state.missions.filter((m) => m.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  markMissionComplete: async (id: string) => {
    const { missions, updateMission } = get();
    const mission = missions.find((m) => m.id === id);
    if (!mission) return;

    await updateMission(id, { status: 'completed' });

    // Award XP to user profile
    const { useProfileStore } = await import('./profileStore');
    const profileStore = useProfileStore.getState();
    await profileStore.addXP(mission.xp_reward);

    // Track completion history
    await get().trackMissionHistory(id, mission.user_id, 'completed', mission.status, 'completed', mission.xp_reward);
  },

  generateDailyMissions: async (userId: string, profile: UserProfile, objectives: Objective[], schedules: Schedule[]) => {
    set({ loading: true, error: null });
    try {
      // Check schedule availability
      if (!checkScheduleAvailability(schedules)) {
        set({ loading: false });
        return;
      }

      const categories: ('sport' | 'studies' | 'routine')[] = ['sport', 'studies', 'routine'];
      const newMissions: CreateMissionInput[] = [];

      for (const category of categories) {
        const templates = getMissionTemplates(category);
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        const difficulty = selectDifficulty(profile.level, profile.stats);
        const xpReward = getXPReward(difficulty, profile.level);

        newMissions.push({
          title: randomTemplate.title,
          description: randomTemplate.description,
          category,
          difficulty,
          xp_reward: xpReward,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        });
      }

      // Create missions
      for (const missionInput of newMissions) {
        await get().createMission(userId, missionInput);
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  trackMissionHistory: async (missionId: string, userId: string, action: MissionHistory['action'], oldStatus?: string, newStatus?: string, xpGained: number = 0, notes?: string) => {
    try {
      const { error } = await supabase
        .from('mission_history')
        .insert({
          mission_id: missionId,
          user_id: userId,
          action,
          old_status: oldStatus,
          new_status: newStatus,
          xp_gained: xpGained,
          notes,
        });

      if (error) throw error;

      // Refresh history
      await get().fetchMissionHistory(userId);
    } catch (error: any) {
      console.error('Failed to track mission history:', error);
    }
  },
}));