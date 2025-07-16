-- Migration: Add inactiveReason column to accounts table
-- This column will store the reason why an account is inactive (ban reason, user deactivation, etc.)

ALTER TABLE accounts 
ADD COLUMN inactiveReason TEXT NULL;

-- Add comment to document the column purpose
ALTER TABLE accounts 
MODIFY COLUMN inactiveReason TEXT NULL 
COMMENT 'Reason for account inactivity - can be ban reason, user deactivation, or other causes'; 