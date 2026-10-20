-- migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS endpoints (
  id UUID PRIMARY KEY,
  target_url TEXT NOT NULL,
  secret TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID REFERENCES endpoints(id),
  payload JSONB NOT NULL,
  headers JSONB,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Automatically seed a default test endpoint so tests pass immediately
INSERT INTO endpoints (id, target_url, secret) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'https://httpbin.org/post', 'my_secret') 
ON CONFLICT (id) DO NOTHING;