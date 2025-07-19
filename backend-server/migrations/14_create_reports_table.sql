-- Migration: Create reports table for user reporting system
-- Date: 2025-01-16
-- Description: Create reports table to store user reports for profiles and chat messages

CREATE TABLE IF NOT EXISTS `reports` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `reporterId` varchar(36) NOT NULL COMMENT 'UUID of the user making the report',
  `reporteeId` varchar(36) NOT NULL COMMENT 'UUID of the user being reported',
  `reason` varchar(500) NOT NULL COMMENT 'Reason for the report',
  `content` text NULL COMMENT 'Content of the reported message or additional details',
  `reportType` enum('profile', 'chat') NOT NULL DEFAULT 'chat' COMMENT 'Type of report: profile or chat message',
  `status` enum('pending', 'reviewed', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending' COMMENT 'Status of the report',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  
  -- Indexes for performance
  INDEX `IDX_REPORTS_REPORTER` (`reporterId`),
  INDEX `IDX_REPORTS_REPORTEE` (`reporteeId`),
  INDEX `IDX_REPORTS_STATUS` (`status`),
  INDEX `IDX_REPORTS_TYPE` (`reportType`),
  INDEX `IDX_REPORTS_CREATED` (`createdAt`),
  
  -- Foreign key constraints
  CONSTRAINT `FK_reports_reporter` FOREIGN KEY (`reporterId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_reports_reportee` FOREIGN KEY (`reporteeId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE `reports` COMMENT = 'Stores user reports for profiles and chat messages'; 