CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'in', -- 'in' or 'out'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
