/*
  # Add missing is_active column to testimonials table

  1. Changes
    - Add is_active column to testimonials table if it doesn't exist
    - Set default value to true
    - Update existing records to have is_active = true
*/

-- Add is_active column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Update existing records to have is_active = true
UPDATE testimonials SET is_active = true WHERE is_active IS NULL;