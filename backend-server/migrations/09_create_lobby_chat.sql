-- Migration: Create lobby_chat table for chat messages
-- Date: 2024-12-19

-- Create lobby_chat table
CREATE TABLE IF NOT EXISTS `lobby_chat` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `chatId` varchar(255) NOT NULL,
  `senderUuid` varchar(36) NOT NULL,
  `messageContent` text NOT NULL,
  `messageType` varchar(50) NOT NULL DEFAULT 'user',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `metadata` json DEFAULT NULL,
  
  -- Indexes for performance
  INDEX `IDX_CHAT_TIMESTAMP` (`chatId`, `createdAt`),
  INDEX `IDX_SENDER` (`senderUuid`),
  INDEX `IDX_NOT_DELETED` (`isDeleted`),
  
  -- Foreign key constraint (optional, assuming accounts table exists)
  CONSTRAINT `FK_lobby_chat_sender` FOREIGN KEY (`senderUuid`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE `lobby_chat` COMMENT = 'Stores chat messages for lobby and pre-game communication'; 