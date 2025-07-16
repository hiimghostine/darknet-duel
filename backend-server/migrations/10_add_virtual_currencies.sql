-- Migration: Add virtual currencies to accounts table
-- Date: 2025-01-14
-- Description: Add Creds and Crypts virtual currencies with default values of 0

ALTER TABLE accounts 
ADD COLUMN creds INT DEFAULT 0 NOT NULL,
ADD COLUMN crypts INT DEFAULT 0 NOT NULL;

-- Add indexes for performance on currency queries
CREATE INDEX idx_accounts_creds ON accounts(creds);
CREATE INDEX idx_accounts_crypts ON accounts(crypts);

-- Update existing accounts to have 0 currencies (in case there are existing accounts)
UPDATE accounts SET creds = 0, crypts = 0 WHERE creds IS NULL OR crypts IS NULL; 