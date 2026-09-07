CREATE TYPE ledger_event AS ENUM ( 'ORDER_SETTLEMENT', 'PARTIAL_REFUND', 'REFUND', 'VENDOR_PAYOUT', 'PLATFORM_FEE_ADJUSTMENT');
CREATE TYPE financial_account_type AS ENUM ('ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE');
-- CREATE TYPE financial_account_name as ENUM ();

CREATE TABLE financial_accounts (
    account_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES profiles(id) ON DELETE RESTRICT, -- NULL for platform/system accounts!
    account_type    TEXT NOT NULL, -- 'ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE'
    name            TEXT NOT NULL, -- e.g., 'Vendor Pending Balance', 'Platform Commission Revenue'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Represents a finalized financial event
CREATE TABLE ledger_entries (
    entry_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id      UUID REFERENCES transactions(transaction_id) ON DELETE RESTRICT,
    order_id            INT REFERENCES orders(order_id) ON DELETE RESTRICT,
    event_type          ledger_event NOT NULL, 
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable accounting entries enforcing double-entry bookkeeping
CREATE TABLE ledger_lines (
    line_id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    entry_id            BIGINT NOT NULL REFERENCES ledger_entries(entry_id) ON DELETE RESTRICT,
    account_id          UUID NOT NULL REFERENCES financial_accounts(account_id),
    amount              BIGINT NOT NULL, -- Positive = Credit, Negative = Debit
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES for fast lookups
CREATE INDEX idx_ledger_lines_account_created ON ledger_lines(account_id, created_at DESC);
CREATE INDEX idx_ledger_lines_entry ON ledger_lines(entry_id);
CREATE INDEX idx_ledger_entries_transactions ON ledger_entries(transaction_id);

-- Ensure Immutability. Raise exception at each attempt to modify a row
CREATE OR REPLACE FUNCTION prevent_accounting_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger lines are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_ledger_lines
BEFORE UPDATE OR DELETE ON ledger_lines
FOR EACH ROW EXECUTE FUNCTION prevent_accounting_ledger_modification();

-- Deferred Double-Entry Zero Sum invariant. Ensures ledger balance always sums up to 0.
CREATE OR REPLACE FUNCTION verify_ledger_entry_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_total_balance BIGINT;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO v_total_balance
    FROM ledger_lines
    WHERE entry_id = NEW.entry_id;

    IF v_total_balance <> 0 THEN
        RAISE EXCEPTION 'Unbalanced ledger entry %: net sum is % (must be 0)', NEW.entry_id, v_total_balance;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Executed at COMMIT time to allow multi-line batch inserts within one transaction
CREATE CONSTRAINT TRIGGER trg_verify_ledger_balance
AFTER INSERT ON ledger_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION verify_ledger_entry_balance();
