-- Table to track processed webhook events to prevent replays and duplicates
CREATE TABLE IF NOT EXISTS processed_webhooks (
    event_id VARCHAR(255) PRIMARY KEY, -- Paystack's unique event ID
    provider VARCHAR(50) NOT NULL DEFAULT 'paystack',
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup (e.g., delete events older than 30 days)
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_created_at ON processed_webhooks(created_at);
