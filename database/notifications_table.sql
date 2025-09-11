-- Notifications table to store business Google Review link
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    google_review_link VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_business_id (business_id),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
);

-- Insert default notification records for existing businesses
INSERT INTO notifications (business_id, google_review_link)
SELECT 
    id as business_id,
    NULL as google_review_link
FROM businesses
WHERE NOT EXISTS (
    SELECT 1 FROM notifications WHERE notifications.business_id = businesses.id
);
