CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    customer_type ENUM('residential', 'commercial', 'industrial', 'government') DEFAULT 'residential',
    status ENUM('new', 'quoted', 'scheduled', 'completed', 'inactive', 'blacklisted') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    
    INDEX idx_business_id (business_id),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    employee_type ENUM('manager', 'regular', '1099') DEFAULT 'regular',
    position ENUM('driver', 'helper', 'supervisor', 'manager', 'admin') DEFAULT 'helper',
    status ENUM('active', 'inactive', 'on-leave', 'terminated') DEFAULT 'active',
    hire_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    
    INDEX idx_business_id (business_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_position (position)
);

CREATE TABLE estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    customer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
    sent_date DATETIME NULL,
    expiry_date DATETIME NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    
    INDEX idx_business_id (business_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status)
);

CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    customer_id INT NOT NULL,
    estimate_id INT NULL,
    assigned_employee_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    scheduled_date DATETIME NOT NULL,
    completion_date DATETIME NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    total_cost DECIMAL(10,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    
    INDEX idx_business_id (business_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_assigned_employee (assigned_employee_id)
);

CREATE TABLE job_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    base_price DECIMAL(10,2) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    estimated_time INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    
    INDEX idx_job_id (job_id),
    INDEX idx_category (category)
);

CREATE TABLE job_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    photo_type ENUM('before', 'after') NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    caption TEXT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    
    INDEX idx_job_id (job_id),
    INDEX idx_photo_type (photo_type)
);

CREATE TABLE job_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NULL,
    notes TEXT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    INDEX idx_job_id (job_id),
    INDEX idx_changed_at (changed_at)
);

CREATE TABLE job_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    employee_id INT NULL,
    note_type ENUM('general', 'customer_communication', 'internal', 'issue', 'resolution') DEFAULT 'general',
    content TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    
    INDEX idx_job_id (job_id),
    INDEX idx_note_type (note_type),
    INDEX idx_created_at (created_at)
);
