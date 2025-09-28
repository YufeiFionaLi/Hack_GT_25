-- Add user information columns to existing readings table
-- Run this SQL in your Supabase SQL editor

-- Add user information columns to the readings table
ALTER TABLE readings 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS insurance TEXT,
ADD COLUMN IF NOT EXISTS symptoms TEXT;

-- Add an index for better query performance on user data
CREATE INDEX IF NOT EXISTS idx_readings_name ON readings(name);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at);

-- Optional: Add some sample data for testing
-- UPDATE readings SET name = 'John Doe', date_of_birth = '1990-01-15', insurance = 'Blue Cross Blue Shield' WHERE id = 1;
