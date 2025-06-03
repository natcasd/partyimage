-- Simple Party App Schema
-- File: supabase/migrations/20240101000000_party_app_schema.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Sessions table (party sessions created by hosts)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Prompts table (submitted by partygoers)
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  prompt_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Images table (generated images)
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- API keys table
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, service_name)
);

-- Essential indexes only
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_prompts_session_id ON prompts(session_id);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_images_session_id ON images(session_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Simple policies
-- Sessions: Hosts manage their own, anyone can view active ones
CREATE POLICY "Hosts manage own sessions" ON sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active sessions" ON sessions FOR SELECT USING (is_active = true);

-- Prompts: Anyone can submit/view for active sessions, hosts can manage their sessions
CREATE POLICY "Anyone can submit prompts" ON prompts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sessions WHERE id = prompts.session_id AND is_active = true)
);
CREATE POLICY "Anyone can view prompts" ON prompts FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = prompts.session_id AND is_active = true)
);
CREATE POLICY "Hosts manage prompts in their sessions" ON prompts FOR ALL USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = prompts.session_id AND user_id = auth.uid())
);

-- Images: Anyone can view for active sessions, hosts can manage their sessions  
CREATE POLICY "Anyone can view images" ON images FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = images.session_id AND is_active = true)
);
CREATE POLICY "Hosts manage images in their sessions" ON images FOR ALL USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = images.session_id AND user_id = auth.uid())
);

-- API keys: Users manage their own
CREATE POLICY "Users manage own API keys" ON api_keys FOR ALL USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE prompts;
ALTER PUBLICATION supabase_realtime ADD TABLE images;
ALTER PUBLICATION supabase_realtime ADD TABLE api_keys;