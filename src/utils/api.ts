import { supabase } from './supabase'

// Types
export interface Profile {
  id: string
  username: string | null
  level: number
  xp: number
  stats: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Objective {
  id: string
  user_id: string
  title: string
  description: string | null
  target_value: number
  current_value: number
  category: string | null
  deadline: string | null
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  user_id: string
  title: string
  description: string | null
  frequency: 'daily' | 'weekly' | 'monthly'
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Mission {
  id: string
  user_id: string
  title: string
  description: string | null
  xp_reward: number
  deadline: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  objective_id: string | null
  schedule_id: string | null
  created_at: string
  updated_at: string
}

export interface MissionHistory {
  id: string
  mission_id: string
  user_id: string
  action: 'created' | 'started' | 'completed' | 'failed' | 'updated'
  old_status: string | null
  new_status: string | null
  xp_gained: number
  notes: string | null
  created_at: string
}

// Profile API
export const profileApi = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Objectives API
export const objectivesApi = {
  async getObjectives(userId: string): Promise<Objective[]> {
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createObjective(objective: Omit<Objective, 'id' | 'created_at' | 'updated_at'>): Promise<Objective> {
    const { data, error } = await supabase
      .from('objectives')
      .insert(objective)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateObjective(id: string, updates: Partial<Objective>): Promise<Objective> {
    const { data, error } = await supabase
      .from('objectives')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteObjective(id: string): Promise<void> {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Schedules API
export const schedulesApi = {
  async getSchedules(userId: string): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createSchedule(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Missions API
export const missionsApi = {
  async getMissions(userId: string): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createMission(mission: Omit<Mission, 'id' | 'created_at' | 'updated_at'>): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .insert(mission)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteMission(id: string): Promise<void> {
    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Mission History API
export const missionHistoryApi = {
  async getMissionHistory(userId: string): Promise<MissionHistory[]> {
    const { data, error } = await supabase
      .from('mission_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createHistoryEntry(entry: Omit<MissionHistory, 'id' | 'created_at'>): Promise<MissionHistory> {
    const { data, error } = await supabase
      .from('mission_history')
      .insert(entry)
      .select()
      .single()

    if (error) throw error
    return data
  }
}