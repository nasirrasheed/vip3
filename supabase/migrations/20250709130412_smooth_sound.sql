/*
  # Update testimonials table for review management

  1. Changes
    - Add status column for review approval workflow
    - Add submitted_at timestamp
    - Update policies for public review submission
*/

-- Add status column for review approval workflow
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'status'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN status text DEFAULT 'pending';
  END IF;
END $$;

-- Add submitted_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN submitted_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Update existing records to have approved status if they're active
UPDATE testimonials SET status = 'approved' WHERE is_active = true AND status = 'pending';

-- Add policy for public review submission
CREATE POLICY "Public can submit testimonials"
  ON testimonials FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add policy for authenticated users to update testimonial status
CREATE POLICY "Authenticated users can update testimonial status"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (true);