-- MySQL database table for junk removal business registration and login
-- This table stores all business information collected during signup

CREATE TABLE businesses (
    -- Primary key
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    business_phone VARCHAR(20) NOT NULL,
    business_address VARCHAR(255) NOT NULL,
    business_city VARCHAR(100) NOT NULL,
    business_state VARCHAR(2) NOT NULL,
    business_zip_code VARCHAR(10) NOT NULL,
    
    -- Owner Information
    owner_first_name VARCHAR(100) NOT NULL,
    owner_last_name VARCHAR(100) NOT NULL,
    owner_email VARCHAR(255) NOT NULL UNIQUE,
    owner_phone VARCHAR(20) NOT NULL,
    
    -- Account Credentials
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- User type and status
    user_type ENUM('business_owner', 'admin', 'employee') DEFAULT 'business_owner',
    status ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    -- Optional business details
    license_number VARCHAR(100) NULL,
    insurance_number VARCHAR(100) NULL,
    service_radius INT NULL COMMENT 'Service radius in miles',
    number_of_trucks INT DEFAULT 0,
    years_in_business INT NULL,
    
    -- Indexes for better performance
    INDEX idx_username (username),
    INDEX idx_owner_email (owner_email),
    INDEX idx_business_name (business_name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    -- Full text search for business name and owner name
    FULLTEXT idx_business_search (business_name, owner_first_name, owner_last_name)
);
