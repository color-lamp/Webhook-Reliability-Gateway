
CREATE TABLE IF NOT EXISTS endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    target_url TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    event_type VARCHAR(255),
    idempotency_key VARCHAR(255),
    payload JSONB NOT NULL,
    headers JSONB,
    status VARCHAR(50) DEFAULT 'PENDING',
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 5,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

 
CREATE TABLE IF NOT EXISTS delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    response_status INT,
    response_body TEXT,
    error_message TEXT,
    execution_time_ms INT,
    attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


