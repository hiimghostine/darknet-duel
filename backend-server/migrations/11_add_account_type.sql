-- Migration: Add account type column
-- Date: 2025-01-16
-- Description: Add 'type' column to accounts table to support user/mod/admin roles

-- Add the 'type' column with enum values and default to 'user'
ALTER TABLE accounts 
ADD COLUMN type ENUM('user', 'mod', 'admin') NOT NULL DEFAULT 'user' 
AFTER username;

-- Create an index on the type column for faster queries
CREATE INDEX idx_accounts_type ON accounts (type);

-- Update all existing accounts to have type 'user' (this is redundant due to DEFAULT but explicit for clarity)
UPDATE accounts SET type = 'user' WHERE type IS NULL;

-- Add a comment to document the column
ALTER TABLE accounts MODIFY COLUMN type ENUM('user', 'mod', 'admin') NOT NULL DEFAULT 'user' 
COMMENT 'Account type: user (default), mod (moderator), admin (administrator)'; 