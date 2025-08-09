-- First, let's check if the column exists and remove the NOT NULL constraint if it does
ALTER TABLE participants ALTER COLUMN payment_amount DROP NOT NULL;

-- Then drop the column entirely
ALTER TABLE participants DROP COLUMN payment_amount;
