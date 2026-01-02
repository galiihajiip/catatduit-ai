-- CatatDuit AI Database Initialization Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE transaction_type AS ENUM ('expense', 'income', 'transfer');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    is_pro BOOLEAN DEFAULT FALSE,
    pro_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    color_hex VARCHAR(7) DEFAULT '#16A085',
    icon VARCHAR(50) DEFAULT 'wallet',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7) DEFAULT '#3498DB',
    icon VARCHAR(50) DEFAULT 'category',
    type transaction_type DEFAULT 'expense',
    is_system BOOLEAN DEFAULT TRUE
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    raw_input TEXT,
    ai_confidence DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics cache table
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL,
    total_income DECIMAL(15, 2) DEFAULT 0.00,
    total_expense DECIMAL(15, 2) DEFAULT 0.00,
    net_income DECIMAL(15, 2) DEFAULT 0.00,
    expense_ratio DECIMAL(5, 2) DEFAULT 0.00,
    saving_ratio DECIMAL(5, 2) DEFAULT 0.00,
    top_categories JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month)
);

-- Create indexes
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_analytics_cache_user_month ON analytics_cache(user_id, month);

-- Insert default categories
INSERT INTO categories (name, color_hex, icon, type, is_system) VALUES
    ('Makanan', '#E74C3C', 'restaurant', 'expense', TRUE),
    ('Transportasi', '#3498DB', 'directions_car', 'expense', TRUE),
    ('Tagihan', '#F39C12', 'receipt', 'expense', TRUE),
    ('Keperluan Rumah Tangga', '#9B59B6', 'home', 'expense', TRUE),
    ('Belanja', '#1ABC9C', 'shopping_bag', 'expense', TRUE),
    ('Hiburan', '#E91E63', 'movie', 'expense', TRUE),
    ('Kesehatan', '#00BCD4', 'medical_services', 'expense', TRUE),
    ('Pemasukan', '#16A085', 'attach_money', 'income', TRUE),
    ('Gaji', '#27AE60', 'work', 'income', TRUE),
    ('Bonus', '#2ECC71', 'card_giftcard', 'income', TRUE),
    ('Transfer', '#7F8C8D', 'swap_horiz', 'transfer', TRUE),
    ('Lainnya', '#95A5A6', 'more_horiz', 'expense', TRUE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_cache_updated_at
    BEFORE UPDATE ON analytics_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
