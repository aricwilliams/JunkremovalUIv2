# Employees Database Schema for MySQL

This document outlines the complete MySQL database schema needed to support the Employees tab functionality in your junk removal management system.

## Core Tables

### 1. employees
Main table for storing employee information.

```sql
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    employee_number VARCHAR(50) NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    employee_type ENUM('regular', 'manager', '1099', 'intern', 'seasonal') DEFAULT 'regular',
    position ENUM('driver', 'helper', 'supervisor', 'manager', 'admin', 'dispatcher', 'mechanic', 'other') DEFAULT 'helper',
    status ENUM('active', 'inactive', 'on-leave', 'terminated', 'suspended', 'probation') DEFAULT 'active',
    hire_date DATE NOT NULL,
    termination_date DATE NULL,
    termination_reason TEXT NULL,
    assigned_truck_id VARCHAR(36) NULL,
    assigned_crew_id VARCHAR(36) NULL,
    supervisor_id VARCHAR(36) NULL,
    department VARCHAR(100) NULL,
    notes TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_number (employee_number),
    INDEX idx_email (email),
    INDEX idx_employee_type (employee_type),
    INDEX idx_position (position),
    INDEX idx_status (status),
    INDEX idx_hire_date (hire_date),
    INDEX idx_assigned_truck_id (assigned_truck_id),
    INDEX idx_assigned_crew_id (assigned_crew_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_is_active (is_active)
);
```

### 2. employee_portal_credentials
Portal access credentials for employees.

```sql
CREATE TABLE employee_portal_credentials (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NULL,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lock_expiry TIMESTAMP NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expiry TIMESTAMP NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255) NULL,
    permissions JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
);
```

### 3. employee_emergency_contacts
Emergency contact information for employees.

```sql
CREATE TABLE employee_emergency_contacts (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    contact_type ENUM('primary', 'secondary', 'emergency', 'beneficiary') DEFAULT 'primary',
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(2) NULL,
    zip_code VARCHAR(10) NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_contact_type (contact_type),
    INDEX idx_is_primary (is_primary)
);
```

### 4. employee_documents
Document management for employees (licenses, background checks, etc.).

```sql
CREATE TABLE employee_documents (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    document_type ENUM('drivers_license', 'background_check', 'drug_test', 'i9_form', 'w4_form', 'contract', 'certification', 'training_record', 'performance_review', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(100) NULL,
    issuing_authority VARCHAR(255) NULL,
    issue_date DATE NULL,
    expiry_date DATE NULL,
    status ENUM('pending', 'active', 'expired', 'revoked', 'failed') DEFAULT 'pending',
    file_path VARCHAR(500) NULL,
    file_size BIGINT NULL,
    file_type VARCHAR(100) NULL,
    is_required BOOLEAN DEFAULT FALSE,
    verification_date DATE NULL,
    verified_by VARCHAR(36) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_document_type (document_type),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_is_required (is_required)
);
```

### 5. employee_certifications
Professional certifications and licenses for employees.

```sql
CREATE TABLE employee_certifications (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    certificate_number VARCHAR(100) NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NULL,
    status ENUM('active', 'expired', 'suspended', 'revoked') DEFAULT 'active',
    renewal_required BOOLEAN DEFAULT FALSE,
    renewal_frequency VARCHAR(50) NULL,
    continuing_education_hours DECIMAL(5, 2) NULL,
    ce_hours_required DECIMAL(5, 2) NULL,
    file_path VARCHAR(500) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_renewal_required (renewal_required)
);
```

### 6. employee_pay_rates
Compensation and pay rate information for employees.

```sql
CREATE TABLE employee_pay_rates (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    pay_type ENUM('hourly', 'salary', 'commission', 'piece_rate', '1099') DEFAULT 'hourly',
    base_rate DECIMAL(8, 2) NOT NULL,
    overtime_rate DECIMAL(8, 2) NULL,
    overtime_multiplier DECIMAL(3, 2) DEFAULT 1.5,
    holiday_rate DECIMAL(8, 2) NULL,
    holiday_multiplier DECIMAL(3, 2) DEFAULT 1.5,
    weekend_rate DECIMAL(8, 2) NULL,
    weekend_multiplier DECIMAL(3, 2) DEFAULT 1.25,
    night_differential DECIMAL(8, 2) NULL,
    per_diem_rate DECIMAL(8, 2) NULL,
    mileage_rate DECIMAL(6, 2) NULL,
    effective_date DATE NOT NULL,
    end_date DATE NULL,
    is_current BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(36) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_pay_type (pay_type),
    INDEX idx_effective_date (effective_date),
    INDEX idx_is_current (is_current)
);
```

### 7. employee_schedules
Work schedules and availability for employees.

```sql
CREATE TABLE employee_schedules (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    schedule_type ENUM('regular', 'overtime', 'on_call', 'training', 'maintenance') DEFAULT 'regular',
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME NULL,
    break_end TIME NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_required BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    effective_date DATE NOT NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_schedule_type (schedule_type),
    INDEX idx_day_of_week (day_of_week),
    INDEX idx_effective_date (effective_date),
    INDEX idx_is_available (is_available)
);
```

### 8. employee_performance
Performance tracking and reviews for employees.

```sql
CREATE TABLE employee_performance (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    review_type ENUM('annual', 'quarterly', 'monthly', 'probation', 'promotion', 'termination') DEFAULT 'annual',
    review_date DATE NOT NULL,
    reviewer_id VARCHAR(36) NULL,
    overall_rating DECIMAL(2, 1) NOT NULL,
    next_review_date DATE NULL,
    status ENUM('draft', 'submitted', 'approved', 'completed') DEFAULT 'draft',
    comments TEXT NULL,
    goals TEXT NULL,
    achievements TEXT NULL,
    areas_for_improvement TEXT NULL,
    training_recommendations TEXT NULL,
    promotion_eligibility BOOLEAN DEFAULT FALSE,
    salary_recommendation TEXT NULL,
    employee_signature BOOLEAN DEFAULT FALSE,
    employee_signature_date DATE NULL,
    manager_signature BOOLEAN DEFAULT FALSE,
    manager_signature_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_review_type (review_type),
    INDEX idx_review_date (review_date),
    INDEX idx_next_review_date (next_review_date),
    INDEX idx_status (status)
);
```

### 9. employee_performance_metrics
Individual performance metrics and ratings.

```sql
CREATE TABLE employee_performance_metrics (
    id VARCHAR(36) PRIMARY KEY,
    performance_id VARCHAR(36) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_category VARCHAR(100) NULL,
    rating DECIMAL(2, 1) NOT NULL,
    max_rating DECIMAL(2, 1) DEFAULT 5.0,
    weight DECIMAL(3, 2) DEFAULT 1.00,
    comments TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performance_id) REFERENCES employee_performance(id) ON DELETE CASCADE,
    INDEX idx_performance_id (performance_id),
    INDEX idx_metric_category (metric_category)
);
```

### 10. employee_training
Training records and certifications for employees.

```sql
CREATE TABLE employee_training (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    training_name VARCHAR(255) NOT NULL,
    training_type ENUM('safety', 'compliance', 'skills', 'leadership', 'certification', 'refresher') DEFAULT 'safety',
    provider VARCHAR(255) NULL,
    instructor VARCHAR(255) NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    duration_hours DECIMAL(5, 2) NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'failed', 'cancelled') DEFAULT 'scheduled',
    score DECIMAL(5, 2) NULL,
    passing_score DECIMAL(5, 2) NULL,
    certificate_number VARCHAR(100) NULL,
    expiry_date DATE NULL,
    renewal_required BOOLEAN DEFAULT FALSE,
    renewal_frequency VARCHAR(50) NULL,
    cost DECIMAL(8, 2) NULL,
    file_path VARCHAR(500) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_training_type (training_type),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_expiry_date (expiry_date)
);
```

### 11. employee_time_logs
Time tracking and attendance records for employees.

```sql
CREATE TABLE employee_time_logs (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    log_date DATE NOT NULL,
    clock_in TIME NULL,
    clock_out TIME NULL,
    break_start TIME NULL,
    break_end TIME NULL,
    total_hours DECIMAL(5, 2) NULL,
    regular_hours DECIMAL(5, 2) NULL,
    overtime_hours DECIMAL(5, 2) NULL,
    holiday_hours DECIMAL(5, 2) NULL,
    weekend_hours DECIMAL(5, 2) NULL,
    night_hours DECIMAL(5, 2) NULL,
    status ENUM('present', 'absent', 'late', 'early_departure', 'sick', 'vacation', 'personal', 'other') DEFAULT 'present',
    job_id VARCHAR(36) NULL,
    crew_id VARCHAR(36) NULL,
    location_lat DECIMAL(10, 8) NULL,
    location_lng DECIMAL(11, 8) NULL,
    notes TEXT NULL,
    approved_by VARCHAR(36) NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_log_date (log_date),
    INDEX idx_status (status),
    INDEX idx_job_id (job_id),
    INDEX idx_crew_id (crew_id)
);
```

### 12. employee_benefits
Benefits and insurance information for employees.

```sql
CREATE TABLE employee_benefits (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    benefit_type ENUM('health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability_insurance', 'retirement', 'vacation', 'sick_leave', 'personal_leave', 'other') NOT NULL,
    provider VARCHAR(255) NULL,
    policy_number VARCHAR(100) NULL,
    group_number VARCHAR(100) NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    employee_cost DECIMAL(8, 2) NULL,
    employer_cost DECIMAL(8, 2) NULL,
    total_cost DECIMAL(8, 2) NULL,
    coverage_level VARCHAR(100) NULL,
    dependents_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_benefit_type (benefit_type),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_is_active (is_active)
);
```

### 13. employee_incidents
Safety incidents and disciplinary actions for employees.

```sql
CREATE TABLE employee_incidents (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    incident_type ENUM('safety_violation', 'policy_violation', 'performance_issue', 'attendance_issue', 'accident', 'injury', 'other') NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME NULL,
    location TEXT NULL,
    description TEXT NOT NULL,
    severity ENUM('minor', 'moderate', 'major', 'critical') DEFAULT 'minor',
    witnesses TEXT NULL,
    reported_by VARCHAR(36) NULL,
    investigation_required BOOLEAN DEFAULT FALSE,
    investigation_date DATE NULL,
    investigation_by VARCHAR(36) NULL,
    findings TEXT NULL,
    corrective_actions TEXT NULL,
    disciplinary_action ENUM('none', 'verbal_warning', 'written_warning', 'suspension', 'termination', 'other') DEFAULT 'none',
    suspension_start DATE NULL,
    suspension_end DATE NULL,
    suspension_reason TEXT NULL,
    follow_up_date DATE NULL,
    status ENUM('reported', 'investigating', 'resolved', 'closed') DEFAULT 'reported',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (investigation_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_incident_type (incident_type),
    INDEX idx_incident_date (incident_date),
    INDEX idx_severity (severity),
    INDEX idx_status (status)
);
```

### 14. employee_equipment
Equipment and tools assigned to employees.

```sql
CREATE TABLE employee_equipment (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_type ENUM('safety_gear', 'tools', 'uniforms', 'electronics', 'vehicles', 'other') DEFAULT 'safety_gear',
    serial_number VARCHAR(100) NULL,
    asset_tag VARCHAR(100) NULL,
    issue_date DATE NOT NULL,
    return_date DATE NULL,
    condition ENUM('new', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good',
    replacement_cost DECIMAL(8, 2) NULL,
    is_returnable BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_equipment_type (equipment_type),
    INDEX idx_issue_date (issue_date),
    INDEX idx_condition (condition)
);
```

## Sample Data

### Insert Sample Employee Types
```sql
INSERT INTO employees (id, employee_number, first_name, last_name, email, phone, address, city, state, zip_code, employee_type, position, status, hire_date, pay_rate, notes) VALUES
('emp-1', 'EMP001', 'John', 'Driver', 'john@company.com', '555-0101', '123 Main St', 'Wilmington', 'NC', '28401', 'regular', 'driver', 'active', '2022-01-01', 18.00, 'Experienced driver, excellent safety record'),
('emp-2', 'EMP002', 'Mike', 'Helper', 'mike@company.com', '555-0201', '456 Oak Ave', 'Wilmington', 'NC', '28403', '1099', 'helper', 'active', '2023-03-01', 15.00, 'Hard worker, learning quickly'),
('emp-3', 'EMP003', 'Lisa', 'Supervisor', 'lisa@company.com', '555-0301', '789 Pine St', 'Wilmington', 'NC', '28405', 'manager', 'supervisor', 'active', '2021-06-01', 25.00, 'Excellent supervisor, great leadership skills'),
('emp-4', 'EMP004', 'Sarah', 'Manager', 'sarah@company.com', '555-0401', '321 Elm St', 'Wilmington', 'NC', '28402', 'manager', 'manager', 'active', '2020-08-01', 35.00, 'Senior manager, excellent organizational skills');
```

### Insert Sample Portal Credentials
```sql
INSERT INTO employee_portal_credentials (id, employee_id, username, email, password_hash, permissions) VALUES
('cred-1', 'emp-1', 'jdriver', 'john@company.com', 'hashed_password_123', '{"dashboard": true, "jobs": true, "time_logs": true}'),
('cred-2', 'emp-3', 'lsupervisor', 'lisa@company.com', 'hashed_password_456', '{"dashboard": true, "jobs": true, "employees": true, "reports": true}'),
('cred-3', 'emp-4', 'smanager', 'sarah@company.com', 'hashed_password_789', '{"dashboard": true, "jobs": true, "employees": true, "reports": true, "admin": true}');
```

### Insert Sample Emergency Contacts
```sql
INSERT INTO employee_emergency_contacts (id, employee_id, contact_type, name, relationship, phone, is_primary) VALUES
('ec-1', 'emp-1', 'primary', 'Jane Driver', 'Spouse', '555-0102', TRUE),
('ec-2', 'emp-2', 'primary', 'Sarah Helper', 'Sister', '555-0202', TRUE),
('ec-3', 'emp-3', 'primary', 'Tom Supervisor', 'Spouse', '555-0302', TRUE);
```

## Key Features

### **Employee Management:**
- Complete employee information and contact details
- Employee type classification (regular, manager, 1099 contractor)
- Position and status tracking
- Supervisor and crew assignments

### **Portal & Security:**
- Secure portal access credentials
- Role-based permissions and access control
- Two-factor authentication support
- Password management and security

### **Documentation & Compliance:**
- Driver's license and background check tracking
- Document expiration monitoring
- Required document management
- Compliance verification tracking

### **Performance & Training:**
- Performance review system with ratings
- Goal setting and achievement tracking
- Training records and certification management
- Continuing education requirements

### **Scheduling & Time Tracking:**
- Flexible work schedule management
- Time clock functionality
- Overtime and special rate calculations
- Break time tracking

### **Benefits & Compensation:**
- Comprehensive benefits management
- Pay rate history and changes
- Overtime and special rate calculations
- Cost tracking and analysis

### **Safety & Compliance:**
- Incident reporting and investigation
- Safety violation tracking
- Disciplinary action management
- Equipment assignment and tracking

This schema provides a robust foundation for comprehensive employee management, including HR functions, performance tracking, compliance management, and portal access control for your junk removal business.
