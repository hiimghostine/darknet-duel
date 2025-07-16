-- Migration: Add missing fields to accounts table
-- This adds bio, avatar, avatarMimeType, creds, and crypts columns

ALTER TABLE accounts 
ADD COLUMN bio VARCHAR(30) NULL COMMENT 'User bio, limited to 30 characters';

ALTER TABLE accounts 
ADD COLUMN avatar LONGBLOB NULL COMMENT 'User avatar image data';

ALTER TABLE accounts 
ADD COLUMN avatarMimeType VARCHAR(100) NULL COMMENT 'MIME type of the avatar image';

ALTER TABLE accounts 
ADD COLUMN creds INT NOT NULL DEFAULT 0 COMMENT 'User credits/currency';

ALTER TABLE accounts 
ADD COLUMN crypts INT NOT NULL DEFAULT 0 COMMENT 'User crypts/premium currency'; 