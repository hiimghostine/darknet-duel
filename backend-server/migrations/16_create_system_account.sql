-- Migration: Create system account for logging
-- Date: 2025-01-16
-- Description: Creates a system account that can be used for system-level logs

-- Insert system account for logging purposes
INSERT INTO `accounts` (
    `id`,
    `email`,
    `username`,
    `password`,
    `type`,
    `isActive`,
    `gamesPlayed`,
    `gamesWon`,
    `gamesLost`,
    `rating`,
    `creds`,
    `crypts`,
    `createdAt`,
    `updatedAt`
) VALUES (
    'system',
    'system@darknet-duel.com',
    'System',
    '$2b$10$systemaccountpasswordhash', -- This is a placeholder hash
    'admin',
    0, -- Inactive
    0,
    0,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    `username` = 'System',
    `type` = 'admin',
    `isActive` = 0;

-- Add comment to explain the system account
ALTER TABLE `accounts` COMMENT = 'System account (id: system) is used for system-level logging'; 