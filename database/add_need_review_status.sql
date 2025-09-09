-- Migration to add 'need review' status to estimates table
-- This adds 'need review' as a valid status option for estimates

-- Update the main estimates table status enum
ALTER TABLE estimates 
MODIFY COLUMN status ENUM('pending', 'need review', 'reviewed', 'quoted', 'accepted', 'declined', 'expired') DEFAULT 'need review';

-- Update the estimate_status_history table status enums
ALTER TABLE estimate_status_history 
MODIFY COLUMN old_status ENUM('pending', 'need review', 'reviewed', 'quoted', 'accepted', 'declined', 'expired') NULL;

ALTER TABLE estimate_status_history 
MODIFY COLUMN new_status ENUM('pending', 'need review', 'reviewed', 'quoted', 'accepted', 'declined', 'expired') NOT NULL;

-- Update existing records that have 'pending' status to 'need review' if they don't have a quote_amount
UPDATE estimates 
SET status = 'need review' 
WHERE status = 'pending' 
AND (quote_amount IS NULL OR quote_amount = 0);

-- Update the default status for new records to 'need review'
ALTER TABLE estimates 
MODIFY COLUMN status ENUM('pending', 'need review', 'reviewed', 'quoted', 'accepted', 'declined', 'expired') DEFAULT 'need review';
