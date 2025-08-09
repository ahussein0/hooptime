-- Remove payment_amount column from participants table
ALTER TABLE participants DROP COLUMN IF EXISTS payment_amount;
