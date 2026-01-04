-- CatatDuit AI - Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_pro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    color_hex TEXT DEFAULT '#16A085',
    icon TEXT DEFAULT 'wallet',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color_hex TEXT DEFAULT '#3498DB',
    icon TEXT DEFAULT 'category',
    type TEXT DEFAULT 'expense'
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    type TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    raw_input TEXT,
    ai_confidence DECIMAL(3,2),
    receipt_image_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(wallet_id UUID, amount_change DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE wallets SET balance = balance + amount_change WHERE id = wallet_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default categories
INSERT INTO categories (name, color_hex, icon, type) VALUES
    ('Makanan', '#E74C3C', 'utensils', 'expense'),
    ('Transportasi', '#3498DB', 'car', 'expense'),
    ('Tagihan', '#F39C12', 'file-text', 'expense'),
    ('Keperluan Rumah Tangga', '#9B59B6', 'home', 'expense'),
    ('Belanja', '#1ABC9C', 'shopping-bag', 'expense'),
    ('Hiburan', '#E91E63', 'film', 'expense'),
    ('Kesehatan', '#00BCD4', 'heart', 'expense'),
    ('Pemasukan', '#16A085', 'dollar-sign', 'income'),
    ('Gaji', '#27AE60', 'briefcase', 'income'),
    ('Lainnya', '#7F8C8D', 'more-horizontal', 'expense')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for service key, restrict for anon)
CREATE POLICY "Allow all for service" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for service" ON wallets FOR ALL USING (true);
CREATE POLICY "Allow all for service" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow read categories" ON categories FOR SELECT USING (true);
