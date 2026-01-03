/*
  # Couple's Room System Database Schema

  1. New Tables
    - `users` - User profiles and authentication data
    - `rooms` - Voice chat rooms with admin control
    - `room_participants` - Users in rooms with mic status
    - `mic_requests` - Hand raise requests for mic access

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure proper access control for room management

  3. Features
    - Room creation and joining
    - Mic permission system (max 2 users)
    - Real-time updates via subscriptions
*/

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar text,
  created_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create room_participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  mic_status text NOT NULL DEFAULT 'none' CHECK (mic_status IN ('none', 'requested', 'granted')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, room_id)
);

-- Create mic_requests table
CREATE TABLE IF NOT EXISTS mic_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_requests ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Rooms policies
CREATE POLICY "Users can read active rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Room admins can update their rooms"
  ON rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Room participants policies
CREATE POLICY "Users can read room participants"
  ON room_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      WHERE rp.room_id = room_participants.room_id
      AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON room_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users and admins can update participant status"
  ON room_participants
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = room_participants.room_id
      AND r.admin_id = auth.uid()
    )
  );

-- Mic requests policies
CREATE POLICY "Users can read mic requests in their rooms"
  ON mic_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      WHERE rp.room_id = mic_requests.room_id
      AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create mic requests"
  ON mic_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Room admins can update mic requests"
  ON mic_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = mic_requests.room_id
      AND r.admin_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_admin_id ON rooms(admin_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_mic_requests_room_id ON mic_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_mic_requests_status ON mic_requests(status);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to clean up room when admin leaves
CREATE OR REPLACE FUNCTION handle_admin_leave()
RETURNS trigger AS $$
BEGIN
  -- If the leaving participant is the room admin, deactivate the room
  IF EXISTS (
    SELECT 1 FROM rooms r
    WHERE r.id = OLD.room_id
    AND r.admin_id = OLD.user_id
  ) THEN
    UPDATE rooms
    SET is_active = false
    WHERE id = OLD.room_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle admin leaving
DROP TRIGGER IF EXISTS on_admin_leave ON room_participants;
CREATE TRIGGER on_admin_leave
  AFTER DELETE ON room_participants
  FOR EACH ROW EXECUTE FUNCTION handle_admin_leave();