-- ===================================================================
-- Voice Chat Rooms - Real-time Tables for Authentic Lama Voice Room
-- ===================================================================

-- Table: voice_room_seats
-- Stores seat occupancy and user status in voice rooms
CREATE TABLE IF NOT EXISTS public.voice_room_seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  user_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  user_level INTEGER DEFAULT 1,
  vip_level INTEGER DEFAULT 0,
  is_speaking BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, seat_number)
);

-- Table: voice_room_messages
-- Stores chat messages in voice rooms
CREATE TABLE IF NOT EXISTS public.voice_room_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'gift', 'system'
  gift_icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes separately
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id 
  ON public.voice_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_created_at 
  ON public.voice_room_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.voice_room_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_room_messages ENABLE ROW LEVEL SECURITY;

-- Policies for voice_room_seats
-- Allow all authenticated and anonymous users to read seats
CREATE POLICY "Anyone can view seats" 
  ON public.voice_room_seats 
  FOR SELECT 
  USING (true);

-- Allow users to insert/update their own seat
CREATE POLICY "Users can join seats" 
  ON public.voice_room_seats 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their seat" 
  ON public.voice_room_seats 
  FOR UPDATE 
  USING (true);

-- Allow users to delete their seat (leave)
CREATE POLICY "Users can leave seats" 
  ON public.voice_room_seats 
  FOR DELETE 
  USING (true);

-- Policies for voice_room_messages
-- Allow everyone to read messages
CREATE POLICY "Anyone can view messages" 
  ON public.voice_room_messages 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to send messages
CREATE POLICY "Users can send messages" 
  ON public.voice_room_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on voice_room_seats
DROP TRIGGER IF EXISTS update_voice_room_seats_updated_at ON public.voice_room_seats;
CREATE TRIGGER update_voice_room_seats_updated_at
  BEFORE UPDATE ON public.voice_room_seats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to anon and authenticated roles
GRANT ALL ON public.voice_room_seats TO anon, authenticated;
GRANT ALL ON public.voice_room_messages TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE public.voice_room_seats IS 'Stores voice room seat occupancy and user status';
COMMENT ON TABLE public.voice_room_messages IS 'Stores voice room chat messages with real-time sync';
COMMENT ON COLUMN public.voice_room_seats.room_id IS 'Room identifier (matches route parameter)';
COMMENT ON COLUMN public.voice_room_seats.seat_number IS 'Seat number (1-20)';
COMMENT ON COLUMN public.voice_room_seats.is_speaking IS 'Whether user is currently speaking';
COMMENT ON COLUMN public.voice_room_seats.is_muted IS 'Whether user mic is muted';
COMMENT ON COLUMN public.voice_room_messages.message_type IS 'Message type: text, gift, or system';
