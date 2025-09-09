-- Add new job statuses to estimates table
-- This migration adds 'scheduled', 'in progress', 'completed', 'cancelled' to the status enum

-- Update the estimates table status enum
ALTER TABLE estimates 
MODIFY COLUMN status ENUM(
    'pending', 
    'need review', 
    'reviewed', 
    'quoted', 
    'accepted', 
    'declined', 
    'expired',
    'scheduled',
    'in progress',
    'completed',
    'cancelled'
) DEFAULT 'need review';

-- Update the estimate_status_history table status enums
ALTER TABLE estimate_status_history 
MODIFY COLUMN old_status ENUM(
    'pending', 
    'need review', 
    'reviewed', 
    'quoted', 
    'accepted', 
    'declined', 
    'expired',
    'scheduled',
    'in progress',
    'completed',
    'cancelled'
) NULL;

ALTER TABLE estimate_status_history 
MODIFY COLUMN new_status ENUM(
    'pending', 
    'need review', 
    'reviewed', 
    'quoted', 
    'accepted', 
    'declined', 
    'expired',
    'scheduled',
    'in progress',
    'completed',
    'cancelled'
) NOT NULL;
