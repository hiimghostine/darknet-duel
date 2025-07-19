-- Create logs table for security overview
CREATE TABLE IF NOT EXISTS logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId VARCHAR(36) NOT NULL,
    text TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create index for better performance on queries
CREATE INDEX idx_logs_userId ON logs(userId);
CREATE INDEX idx_logs_createdAt ON logs(createdAt); 