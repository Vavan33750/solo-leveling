import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { Schedule, CreateScheduleInput, UpdateScheduleInput } from '../types';

interface SchedulesState {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: (userId: string) => Promise<void>;
  createSchedule: (userId: string, input: CreateScheduleInput) => Promise<void>;
  updateSchedule: (id: string, updates: UpdateScheduleInput) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
}

export const useSchedulesStore = create<SchedulesState>((set, get) => ({
  schedules: [],
  loading: false,
  error: null,

  fetchSchedules: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ schedules: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createSchedule: async (userId: string, input: CreateScheduleInput) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        schedules: [data, ...state.schedules],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateSchedule: async (id: string, updates: UpdateScheduleInput) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        schedules: state.schedules.map((schedule) =>
          schedule.id === id ? data : schedule
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteSchedule: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        schedules: state.schedules.filter((schedule) => schedule.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  toggleSchedule: async (id: string) => {
    const { schedules, updateSchedule } = get();
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) return;

    await updateSchedule(id, { is_active: !schedule.is_active });
  },
}));