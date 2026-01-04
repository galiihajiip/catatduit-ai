-- Migration: Add receipt_image_path to transactions table
-- Date: 2025-01-05
-- Description: Support for OCR receipt scanner feature

-- Add receipt_image_path column
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS receipt_image_path VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_image 
ON transactions(receipt_image_path) 
WHERE receipt_image_path IS NOT NULL;

-- Add comment
COMMENT ON COLUMN transactions.receipt_image_path IS 'Path to uploaded receipt image file';
