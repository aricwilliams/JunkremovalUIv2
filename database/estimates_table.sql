-- Estimates Table Schema
-- This table stores all estimate request information from the client form

CREATE TABLE estimates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Client Information
    is_new_client BOOLEAN NOT NULL DEFAULT TRUE,
    existing_client_id INT NULL, -- References customers table if existing client
    
    -- Basic Contact Information
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    ok_to_text BOOLEAN DEFAULT FALSE,
    
    -- Service Address
    service_address TEXT NOT NULL,
    gate_code VARCHAR(100) NULL,
    apartment_unit VARCHAR(50) NULL,
    
    -- Project Details
    preferred_date DATE NULL,
    preferred_time VARCHAR(50) NULL,
    location_on_property VARCHAR(100) NOT NULL,
    approximate_volume VARCHAR(100) NOT NULL,
    access_considerations TEXT NULL,
    
    -- Photos & Media
    photos JSON NULL, -- Store array of photo file paths/URLs
    videos JSON NULL, -- Store array of video file paths/URLs
    
    -- Item Type & Condition
    material_types JSON NOT NULL, -- Store array of selected material types
    approximate_item_count VARCHAR(255) NULL,
    items_filled_water BOOLEAN DEFAULT FALSE,
    items_filled_oil_fuel BOOLEAN DEFAULT FALSE,
    hazardous_materials BOOLEAN DEFAULT FALSE,
    items_tied_bags BOOLEAN DEFAULT FALSE,
    oversized_items BOOLEAN DEFAULT FALSE,
    
    -- Safety & Hazards
    mold_present BOOLEAN DEFAULT FALSE,
    pests_present BOOLEAN DEFAULT FALSE,
    sharp_objects BOOLEAN DEFAULT FALSE,
    heavy_lifting_required BOOLEAN DEFAULT FALSE,
    disassembly_required BOOLEAN DEFAULT FALSE,
    
    -- Additional Information & Services
    additional_notes TEXT NULL,
    request_donation_pickup BOOLEAN DEFAULT FALSE,
    request_demolition_addon BOOLEAN DEFAULT FALSE,
    
    -- Follow-up & Priority
    how_did_you_hear VARCHAR(255) NULL,
    request_priority ENUM('standard', 'urgent', 'low') DEFAULT 'standard',
    
    -- System Fields
    status ENUM('pending', 'need review', 'reviewed', 'quoted', 'accepted', 'declined', 'expired', 'scheduled', 'in progress', 'completed', 'cancelled') DEFAULT 'need review',
    quote_amount DECIMAL(10,2) NULL,
    quote_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_email (email_address),
    INDEX idx_phone (phone_number),
    INDEX idx_existing_client (existing_client_id),
    
    -- Foreign Key Constraints
    FOREIGN KEY (existing_client_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create a separate table for estimate photos/videos if you prefer normalized approach
CREATE TABLE estimate_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estimate_id INT NOT NULL,
    file_type ENUM('photo', 'video') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
    INDEX idx_estimate_id (estimate_id),
    INDEX idx_file_type (file_type)
);

-- Create a table for estimate status history
CREATE TABLE estimate_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estimate_id INT NOT NULL,
    old_status ENUM('pending', 'need review', 'reviewed', 'quoted', 'accepted', 'declined', 'expired', 'scheduled', 'in progress', 'completed', 'cancelled') NULL,
    new_status ENUM('pending', 'need review', 'reviewed', 'quoted', 'accepted', 'declined', 'expired', 'scheduled', 'in progress', 'completed', 'cancelled') NOT NULL,
    changed_by INT NULL, -- References employees table
    notes TEXT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
    INDEX idx_estimate_id (estimate_id),
    INDEX idx_changed_at (changed_at)
);

-- Sample data insertion
INSERT INTO estimates (
    is_new_client,
    full_name,
    phone_number,
    email_address,
    ok_to_text,
    service_address,
    gate_code,
    apartment_unit,
    preferred_date,
    preferred_time,
    location_on_property,
    approximate_volume,
    access_considerations,
    material_types,
    approximate_item_count,
    items_filled_water,
    items_filled_oil_fuel,
    hazardous_materials,
    items_tied_bags,
    oversized_items,
    mold_present,
    pests_present,
    sharp_objects,
    heavy_lifting_required,
    disassembly_required,
    additional_notes,
    request_donation_pickup,
    request_demolition_addon,
    how_did_you_hear,
    request_priority,
    status
) VALUES (
    TRUE,
    'John Smith',
    '555-123-4567',
    'john.smith@email.com',
    TRUE,
    '123 Main Street, Wilmington, NC 28401',
    '1234',
    'Apt 2B',
    '2024-01-20',
    'Morning (8AM-12PM)',
    'Garage',
    'Medium (1-2 truck loads)',
    'Narrow driveway, 2 flights of stairs',
    '["Wood", "Furniture", "Electronics"]',
    '15-20 items, mixed pile',
    FALSE,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    'Customer wants to keep some items, will mark what to remove',
    TRUE,
    FALSE,
    'Google Search',
    'standard',
    'need review'
);
