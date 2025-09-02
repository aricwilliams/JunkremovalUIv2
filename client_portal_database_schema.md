# Client Portal Database Schema for MySQL

This document outlines the complete MySQL database schema needed to support the Client Portal tab functionality in your junk removal management system.

## Core Tables

### 1. portal_users
Main table for storing portal user accounts and credentials.

```sql
CREATE TABLE portal_users (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NULL,
    role ENUM('owner', 'manager', 'employee', 'viewer') DEFAULT 'viewer',
    permissions JSON NULL,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lock_expiry TIMESTAMP NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expiry TIMESTAMP NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);
```

### 2. portal_requests
Service requests submitted through the client portal.

```sql
CREATE TABLE portal_requests (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    type ENUM('pickup', 'service', 'emergency', 'maintenance', 'consultation') DEFAULT 'service',
    priority ENUM('urgent', 'high', 'medium', 'low', 'standard') DEFAULT 'standard',
    status ENUM('pending', 'reviewing', 'quoted', 'scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending',
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requested_date DATE NOT NULL,
    preferred_date DATE NULL,
    preferred_time VARCHAR(50) NULL,
    location_address TEXT NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    location_state VARCHAR(2) NOT NULL,
    location_zip_code VARCHAR(10) NOT NULL,
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    gate_code VARCHAR(50) NULL,
    apartment_number VARCHAR(50) NULL,
    location_on_property VARCHAR(100) NULL,
    access_considerations TEXT NULL,
    approximate_volume VARCHAR(100) NULL,
    approximate_item_count VARCHAR(100) NULL,
    material_types JSON NULL,
    filled_with_water BOOLEAN DEFAULT FALSE,
    filled_with_oil BOOLEAN DEFAULT FALSE,
    hazardous_material BOOLEAN DEFAULT FALSE,
    hazardous_description TEXT NULL,
    items_in_bags BOOLEAN DEFAULT FALSE,
    bag_contents TEXT NULL,
    oversized_items BOOLEAN DEFAULT FALSE,
    oversized_description TEXT NULL,
    has_mold BOOLEAN DEFAULT FALSE,
    has_pests BOOLEAN DEFAULT FALSE,
    has_sharp_objects BOOLEAN DEFAULT FALSE,
    heavy_lifting_required BOOLEAN DEFAULT FALSE,
    disassembly_required BOOLEAN DEFAULT FALSE,
    disassembly_description TEXT NULL,
    request_donation_pickup BOOLEAN DEFAULT FALSE,
    request_demolition BOOLEAN DEFAULT FALSE,
    demolition_description TEXT NULL,
    how_did_you_hear VARCHAR(100) NULL,
    understand_pricing BOOLEAN DEFAULT FALSE,
    text_opt_in BOOLEAN DEFAULT FALSE,
    estimated_weight DECIMAL(8, 2) NULL,
    estimated_yardage DECIMAL(6, 2) NULL,
    notes TEXT NULL,
    created_by VARCHAR(36) NULL,
    assigned_to VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES portal_users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_requested_date (requested_date),
    INDEX idx_preferred_date (preferred_date),
    INDEX idx_created_at (created_at)
);
```

### 3. portal_request_attachments
Photos, videos, and documents attached to portal requests.

```sql
CREATE TABLE portal_request_attachments (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    media_type ENUM('photo', 'video', 'document', 'other') DEFAULT 'photo',
    description TEXT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(36) NULL,
    FOREIGN KEY (request_id) REFERENCES portal_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES portal_users(id) ON DELETE SET NULL,
    INDEX idx_request_id (request_id),
    INDEX idx_media_type (media_type),
    INDEX idx_is_primary (is_primary),
    INDEX idx_upload_date (upload_date)
);
```

### 4. portal_request_status_history
Complete audit trail of status changes for portal requests.

```sql
CREATE TABLE portal_request_status_history (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    change_reason TEXT NULL,
    changed_by VARCHAR(36) NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    FOREIGN KEY (request_id) REFERENCES portal_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES portal_users(id) ON DELETE SET NULL,
    INDEX idx_request_id (request_id),
    INDEX idx_new_status (new_status),
    INDEX idx_changed_at (changed_at)
);
```

### 5. portal_notifications
Notification system for portal users about request updates.

```sql
CREATE TABLE portal_notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    request_id VARCHAR(36) NULL,
    type ENUM('status_update', 'quote_ready', 'scheduling', 'reminder', 'general', 'urgent') DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    scheduled_for TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES portal_requests(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_request_id (request_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_priority (priority),
    INDEX idx_scheduled_for (scheduled_for)
);
```

### 6. portal_reports
Custom reports generated for portal users.

```sql
CREATE TABLE portal_reports (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    report_type ENUM('monthly', 'quarterly', 'annual', 'custom', 'job_summary', 'financial', 'volume') DEFAULT 'monthly',
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    report_data JSON NULL,
    file_path VARCHAR(500) NULL,
    file_size BIGINT NULL,
    download_count INT DEFAULT 0,
    last_downloaded TIMESTAMP NULL,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_frequency VARCHAR(50) NULL,
    next_generation_date DATE NULL,
    status ENUM('generating', 'ready', 'failed', 'expired') DEFAULT 'generating',
    generated_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_user_id (user_id),
    INDEX idx_report_type (report_type),
    INDEX idx_period_start (period_start),
    INDEX idx_period_end (period_end),
    INDEX idx_status (status),
    INDEX idx_is_scheduled (is_scheduled)
);
```

### 7. portal_activity_logs
Audit trail of all portal activities and user actions.

```sql
CREATE TABLE portal_activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    activity_type ENUM('login', 'logout', 'create_request', 'edit_request', 'view_request', 'download_report', 'update_profile', 'change_password', 'upload_file', 'other') DEFAULT 'other',
    description TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    request_id VARCHAR(36) NULL,
    report_id VARCHAR(36) NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES portal_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (report_id) REFERENCES portal_reports(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);
```

### 8. portal_settings
Customer-specific portal configuration and preferences.

```sql
CREATE TABLE portal_settings (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'date') DEFAULT 'string',
    description TEXT NULL,
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_setting (customer_id, setting_key),
    INDEX idx_customer_id (customer_id),
    INDEX idx_setting_key (setting_key)
);
```

### 9. portal_templates
Email and notification templates for portal communications.

```sql
CREATE TABLE portal_templates (
    id VARCHAR(36) PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL UNIQUE,
    template_type ENUM('email', 'sms', 'notification', 'pdf') DEFAULT 'email',
    subject VARCHAR(255) NULL,
    html_content TEXT NULL,
    text_content TEXT NULL,
    variables JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_name (template_name),
    INDEX idx_template_type (template_type),
    INDEX idx_is_active (is_active)
);
```

### 10. portal_scheduled_tasks
Automated tasks and scheduled operations for the portal.

```sql
CREATE TABLE portal_scheduled_tasks (
    id VARCHAR(36) PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL,
    task_type ENUM('report_generation', 'notification_send', 'data_cleanup', 'backup', 'maintenance') DEFAULT 'report_generation',
    cron_expression VARCHAR(100) NULL,
    schedule_type ENUM('daily', 'weekly', 'monthly', 'custom', 'one_time') DEFAULT 'daily',
    next_run TIMESTAMP NULL,
    last_run TIMESTAMP NULL,
    last_run_status ENUM('success', 'failed', 'running') DEFAULT 'success',
    last_run_message TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_retries INT DEFAULT 3,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_name (task_name),
    INDEX idx_task_type (task_type),
    INDEX idx_next_run (next_run),
    INDEX idx_is_active (is_active)
);
```

## Sample Data

### Insert Sample Portal Users
```sql
INSERT INTO portal_users (id, customer_id, username, email, password_hash, role, permissions) VALUES
('pu-1', 'cust-1', 'downtown_admin', 'admin@downtownoffice.com', 'hashed_password_123', 'owner', '{"dashboard": true, "requests": true, "reports": true, "admin": true}'),
('pu-2', 'cust-2', 'riverside_manager', 'manager@riversideapts.com', 'hashed_password_456', 'manager', '{"dashboard": true, "requests": true, "reports": true}'),
('pu-3', 'cust-3', 'coastal_ops', 'operations@coastalretail.com', 'hashed_password_789', 'employee', '{"dashboard": true, "requests": true}');
```

### Insert Sample Portal Requests
```sql
INSERT INTO portal_requests (id, customer_id, customer_name, type, priority, status, subject, description, requested_date, preferred_date, preferred_time, location_address, location_city, location_state, location_zip_code) VALUES
('req-1', 'cust-1', 'Downtown Office Complex', 'pickup', 'medium', 'completed', 'Weekly Office Waste Pickup', 'Regular weekly pickup of office waste and recycling from all floors', '2024-01-15', '2024-01-16', '09:00 AM', '321 Commerce St', 'Wilmington', 'NC', '28401'),
('req-2', 'cust-1', 'Downtown Office Complex', 'service', 'high', 'in-progress', 'Emergency Cleanup - Conference Room Renovation', 'Need immediate cleanup of construction debris from conference room renovation project', '2024-01-20', '2024-01-21', 'ASAP', '321 Commerce St', 'Wilmington', 'NC', '28401');
```

### Insert Sample Portal Settings
```sql
INSERT INTO portal_settings (id, customer_id, setting_key, setting_value, setting_type, description) VALUES
('ps-1', 'cust-1', 'notifications_enabled', 'true', 'boolean', 'Enable email notifications'),
('ps-2', 'cust-1', 'default_timezone', 'America/New_York', 'string', 'Default timezone for the portal'),
('ps-3', 'cust-1', 'auto_generate_reports', 'true', 'boolean', 'Automatically generate monthly reports'),
('ps-4', 'cust-1', 'max_file_upload_size', '10485760', 'number', 'Maximum file upload size in bytes');
```

## Key Features

### **Portal User Management:**
- Secure user authentication with role-based access control
- Multiple user roles (owner, manager, employee, viewer)
- Two-factor authentication support
- Password management and security features

### **Service Request System:**
- Comprehensive request forms with detailed project information
- File upload support for photos and videos
- Material type and condition tracking
- Safety hazard identification
- Priority and status management

### **Communication & Notifications:**
- Real-time notification system
- Email and SMS notifications
- Status update tracking
- Activity logging and audit trails

### **Reporting & Analytics:**
- Custom report generation
- Scheduled report delivery
- Download tracking and analytics
- Historical data access

### **File Management:**
- Secure file upload and storage
- Multiple file type support
- File organization and categorization
- Access control and permissions

### **Portal Customization:**
- Customer-specific settings and preferences
- Configurable notification preferences
- Custom branding and themes
- Flexible permission systems

### **Security & Compliance:**
- Secure authentication and authorization
- Activity logging and monitoring
- Data encryption and protection
- Compliance with data privacy regulations

This schema provides a robust foundation for a comprehensive client portal system, enabling customers to manage their junk removal services, track requests, access reports, and communicate effectively with your team.
