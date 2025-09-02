# Jobs Database Schema for MySQL

This document outlines the complete MySQL database schema needed to support the Jobs tab functionality in your junk removal management system.

## Core Tables

### 1. jobs
Main table for storing job information.

```sql
CREATE TABLE jobs (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    scheduled_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    estimated_hours DECIMAL(4,2) NOT NULL,
    status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    crew_id VARCHAR(36) NULL,
    truck_id VARCHAR(36) NULL,
    total_estimate DECIMAL(10,2) NOT NULL,
    actual_total DECIMAL(10,2) NULL,
    notes TEXT NULL,
    estimate_id VARCHAR(36) NULL,
    property_manager_id VARCHAR(36) NULL,
    estimated_weight DECIMAL(8,2) NULL, -- in pounds
    estimated_yardage DECIMAL(6,2) NULL, -- in cubic yards
    actual_weight DECIMAL(8,2) NULL,
    actual_yardage DECIMAL(6,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_crew_id (crew_id),
    INDEX idx_truck_id (truck_id),
    INDEX idx_estimate_id (estimate_id),
    INDEX idx_property_manager_id (property_manager_id),
    INDEX idx_location (city, state),
    INDEX idx_coordinates (latitude, longitude)
);
```

### 2. job_items
Individual items within each job.

```sql
CREATE TABLE job_items (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    base_price DECIMAL(8,2) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    estimated_time DECIMAL(4,2) NOT NULL, -- in hours
    actual_time DECIMAL(4,2) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_category (category)
);
```

### 3. job_photos
Before and after photos for jobs.

```sql
CREATE TABLE job_photos (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    photo_type ENUM('before', 'after') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL, -- in bytes
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(36) NULL, -- employee_id
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_photo_type (photo_type)
);
```

### 4. job_status_history
Track status changes and progress updates.

```sql
CREATE TABLE job_status_history (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') NOT NULL,
    changed_by VARCHAR(36) NULL, -- employee_id
    notes TEXT NULL,
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### 5. job_notifications
Track customer notifications sent for jobs.

```sql
CREATE TABLE job_notifications (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    notification_type ENUM('on-way', 'started', 'completed', 'custom') NOT NULL,
    message TEXT NOT NULL,
    sent_to VARCHAR(255) NOT NULL, -- phone or email
    delivery_method ENUM('sms', 'email', 'push') NOT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    sent_by VARCHAR(36) NULL, -- employee_id
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
);
```

### 6. job_time_logs
Track actual time spent on jobs.

```sql
CREATE TABLE job_time_logs (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    activity_type ENUM('travel', 'setup', 'work', 'cleanup', 'travel_return') NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    duration_minutes INT NULL,
    notes TEXT NULL,
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_start_time (start_time)
);
```

## Supporting Tables

### 7. crews
Crews assigned to jobs.

```sql
CREATE TABLE crews (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    is_available BOOLEAN DEFAULT TRUE,
    current_job_id VARCHAR(36) NULL,
    assigned_truck_id VARCHAR(36) NULL,
    supervisor_id VARCHAR(36) NULL,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    completed_jobs INT DEFAULT 0,
    on_time_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_current_job_id (current_job_id),
    INDEX idx_assigned_truck_id (assigned_truck_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_is_available (is_available)
);
```

### 8. crew_members
Many-to-many relationship between crews and employees.

```sql
CREATE TABLE crew_members (
    id VARCHAR(36) PRIMARY KEY,
    crew_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    role ENUM('driver', 'helper', 'supervisor') DEFAULT 'helper',
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (crew_id) REFERENCES crews(id) ON DELETE CASCADE,
    UNIQUE KEY unique_crew_employee (crew_id, employee_id),
    INDEX idx_crew_id (crew_id),
    INDEX idx_employee_id (employee_id)
);
```

### 9. trucks
Trucks assigned to jobs.

```sql
CREATE TABLE trucks (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    capacity_weight DECIMAL(8,2) NOT NULL, -- in pounds
    capacity_volume DECIMAL(6,2) NOT NULL, -- in cubic yards
    status ENUM('available', 'in-use', 'maintenance', 'out-of-service') DEFAULT 'available',
    current_latitude DECIMAL(10, 8) NULL,
    current_longitude DECIMAL(11, 8) NULL,
    assigned_crew_id VARCHAR(36) NULL,
    assigned_job_id VARCHAR(36) NULL,
    fuel_level DECIMAL(5,2) DEFAULT 100.00, -- percentage
    mileage INT NOT NULL DEFAULT 0,
    last_service_date DATE NULL,
    next_service_date DATE NULL,
    insurance_policy_number VARCHAR(100) NULL,
    insurance_expiry_date DATE NULL,
    insurance_provider VARCHAR(255) NULL,
    registration_number VARCHAR(100) NULL,
    registration_expiry_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_assigned_crew_id (assigned_crew_id),
    INDEX idx_assigned_job_id (assigned_job_id),
    INDEX idx_location (current_latitude, current_longitude)
);
```

### 10. time_slots
Available time slots for job scheduling.

```sql
CREATE TABLE time_slots (
    id VARCHAR(36) PRIMARY KEY,
    time_slot VARCHAR(50) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    crew_id VARCHAR(36) NULL,
    max_jobs_per_slot INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_time_slot (time_slot),
    INDEX idx_is_available (is_available),
    INDEX idx_crew_id (crew_id)
);
```

### 11. job_estimates
Link jobs to estimates.

```sql
CREATE TABLE job_estimates (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    estimate_id VARCHAR(36) NOT NULL,
    accepted_date TIMESTAMP NULL,
    accepted_by VARCHAR(36) NULL, -- customer_id or employee_id
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_estimate (job_id, estimate_id),
    INDEX idx_job_id (job_id),
    INDEX idx_estimate_id (estimate_id)
);
```

## Sample Data Insertion

### Insert Sample Time Slots
```sql
INSERT INTO time_slots (id, time_slot, is_available, max_jobs_per_slot) VALUES
(UUID(), '8:00 AM - 10:00 AM', TRUE, 2),
(UUID(), '10:00 AM - 12:00 PM', TRUE, 2),
(UUID(), '12:00 PM - 2:00 PM', TRUE, 2),
(UUID(), '2:00 PM - 4:00 PM', TRUE, 2),
(UUID(), '4:00 PM - 6:00 PM', TRUE, 2);
```

### Insert Sample Crew
```sql
INSERT INTO crews (id, name, capacity, is_available) VALUES
(UUID(), 'Crew Alpha', 3, TRUE),
(UUID(), 'Crew Beta', 2, TRUE),
(UUID(), 'Crew Gamma', 3, TRUE);
```

## Key Relationships

1. **jobs** → **customers** (via customer_id)
2. **jobs** → **crews** (via crew_id)
3. **jobs** → **trucks** (via truck_id)
4. **jobs** → **estimates** (via estimate_id)
5. **jobs** → **property_managers** (via property_manager_id)
6. **job_items** → **jobs** (via job_id)
7. **job_photos** → **jobs** (via job_id)
8. **job_status_history** → **jobs** (via job_id)
9. **job_notifications** → **jobs** (via job_id)
10. **job_time_logs** → **jobs** (via job_id)
11. **crew_members** → **crews** (via crew_id)
12. **crew_members** → **employees** (via employee_id)

## Indexes for Performance

The schema includes strategic indexes for:
- Job status filtering
- Date-based queries
- Location-based searches
- Customer and crew lookups
- Time-based operations

## Additional Considerations

1. **Geospatial Queries**: Consider adding spatial indexes if using MySQL 8.0+ with spatial data types
2. **Partitioning**: For large datasets, consider partitioning the jobs table by date
3. **Archiving**: Implement job archiving for completed jobs older than X years
4. **Audit Trail**: The job_status_history table provides a complete audit trail
5. **Notifications**: The job_notifications table tracks all customer communications

This schema provides a robust foundation for managing jobs, tracking progress, managing crews and equipment, and maintaining a complete audit trail of all job-related activities.

