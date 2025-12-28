-- Migration to add payment_reference column to the orders table

ALTER TABLE orders
ADD COLUMN payment_reference VARCHAR(255) UNIQUE;
