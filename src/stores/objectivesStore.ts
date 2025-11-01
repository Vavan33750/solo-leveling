import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { Objective, CreateObjectiveInput, UpdateObjectiveInput } from '../types';

interface ObjectivesState {
  objectives: Objective[];
  loading: boolean;
  error: string | null;
  fetchObjectives: (userId: string) => Promise<void>;
  createObjective: (userId: string, input: CreateObjectiveInput) => Promise<void>;
  updateObjective: (id: string, updates: UpdateObjectiveInput) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;
  incrementProgress: (id: string, amount?: number) => Promise<void>;
}

export const useObjectivesStore = create<ObjectivesState>((set, get) => ({
  objectives: [],
  loading: false,
  error: null,

  fetchObjectives: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ objectives: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createObjective: async (userId: string, input: CreateObjectiveInput) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('objectives')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        objectives: [data, ...state.objectives],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateObjective: async (id: string, updates: UpdateObjectiveInput) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('objectives')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        objectives: state.objectives.map((obj) =>
          obj.id === id ? data : obj
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteObjective: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        objectives: state.objectives.filter((obj) => obj.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  incrementProgress: async (id: string, amount: number = 1) => {
    const { objectives, updateObjective } = get();
    const objective = objectives.find((obj) => obj.id === id);
    if (!objective) return;

    const newValue = Math.min(objective.current_value + amount, objective.target_value);
    await updateObjective(id, { current_value: newValue });
  },
}));