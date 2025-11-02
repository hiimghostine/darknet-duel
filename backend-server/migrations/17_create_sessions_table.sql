-- Create sessions table for session-based authentication
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NOT NULL,
  `lastActivity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ipAddress` varchar(45) DEFAULT NULL,
  `userAgent` text DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_expiresAt` (`expiresAt`),
  KEY `idx_isActive` (`isActive`),
  CONSTRAINT `fk_sessions_userId` FOREIGN KEY (`userId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

