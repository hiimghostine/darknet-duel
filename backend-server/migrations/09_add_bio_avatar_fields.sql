-- Migration: Add bio and avatar fields to accounts table
-- Run this migration to add the new bio and avatar columns

ALTER TABLE accounts 
ADD COLUMN bio VARCHAR(30) NULL COMMENT 'User bio, limited to 30 characters';

ALTER TABLE accounts 
ADD COLUMN avatar LONGBLOB NULL COMMENT 'User avatar image data';

ALTER TABLE accounts 
ADD COLUMN avatarMimeType VARCHAR(100) NULL COMMENT 'MIME type of the avatar image'; 