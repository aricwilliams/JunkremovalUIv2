# Jobs Database Schema

This document outlines the database tables required for the jobs functionality in the junk removal application.

## Overview

The jobs system supports:
- Job creation, editing, and status tracking
- Customer and employee assignment
- Estimate integration
- Job items and pricing
- Photo documentation (before/after)
- Status history tracking
- Notes and communication logging
- Business isolation (multi-tenant)
- Proper indexing for performance

## Core Tables

### 1. jobs (Main jobs table)

```sql
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
```

**Fields:**
- `id`: Primary key
- `business_id`: Links to businesses table (multi-tenant support)
- `customer_id`: Links to customers table
- `estimate_id`: Optional link to estimates table
- `assigned_employee_id`: Optional link to employees table
- `title`: Job title/name
- `description`: Detailed job description
- `scheduled_date`: When the job is scheduled
- `completion_date`: When the job was completed
- `status`: Current job status
- `total_cost`: Total cost of the job
- `created_at`/`updated_at`: Timestamps

### 2. customers (Customer information)

```sql
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
```

**Fields:**
- `id`: Primary key
- `business_id`: Links to businesses table (multi-tenant support)
- `name`: Customer name
- `email`: Customer email address
- `phone`: Customer phone number
- `address`: Customer address
- `city`/`state`/`zip_code`: Location details
- `customer_type`: Type of customer
- `status`: Customer status
- `created_at`/`updated_at`: Timestamps

### 3. employees (Employee information)

```sql
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
```

**Fields:**
- `id`: Primary key
- `business_id`: Links to businesses table (multi-tenant support)
- `first_name`/`last_name`: Employee name
- `email`/`phone`: Contact information
- `job_title`: Employee's job title
- `employee_type`: Type of employment
- `position`: Role within the company
- `status`: Employment status
- `hire_date`: When employee was hired
- `created_at`/`updated_at`: Timestamps

### 4. estimates (Job estimates)

```sql
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
```

**Fields:**
- `id`: Primary key
- `business_id`: Links to businesses table (multi-tenant support)
- `customer_id`: Links to customers table
- `title`: Estimate title
- `amount`: Estimated amount
- `status`: Estimate status
- `sent_date`: When estimate was sent
- `expiry_date`: When estimate expires
- `notes`: Additional notes
- `created_at`/`updated_at`: Timestamps

### 5. job_items (Items within a job)

```sql
CREATE TABLE job_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    base_price DECIMAL(10,2) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    estimated_time INT NOT NULL COMMENT 'Estimated time in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    
    INDEX idx_job_id (job_id),
    INDEX idx_category (category)
);
```

**Fields:**
- `id`: Primary key
- `job_id`: Links to jobs table
- `name`: Item name
- `category`: Item category
- `quantity`: Number of items
- `base_price`: Base price per item
- `difficulty`: Difficulty level
- `estimated_time`: Estimated time in minutes
- `created_at`: Timestamp

### 6. job_photos (Before/after photos)

```sql
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
```

**Fields:**
- `id`: Primary key
- `job_id`: Links to jobs table
- `photo_type`: Type of photo (before/after)
- `photo_url`: URL to the photo
- `caption`: Optional photo caption
- `uploaded_at`: Upload timestamp

## Supporting Tables

### 7. job_status_history (Track status changes)

```sql
CREATE TABLE job_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NULL COMMENT 'Employee ID who made the change',
    notes TEXT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    INDEX idx_job_id (job_id),
    INDEX idx_changed_at (changed_at)
);
```

**Fields:**
- `id`: Primary key
- `job_id`: Links to jobs table
- `old_status`: Previous status
- `new_status`: New status
- `changed_by`: Employee who made the change
- `notes`: Additional notes about the change
- `changed_at`: When the change occurred

### 8. job_notes (Additional job notes and updates)

```sql
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
```

**Fields:**
- `id`: Primary key
- `job_id`: Links to jobs table
- `employee_id`: Employee who created the note
- `note_type`: Type of note
- `content`: Note content
- `is_important`: Whether the note is important
- `created_at`: Creation timestamp

## Table Relationships

### Primary Relationships

1. **jobs** → **businesses** (Many-to-One)
   - Each job belongs to one business
   - Foreign Key: `jobs.business_id` → `businesses.id`

2. **jobs** → **customers** (Many-to-One)
   - Each job belongs to one customer
   - Foreign Key: `jobs.customer_id` → `customers.id`

3. **jobs** → **employees** (Many-to-One)
   - Each job can be assigned to one employee
   - Foreign Key: `jobs.assigned_employee_id` → `employees.id`

4. **jobs** → **estimates** (Many-to-One)
   - Each job can be linked to one estimate
   - Foreign Key: `jobs.estimate_id` → `estimates.id`

### Secondary Relationships

5. **job_items** → **jobs** (One-to-Many)
   - Each job can have multiple items
   - Foreign Key: `job_items.job_id` → `jobs.id`

6. **job_photos** → **jobs** (One-to-Many)
   - Each job can have multiple photos
   - Foreign Key: `job_photos.job_id` → `jobs.id`

7. **job_status_history** → **jobs** (One-to-Many)
   - Track all status changes for a job
   - Foreign Key: `job_status_history.job_id` → `jobs.id`

8. **job_notes** → **jobs** (One-to-Many)
   - Additional notes and updates for a job
   - Foreign Key: `job_notes.job_id` → `jobs.id`

9. **customers** → **businesses** (Many-to-One)
   - Each customer belongs to one business
   - Foreign Key: `customers.business_id` → `businesses.id`

10. **employees** → **businesses** (Many-to-One)
    - Each employee belongs to one business
    - Foreign Key: `employees.business_id` → `businesses.id`

11. **estimates** → **businesses** (Many-to-One)
    - Each estimate belongs to one business
    - Foreign Key: `estimates.business_id` → `businesses.id`

12. **estimates** → **customers** (Many-to-One)
    - Each estimate belongs to one customer
    - Foreign Key: `estimates.customer_id` → `customers.id`

## Features Supported

- ✅ **Job Management**: Create, edit, and track jobs
- ✅ **Customer Assignment**: Link jobs to customers
- ✅ **Employee Assignment**: Assign jobs to employees
- ✅ **Estimate Integration**: Link jobs to estimates
- ✅ **Item Tracking**: Track individual items within jobs
- ✅ **Photo Documentation**: Before/after photos
- ✅ **Status Tracking**: Track job status changes
- ✅ **Notes System**: Add notes and updates
- ✅ **Multi-tenant Support**: Business isolation
- ✅ **Performance Optimization**: Proper indexing
- ✅ **Data Integrity**: Foreign key constraints
- ✅ **Audit Trail**: Status history tracking

## Usage Examples

### Creating a New Job
```sql
INSERT INTO jobs (business_id, customer_id, title, description, scheduled_date, status)
VALUES (1, 123, 'Residential Cleanout', 'Remove old furniture and appliances', '2024-01-15 09:00:00', 'scheduled');
```

### Updating Job Status
```sql
UPDATE jobs SET status = 'in_progress' WHERE id = 456;

-- Also record the status change
INSERT INTO job_status_history (job_id, old_status, new_status, changed_by, notes)
VALUES (456, 'scheduled', 'in_progress', 789, 'Job started by crew');
```

### Adding Job Items
```sql
INSERT INTO job_items (job_id, name, category, quantity, base_price, difficulty, estimated_time)
VALUES (456, 'Couch', 'furniture', 1, 50.00, 'medium', 30);
```

### Adding Job Photos
```sql
INSERT INTO job_photos (job_id, photo_type, photo_url, caption)
VALUES (456, 'before', 'https://storage.example.com/jobs/456/before1.jpg', 'Living room before cleanup');
```

## Indexes for Performance

The schema includes strategic indexes for optimal query performance:

- **Business isolation**: `idx_business_id` on all tables
- **Status filtering**: `idx_status` on jobs and customers
- **Date range queries**: `idx_scheduled_date` on jobs
- **Employee assignment**: `idx_assigned_employee` on jobs
- **Customer lookups**: `idx_customer_id` on jobs and estimates
- **Photo organization**: `idx_photo_type` on job_photos
- **Note filtering**: `idx_note_type` on job_notes
- **History tracking**: `idx_changed_at` on job_status_history

This schema provides a robust foundation for the jobs functionality while maintaining data integrity and performance.
