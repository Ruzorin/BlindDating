/*
  # Initial Schema Setup for Blind Dating App

  1. New Tables
    - profiles
      - id (uuid, references auth.users)
      - username (text, unique)
      - full_name (text)
      - avatar_url (text)
      - bio (text)
      - created_at (timestamp)
      - last_seen (timestamp)
      - is_verified (boolean)
      - is_admin (boolean)
      - preferences (jsonb)
      - badges (jsonb)
      
    - matches
      - id (uuid)
      - user1_id (uuid, references profiles)
      - user2_id (uuid, references profiles)
      - status (text)
      - created_at (timestamp)
      - ended_at (timestamp)
      - compatibility_score (float)
      
    - messages
      - id (uuid)
      - match_id (uuid, references matches)
      - sender_id (uuid, references profiles)
      - content (text)
      - created_at (timestamp)
      - is_read (boolean)
      
    - badges
      - id (uuid)
      - name (text)
      - description (text)
      - icon_url (text)
      - requirements (jsonb)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  is_verified boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  preferences jsonb DEFAULT '{}'::jsonb,
  badges jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES profiles NOT NULL,
  user2_id uuid REFERENCES profiles NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'ended')),
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  compatibility_score float CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches NOT NULL,
  sender_id uuid REFERENCES profiles NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

-- Create badges table
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon_url text NOT NULL,
  requirements jsonb DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Matches policies
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (user1_id, user2_id));

-- Messages policies
CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = messages.match_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id
      AND status = 'active'
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Badges policies
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- Create functions for real-time features
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_seen = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for last seen
CREATE TRIGGER on_auth_user_activity
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();

-- Create function to check match status
CREATE OR REPLACE FUNCTION check_active_match(user_id uuid)
RETURNS uuid AS $$
DECLARE
  active_match_id uuid;
BEGIN
  SELECT id INTO active_match_id
  FROM matches
  WHERE (user1_id = user_id OR user2_id = user_id)
    AND status = 'active'
    AND ended_at IS NULL
  LIMIT 1;
  
  RETURN active_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;