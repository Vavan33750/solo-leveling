-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Objectives policies
CREATE POLICY "Users can view their own objectives" ON objectives
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own objectives" ON objectives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives" ON objectives
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own objectives" ON objectives
  FOR DELETE USING (auth.uid() = user_id);

-- Schedules policies
CREATE POLICY "Users can view their own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" ON schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Missions policies
CREATE POLICY "Users can view their own missions" ON missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions" ON missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" ON missions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions" ON missions
  FOR DELETE USING (auth.uid() = user_id);

-- Mission history policies
CREATE POLICY "Users can view their own mission history" ON mission_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mission history" ON mission_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON objectives
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();