CREATE TYPE gateway_provider_enum AS ENUM (
	'stripe', 'paystack', 'flutterwave'
);

CREATE TABLE transactions (
    transaction_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            INT NOT NULL REFERENCES orders(order_id),
    customer_id         UUID NOT NULL REFERENCES profiles(id),
    gateway_provider    gateway_provider_enum NOT NULL,
    gateway_reference   TEXT UNIQUE NOT NULL, -- TODO: Remember to migrate from "orders.payment_reference" to this.
    amount              BIGINT NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'NGN',
    status              TEXT NOT NULL CHECK (status IN ('initiated', 'processing', 'succeeded', 'failed', 'refunded')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
