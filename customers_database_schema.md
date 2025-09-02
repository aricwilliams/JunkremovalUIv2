# Customers Database Schema for MySQL

This document outlines the complete MySQL database schema needed to support the Customers tab functionality in your junk removal management system.

## Core Tables

### 1. customers
Main table for storing customer information.

```sql
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    status ENUM('new', 'quoted', 'scheduled', 'completed', 'inactive', 'blacklisted') DEFAULT 'new',
    customer_type ENUM('residential', 'commercial', 'industrial', 'government') DEFAULT 'residential',
    property_type ENUM('house', 'apartment', 'condo', 'office', 'warehouse', 'retail', 'other') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_contact_date TIMESTAMP NULL,
    total_jobs INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    average_job_value DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT NULL,
    source ENUM('website', 'google', 'yelp', 'referral', 'facebook', 'instagram', 'phone_book', 'other') DEFAULT 'other',
    marketing_consent BOOLEAN DEFAULT FALSE,
    sms_consent BOOLEAN DEFAULT FALSE,
    email_consent BOOLEAN DEFAULT FALSE,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_customer_type (customer_type),
    INDEX idx_city_state (city, state),
    INDEX idx_zip_code (zip_code),
    INDEX idx_created_at (created_at),
    INDEX idx_last_contact_date (last_contact_date),
    INDEX idx_source (source),
    INDEX idx_coordinates (latitude, longitude)
);
```

### 2. customer_contacts
Additional contact persons for customers (multiple contacts per customer).

```sql
CREATE TABLE customer_contacts (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    contact_type ENUM('primary', 'secondary', 'emergency', 'billing', 'property_manager') DEFAULT 'secondary',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    mobile VARCHAR(20) NULL,
    relationship VARCHAR(100) NULL, -- Spouse, Manager, etc.
    is_primary_contact BOOLEAN DEFAULT FALSE,
    can_make_decisions BOOLEAN DEFAULT FALSE,
    preferred_contact_method ENUM('phone', 'email', 'sms', 'mail') DEFAULT 'phone',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_contact_type (contact_type),
    INDEX idx_is_primary_contact (is_primary_contact),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);
```

### 3. customer_addresses
Multiple addresses per customer (billing, service, etc.).

```sql
CREATE TABLE customer_addresses (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    address_type ENUM('billing', 'service', 'mailing', 'other') DEFAULT 'service',
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    access_notes TEXT NULL, -- Gate codes, parking info, etc.
    service_area_notes TEXT NULL, -- Special instructions for service
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_address_type (address_type),
    INDEX idx_is_primary (is_primary),
    INDEX idx_city_state (city, state),
    INDEX idx_zip_code (zip_code),
    INDEX idx_coordinates (latitude, longitude)
);
```

### 4. customer_tags
Flexible tagging system for customers.

```sql
CREATE TABLE customer_tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_tag_name (name),
    INDEX idx_is_active (is_active)
);
```

### 5. customer_tag_assignments
Many-to-many relationship between customers and tags.

```sql
CREATE TABLE customer_tag_assignments (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    assigned_by VARCHAR(36) NULL, -- employee_id
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES customer_tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_tag (customer_id, tag_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_tag_id (tag_id)
);
```

### 6. customer_notes
Internal notes and communication history.

```sql
CREATE TABLE customer_notes (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    note_type ENUM('general', 'communication', 'issue', 'follow_up', 'internal') DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by VARCHAR(36) NULL, -- employee_id
    is_internal BOOLEAN DEFAULT FALSE, -- Not visible to customer
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    due_date DATE NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by VARCHAR(36) NULL, -- employee_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_note_type (note_type),
    INDEX idx_created_by (created_by),
    INDEX idx_is_internal (is_internal),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date),
    INDEX idx_is_completed (is_completed)
);
```

### 7. customer_communications
Track all customer communications (calls, emails, SMS).

```sql
CREATE TABLE customer_communications (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    communication_type ENUM('phone_call', 'email', 'sms', 'in_person', 'portal_message') NOT NULL,
    direction ENUM('inbound', 'outbound') NOT NULL,
    subject VARCHAR(255) NULL,
    content TEXT NULL,
    duration_seconds INT NULL, -- For phone calls
    contact_person_id VARCHAR(36) NULL, -- customer_contact_id
    employee_id VARCHAR(36) NULL, -- Who handled the communication
    status ENUM('initiated', 'in_progress', 'completed', 'failed', 'scheduled') DEFAULT 'completed',
    scheduled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE NULL,
    follow_up_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_communication_type (communication_type),
    INDEX idx_direction (direction),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_follow_up_required (follow_up_required),
    INDEX idx_follow_up_date (follow_up_date)
);
```

### 8. customer_preferences
Customer-specific preferences and settings.

```sql
CREATE TABLE customer_preferences (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT NULL,
    preference_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_preference (customer_id, preference_key),
    INDEX idx_customer_id (customer_id),
    INDEX idx_preference_key (preference_key)
);
```

### 9. customer_documents
Store customer-related documents and files.

```sql
CREATE TABLE customer_documents (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    document_type ENUM('contract', 'invoice', 'estimate', 'photo', 'id_document', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL, -- in bytes
    mime_type VARCHAR(100) NOT NULL,
    description TEXT NULL,
    uploaded_by VARCHAR(36) NULL, -- employee_id
    is_public BOOLEAN DEFAULT FALSE, -- Visible to customer in portal
    expires_at DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_is_public (is_public),
    INDEX idx_expires_at (expires_at)
);
```

### 10. customer_relationships
Track relationships between customers (referrals, family members, etc.).

```sql
CREATE TABLE customer_relationships (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    related_customer_id VARCHAR(36) NOT NULL,
    relationship_type ENUM('referral', 'family_member', 'business_partner', 'neighbor', 'other') NOT NULL,
    relationship_description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (related_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_relationship (customer_id, related_customer_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_related_customer_id (related_customer_id),
    INDEX idx_relationship_type (relationship_type)
);
```

### 11. customer_service_history
Track service history and preferences.

```sql
CREATE TABLE customer_service_history (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    service_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    service_description TEXT NULL,
    service_value DECIMAL(10,2) NULL,
    employee_id VARCHAR(36) NULL, -- Who performed the service
    customer_satisfaction INT NULL, -- 1-5 rating
    feedback TEXT NULL,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_service_date (service_date),
    INDEX idx_service_type (service_type),
    INDEX idx_employee_id (employee_id),
    INDEX idx_customer_satisfaction (customer_satisfaction)
);
```

### 12. customer_marketing
Marketing preferences and campaign tracking.

```sql
CREATE TABLE customer_marketing (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type ENUM('email', 'sms', 'direct_mail', 'social_media', 'other') NOT NULL,
    sent_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    response_type ENUM('positive', 'negative', 'neutral', 'unsubscribe') NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_campaign_name (campaign_name),
    INDEX idx_campaign_type (campaign_type),
    INDEX idx_sent_at (sent_at),
    INDEX idx_response_type (response_type)
);
```

## Sample Data Insertion

### Insert Sample Customer Tags
```sql
INSERT INTO customer_tags (id, name, color, description) VALUES
(UUID(), 'VIP', '#FFD700', 'Very Important Customer'),
(UUID(), 'Commercial', '#10B981', 'Commercial property customer'),
(UUID(), 'Referral', '#8B5CF6', 'Customer referred by another customer'),
(UUID(), 'High Value', '#F59E0B', 'High value customer'),
(UUID(), 'New Customer', '#3B82F6', 'Recently acquired customer'),
(UUID(), 'Repeat Customer', '#EF4444', 'Returning customer'),
(UUID(), 'Property Manager', '#06B6D4', 'Property management company'),
(UUID(), 'Contractor', '#84CC16', 'Construction or contractor customer');
```

### Insert Sample Customer Preferences
```sql
INSERT INTO customer_preferences (id, customer_id, preference_key, preference_value, preference_type, description) VALUES
(UUID(), 'customer-uuid-1', 'preferred_contact_time', 'afternoon', 'string', 'Preferred time to contact'),
(UUID(), 'customer-uuid-1', 'service_reminders', 'true', 'boolean', 'Send service reminders'),
(UUID(), 'customer-uuid-1', 'marketing_emails', 'false', 'boolean', 'Receive marketing emails'),
(UUID(), 'customer-uuid-1', 'special_instructions', 'Gate code: 1234, Park in driveway', 'string', 'Special service instructions'),
(UUID(), 'customer-uuid-1', 'payment_terms', 'net30', 'string', 'Preferred payment terms');
```

### Insert Sample Customer Notes
```sql
INSERT INTO customer_notes (id, customer_id, note_type, title, content, priority, is_internal) VALUES
(UUID(), 'customer-uuid-1', 'communication', 'Initial Contact', 'Customer called about junk removal. Very interested in our services.', 'medium', FALSE),
(UUID(), 'customer-uuid-1', 'internal', 'Credit Check', 'Credit check completed - approved for net30 terms.', 'low', TRUE),
(UUID(), 'customer-uuid-1', 'follow_up', 'Follow Up Call', 'Customer requested follow-up call next week about scheduling.', 'medium', FALSE);
```

## Key Relationships

1. **customers** → **customer_contacts** (via customer_id)
2. **customers** → **customer_addresses** (via customer_id)
3. **customers** → **customer_tag_assignments** (via customer_id)
4. **customers** → **customer_notes** (via customer_id)
5. **customers** → **customer_communications** (via customer_id)
6. **customers** → **customer_preferences** (via customer_id)
7. **customers** → **customer_documents** (via customer_id)
8. **customers** → **customer_relationships** (via customer_id)
9. **customers** → **customer_service_history** (via customer_id)
10. **customers** → **customer_marketing** (via customer_id)
11. **customer_tag_assignments** → **customer_tags** (via tag_id)
12. **customer_contacts** → **customers** (via customer_id)

## Indexes for Performance

The schema includes strategic indexes for:
- Customer search and filtering
- Status and type-based queries
- Location-based searches
- Communication tracking
- Document management
- Marketing campaign tracking

## Additional Considerations

1. **Data Privacy**: Implement proper data retention and deletion policies
2. **GDPR Compliance**: Track consent and provide data export/deletion capabilities
3. **Audit Trail**: The notes and communications tables provide complete customer interaction history
4. **Marketing Integration**: Built-in campaign tracking and response management
5. **Document Management**: Secure file storage with access controls
6. **Relationship Tracking**: Monitor customer referrals and connections
7. **Service History**: Track all interactions and service requests
8. **Preference Management**: Personalized customer experience settings

This schema provides a robust foundation for managing customer relationships, tracking interactions, and maintaining comprehensive customer profiles for your junk removal business.
