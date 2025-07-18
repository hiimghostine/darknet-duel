-- Migration: Create purchases table for store items
-- This table stores purchased decorations and other store items

CREATE TABLE purchases (
    id VARCHAR(36) PRIMARY KEY,
    accountId VARCHAR(36) NOT NULL,
    itemType ENUM('decoration') NOT NULL DEFAULT 'decoration',
    itemId VARCHAR(100) NOT NULL,
    purchasePrice INT NOT NULL,
    currency ENUM('creds', 'crypts') NOT NULL,
    purchasedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    
    -- Foreign key constraint
    CONSTRAINT fk_purchases_account FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE,
    
    -- Index for quick lookups
    INDEX idx_purchases_account (accountId),
    INDEX idx_purchases_item (itemType, itemId),
    
    -- Unique constraint to prevent duplicate purchases
    UNIQUE KEY unique_purchase (accountId, itemType, itemId)
)
COMMENT = 'Store purchases made by users'; 