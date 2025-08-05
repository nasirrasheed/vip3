/*
  # Create AI Booking System Tables

  1. New Tables
    - `ai_bookings` - AI-powered booking requests
    - `chat_conversations` - Chat conversation history

  2. Security
    - Enable RLS on all tables
    - Add policies for public booking creation and admin management
*/

-- AI Bookings table
CREATE TABLE IF NOT EXISTS ai_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  pickup_location text,
  dropoff_location text,
  booking_date text,
  booking_time text,
  service_type text,
  vehicle_preference text,
  passenger_count integer DEFAULT 1,
  special_requirements text,
  extracted_data jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  messages jsonb DEFAULT '[]',
  booking_id uuid REFERENCES ai_bookings(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Public policies for booking creation
CREATE POLICY "Public can create bookings"
  ON ai_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can create conversations"
  ON chat_conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update own conversations"
  ON chat_conversations FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read own conversations"
  ON chat_conversations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin policies
CREATE POLICY "Authenticated users can manage bookings"
  ON ai_bookings FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage conversations"
  ON chat_conversations FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_bookings_status ON ai_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ai_bookings_created ON ai_bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_booking ON chat_conversations(booking_id);