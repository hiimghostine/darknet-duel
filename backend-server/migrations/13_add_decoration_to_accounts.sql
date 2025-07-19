-- Migration: Add decoration column to accounts table
-- This column stores the currently applied decoration ID

ALTER TABLE accounts 
ADD COLUMN decoration VARCHAR(100) NULL
COMMENT 'ID of the currently applied decoration';

-- Add index for quick lookups
CREATE INDEX idx_accounts_decoration ON accounts(decoration); 