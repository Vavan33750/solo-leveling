export interface UserProfile {
  id: string;
  username?: string;
  level: number;
  xp: number;
  stats: {
    strength: number;
    intelligence: number;
    motivation: number;
  };
}

export interface Objective {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  category?: string;
  deadline?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  target_value: number;
  category?: string;
  deadline?: string;
}

export interface CreateScheduleInput {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date?: string;
}

export interface UpdateObjectiveInput extends Partial<CreateObjectiveInput> {
  current_value?: number;
  status?: 'active' | 'completed' | 'paused';
}

export interface UpdateScheduleInput extends Partial<CreateScheduleInput> {
  is_active?: boolean;
}

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'sport' | 'studies' | 'routine';
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  objective_id?: string;
  schedule_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionHistory {
  id: string;
  mission_id: string;
  user_id: string;
  action: 'created' | 'started' | 'completed' | 'failed' | 'updated';
  old_status?: string;
  new_status?: string;
  xp_gained: number;
  notes?: string;
  created_at: string;
}

export interface CreateMissionInput {
  title: string;
  description?: string;
  category: 'sport' | 'studies' | 'routine';
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  deadline?: string;
  objective_id?: string;
  schedule_id?: string;
}

export interface UpdateMissionInput extends Partial<CreateMissionInput> {
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}