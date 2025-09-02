# Calendar Database Schema for MySQL

This document outlines the complete MySQL database schema needed to support the Calendar tab functionality in your junk removal management system.

## Core Tables

### 1. calendar_events
Main table for storing calendar events and appointments.

```sql
CREATE TABLE calendar_events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    event_type ENUM('job', 'meeting', 'maintenance', 'training', 'other') DEFAULT 'job',
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_date DATE NULL,
    end_time TIME NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    location VARCHAR(500) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    recurring_pattern ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') DEFAULT 'none',
    recurring_end_date DATE NULL,
    created_by VARCHAR(36) NULL, -- employee_id
    assigned_to VARCHAR(36) NULL, -- employee_id or crew_id
    related_job_id VARCHAR(36) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_start_date (start_date),
    INDEX idx_event_type (event_type),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_related_job_id (related_job_id),
    INDEX idx_recurring_pattern (recurring_pattern),
    INDEX idx_date_range (start_date, end_date)
);
```

### 2. calendar_recurring_patterns
Detailed recurring pattern configuration for recurring events.

```sql
CREATE TABLE calendar_recurring_patterns (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    pattern_type ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    interval_value INT NOT NULL DEFAULT 1, -- Every X days/weeks/months/years
    weekdays JSON NULL, -- [1,3,5] for Monday, Wednesday, Friday
    month_day INT NULL, -- Day of month (1-31)
    month_week INT NULL, -- Week of month (1-5, -1 for last week)
    month_weekday INT NULL, -- Day of week (0-6, Sunday-Saturday)
    year_month INT NULL, -- Month of year (1-12)
    year_day INT NULL, -- Day of year (1-366)
    end_after_occurrences INT NULL,
    end_date DATE NULL,
    exceptions JSON NULL, -- Dates to exclude
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_pattern_type (pattern_type)
);
```

### 3. calendar_attendees
Track who is attending calendar events.

```sql
CREATE TABLE calendar_attendees (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    attendee_type ENUM('employee', 'customer', 'vendor', 'other') NOT NULL,
    attendee_id VARCHAR(36) NOT NULL, -- employee_id, customer_id, etc.
    attendee_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255) NULL,
    attendee_phone VARCHAR(20) NULL,
    response_status ENUM('pending', 'accepted', 'declined', 'tentative') DEFAULT 'pending',
    response_date TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_attendee (event_id, attendee_id),
    INDEX idx_event_id (event_id),
    INDEX idx_attendee_type (attendee_type),
    INDEX idx_response_status (response_status)
);
```

### 4. calendar_reminders
Notification and reminder system for calendar events.

```sql
CREATE TABLE calendar_reminders (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    reminder_type ENUM('email', 'sms', 'push', 'popup') NOT NULL,
    reminder_time TIMESTAMP NOT NULL,
    reminder_offset INT NOT NULL, -- Minutes before event
    message TEXT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    recipient_id VARCHAR(36) NULL, -- employee_id or customer_id
    recipient_type ENUM('employee', 'customer', 'all') DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_reminder_time (reminder_time),
    INDEX idx_is_sent (is_sent),
    INDEX idx_recipient_id (recipient_id)
);
```

### 5. calendar_categories
Organize calendar events by categories.

```sql
CREATE TABLE calendar_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
    icon VARCHAR(50) NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_category_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
);
```

### 6. calendar_event_categories
Many-to-many relationship between events and categories.

```sql
CREATE TABLE calendar_event_categories (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES calendar_categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_category (event_id, category_id),
    INDEX idx_event_id (event_id),
    INDEX idx_category_id (category_id)
);
```

### 7. calendar_availability
Track employee and crew availability for scheduling.

```sql
CREATE TABLE calendar_availability (
    id VARCHAR(36) PRIMARY KEY,
    resource_type ENUM('employee', 'crew', 'truck') NOT NULL,
    resource_id VARCHAR(36) NOT NULL, -- employee_id, crew_id, or truck_id
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    reason VARCHAR(255) NULL, -- Why unavailable (vacation, sick, maintenance, etc.)
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_resource_time (resource_type, resource_id, date, start_time),
    INDEX idx_resource_type (resource_type),
    INDEX idx_resource_id (resource_id),
    INDEX idx_date (date),
    INDEX idx_is_available (is_available)
);
```

### 8. calendar_working_hours
Define standard working hours for employees and crews.

```sql
CREATE TABLE calendar_working_hours (
    id VARCHAR(36) PRIMARY KEY,
    resource_type ENUM('employee', 'crew', 'company') NOT NULL,
    resource_id VARCHAR(36) NULL, -- NULL for company-wide hours
    day_of_week TINYINT NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME NULL,
    break_end TIME NULL,
    is_working_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_resource_day (resource_type, resource_id, day_of_week),
    INDEX idx_resource_type (resource_type),
    INDEX idx_resource_id (resource_id),
    INDEX idx_day_of_week (day_of_week)
);
```

### 9. calendar_holidays
Company holidays and non-working days.

```sql
CREATE TABLE calendar_holidays (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_year INT NULL, -- NULL for recurring every year
    description TEXT NULL,
    is_paid_holiday BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_holiday_date (date),
    INDEX idx_date (date),
    INDEX idx_is_recurring (is_recurring)
);
```

### 10. calendar_views
User preferences for calendar display.

```sql
CREATE TABLE calendar_views (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL, -- employee_id
    view_name VARCHAR(100) NOT NULL,
    view_type ENUM('day', 'week', 'month', 'year', 'agenda') DEFAULT 'month',
    default_view BOOLEAN DEFAULT FALSE,
    filters JSON NULL, -- Event type filters, category filters, etc.
    display_settings JSON NULL, -- Show/hide elements, colors, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_default (user_id, default_view),
    INDEX idx_user_id (user_id),
    INDEX idx_view_type (view_type)
);
```

## Sample Data Insertion

### Insert Sample Categories
```sql
INSERT INTO calendar_categories (id, name, color, icon, description, sort_order) VALUES
(UUID(), 'Jobs', '#3B82F6', 'briefcase', 'Junk removal jobs and appointments', 1),
(UUID(), 'Meetings', '#10B981', 'users', 'Team meetings and client consultations', 2),
(UUID(), 'Maintenance', '#F59E0B', 'wrench', 'Vehicle and equipment maintenance', 3),
(UUID(), 'Training', '#8B5CF6', 'graduation-cap', 'Employee training sessions', 4),
(UUID(), 'Holidays', '#EF4444', 'calendar', 'Company holidays and time off', 5);
```

### Insert Sample Working Hours
```sql
INSERT INTO calendar_working_hours (id, resource_type, day_of_week, start_time, end_time, is_working_day) VALUES
(UUID(), 'company', 1, '08:00:00', '17:00:00', TRUE), -- Monday
(UUID(), 'company', 2, '08:00:00', '17:00:00', TRUE), -- Tuesday
(UUID(), 'company', 3, '08:00:00', '17:00:00', TRUE), -- Wednesday
(UUID(), 'company', 4, '08:00:00', '17:00:00', TRUE), -- Thursday
(UUID(), 'company', 5, '08:00:00', '17:00:00', TRUE), -- Friday
(UUID(), 'company', 6, '09:00:00', '15:00:00', TRUE), -- Saturday
(UUID(), 'company', 0, '00:00:00', '00:00:00', FALSE); -- Sunday
```

### Insert Sample Holidays
```sql
INSERT INTO calendar_holidays (id, name, date, is_recurring, description) VALUES
(UUID(), 'New Year\'s Day', '2024-01-01', TRUE, 'New Year\'s Day'),
(UUID(), 'Memorial Day', '2024-05-27', TRUE, 'Memorial Day'),
(UUID(), 'Independence Day', '2024-07-04', TRUE, 'Independence Day'),
(UUID(), 'Labor Day', '2024-09-02', TRUE, 'Labor Day'),
(UUID(), 'Thanksgiving', '2024-11-28', TRUE, 'Thanksgiving Day'),
(UUID(), 'Christmas Day', '2024-12-25', TRUE, 'Christmas Day');
```

## Key Relationships

1. **calendar_events** → **jobs** (via related_job_id)
2. **calendar_events** → **employees** (via created_by, assigned_to)
3. **calendar_events** → **crews** (via assigned_to)
4. **calendar_attendees** → **calendar_events** (via event_id)
5. **calendar_attendees** → **employees** (via attendee_id)
6. **calendar_attendees** → **customers** (via attendee_id)
7. **calendar_reminders** → **calendar_events** (via event_id)
8. **calendar_event_categories** → **calendar_events** (via event_id)
9. **calendar_event_categories** → **calendar_categories** (via category_id)
10. **calendar_availability** → **employees/crews/trucks** (via resource_id)
11. **calendar_working_hours** → **employees/crews** (via resource_id)
12. **calendar_views** → **employees** (via user_id)

## Indexes for Performance

The schema includes strategic indexes for:
- Date and time-based queries
- Event type and status filtering
- Resource availability lookups
- Recurring pattern calculations
- User preference management

## Additional Considerations

1. **Recurring Events**: The recurring pattern system handles complex scheduling needs
2. **Availability Management**: Track when employees, crews, and equipment are available
3. **Multi-Resource Scheduling**: Support for assigning events to individuals or teams
4. **Notification System**: Built-in reminder and notification capabilities
5. **Category Management**: Organize events by type with custom colors and icons
6. **Working Hours**: Define standard schedules and handle exceptions
7. **Holiday Management**: Company-wide non-working days
8. **User Preferences**: Personalized calendar views and settings

This schema provides a robust foundation for managing a comprehensive calendar system that integrates with your jobs, employees, and equipment management.
