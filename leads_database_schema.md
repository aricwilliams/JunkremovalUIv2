# Leads Database Schema for MySQL

This document outlines the complete MySQL database schema needed to support the Leads tab functionality in your junk removal management system.

## Core Tables

### 1. leads
Main table for storing lead information.

```sql
CREATE TABLE leads (
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
    status ENUM('new', 'contacted', 'quoted', 'scheduled', 'lost', 'converted') DEFAULT 'new',
    source ENUM('website', 'google', 'yelp', 'referral', 'facebook', 'instagram', 'phone_book', 'direct_mail', 'trade_show', 'other') DEFAULT 'other',
    estimated_value DECIMAL(10,2) NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    lead_score INT DEFAULT 0, -- 0-100 scoring system
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_contact_date TIMESTAMP NULL,
    next_follow_up_date DATE NULL,
    converted_at TIMESTAMP NULL,
    converted_to_customer_id VARCHAR(36) NULL,
    assigned_to VARCHAR(36) NULL, -- employee_id
    created_by VARCHAR(36) NULL, -- employee_id
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_source (source),
    INDEX idx_priority (priority),
    INDEX idx_lead_score (lead_score),
    INDEX idx_city_state (city, state),
    INDEX idx_zip_code (zip_code),
    INDEX idx_created_at (created_at),
    INDEX idx_last_contact_date (last_contact_date),
    INDEX idx_next_follow_up_date (next_follow_up_date),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_converted_to_customer_id (converted_to_customer_id),
    INDEX idx_coordinates (latitude, longitude)
);
```

### 2. lead_contacts
Additional contact persons for leads (multiple contacts per lead).

```sql
CREATE TABLE lead_contacts (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    contact_type ENUM('primary', 'secondary', 'decision_maker', 'influencer', 'other') DEFAULT 'primary',
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
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_contact_type (contact_type),
    INDEX idx_is_primary_contact (is_primary_contact),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);
```

### 3. lead_activities
Track all activities and interactions with leads.

```sql
CREATE TABLE lead_activities (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    activity_type ENUM('phone_call', 'email', 'sms', 'meeting', 'site_visit', 'quote_sent', 'follow_up', 'other') NOT NULL,
    subject VARCHAR(255) NULL,
    description TEXT NOT NULL,
    activity_date TIMESTAMP NOT NULL,
    duration_minutes INT NULL, -- For calls and meetings
    outcome ENUM('positive', 'negative', 'neutral', 'scheduled', 'rescheduled', 'cancelled') DEFAULT 'neutral',
    next_action VARCHAR(255) NULL,
    next_action_date DATE NULL,
    employee_id VARCHAR(36) NULL, -- Who performed the activity
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_activity_date (activity_date),
    INDEX idx_outcome (outcome),
    INDEX idx_employee_id (employee_id),
    INDEX idx_next_action_date (next_action_date),
    INDEX idx_is_completed (is_completed)
);
```

### 4. lead_notes
Internal notes and communication history for leads.

```sql
CREATE TABLE lead_notes (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    note_type ENUM('general', 'communication', 'qualification', 'objection', 'follow_up', 'internal') DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by VARCHAR(36) NULL, -- employee_id
    is_internal BOOLEAN DEFAULT FALSE, -- Not visible to lead
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    due_date DATE NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by VARCHAR(36) NULL, -- employee_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_note_type (note_type),
    INDEX idx_created_by (created_by),
    INDEX idx_is_internal (is_internal),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date),
    INDEX idx_is_completed (is_completed)
);
```

### 5. lead_qualifications
Track lead qualification criteria and scoring.

```sql
CREATE TABLE lead_qualifications (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    qualification_criteria VARCHAR(100) NOT NULL, -- Budget, Timeline, Authority, Need
    score INT NOT NULL, -- 1-10 rating
    notes TEXT NULL,
    assessed_by VARCHAR(36) NULL, -- employee_id
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_qualification_criteria (qualification_criteria),
    INDEX idx_score (score),
    INDEX idx_assessed_by (assessed_by)
);
```

### 6. lead_sources
Detailed tracking of lead sources and campaigns.

```sql
CREATE TABLE lead_sources (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    source_type ENUM('organic_search', 'paid_search', 'social_media', 'referral', 'direct', 'email', 'other') NOT NULL,
    source_name VARCHAR(255) NOT NULL, -- Google, Facebook, Yelp, etc.
    campaign_name VARCHAR(255) NULL,
    campaign_id VARCHAR(100) NULL,
    keyword VARCHAR(255) NULL, -- For search-based leads
    referrer_url TEXT NULL,
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(100) NULL,
    utm_term VARCHAR(100) NULL,
    utm_content VARCHAR(100) NULL,
    cost_per_lead DECIMAL(8,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_source_type (source_type),
    INDEX idx_source_name (source_name),
    INDEX idx_campaign_name (campaign_name),
    INDEX idx_keyword (keyword)
);
```

### 7. lead_quotes
Track quotes sent to leads.

```sql
CREATE TABLE lead_quotes (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    quote_number VARCHAR(50) NOT NULL,
    quote_amount DECIMAL(10,2) NOT NULL,
    quote_type ENUM('initial', 'revised', 'final') DEFAULT 'initial',
    status ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
    sent_at TIMESTAMP NULL,
    viewed_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    response ENUM('accepted', 'rejected', 'counter_offer', 'requested_changes') NULL,
    counter_offer_amount DECIMAL(10,2) NULL,
    expiry_date DATE NULL,
    notes TEXT NULL,
    created_by VARCHAR(36) NULL, -- employee_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quote_number (quote_number),
    INDEX idx_lead_id (lead_id),
    INDEX idx_quote_number (quote_number),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_created_by (created_by)
);
```

### 8. lead_follow_ups
Track follow-up tasks and reminders for leads.

```sql
CREATE TABLE lead_follow_ups (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    follow_up_type ENUM('call', 'email', 'meeting', 'site_visit', 'quote_follow_up', 'other') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to VARCHAR(36) NULL, -- employee_id
    status ENUM('pending', 'in_progress', 'completed', 'cancelled', 'overdue') DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    outcome TEXT NULL,
    next_follow_up_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_follow_up_type (follow_up_type),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    INDEX idx_next_follow_up_date (next_follow_up_date)
);
```

### 9. lead_conversions
Track when leads are converted to customers.

```sql
CREATE TABLE lead_conversions (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    conversion_date TIMESTAMP NOT NULL,
    conversion_reason VARCHAR(255) NULL, -- What triggered the conversion
    conversion_value DECIMAL(10,2) NULL, -- Value of the first job
    conversion_channel ENUM('phone', 'email', 'website', 'in_person', 'other') NOT NULL,
    converted_by VARCHAR(36) NULL, -- employee_id
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lead_conversion (lead_id),
    INDEX idx_lead_id (lead_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_conversion_date (conversion_date),
    INDEX idx_converted_by (converted_by)
);
```

### 10. lead_tags
Flexible tagging system for leads.

```sql
CREATE TABLE lead_tags (
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

### 11. lead_tag_assignments
Many-to-many relationship between leads and tags.

```sql
CREATE TABLE lead_tag_assignments (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    assigned_by VARCHAR(36) NULL, -- employee_id
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES lead_tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lead_tag (lead_id, tag_id),
    INDEX idx_lead_id (lead_id),
    INDEX idx_tag_id (tag_id)
);
```

### 12. lead_workflows
Track lead progression through sales workflows.

```sql
CREATE TABLE lead_workflows (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    current_stage VARCHAR(100) NOT NULL,
    stage_order INT NOT NULL,
    entered_stage_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stage_duration_hours INT NULL, -- How long in current stage
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_workflow_name (workflow_name),
    INDEX idx_current_stage (current_stage),
    INDEX idx_is_completed (is_completed)
);
```

## Sample Data Insertion

### Insert Sample Lead Tags
```sql
INSERT INTO lead_tags (id, name, color, description) VALUES
(UUID(), 'Hot Lead', '#EF4444', 'High priority lead requiring immediate attention'),
(UUID(), 'Cold Lead', '#6B7280', 'Low priority lead for follow-up'),
(UUID(), 'Qualified', '#10B981', 'Lead that meets qualification criteria'),
(UUID(), 'Budget Ready', '#F59E0B', 'Lead with confirmed budget'),
(UUID(), 'Timeline Urgent', '#DC2626', 'Lead with urgent timeline'),
(UUID(), 'Commercial', '#3B82F6', 'Commercial property lead'),
(UUID(), 'Residential', '#8B5CF6', 'Residential property lead'),
(UUID(), 'Referral', '#06B6D4', 'Lead from customer referral');
```

### Insert Sample Lead Source Types
```sql
INSERT INTO lead_sources (id, lead_id, source_type, source_name, campaign_name) VALUES
(UUID(), 'lead-uuid-1', 'organic_search', 'Google', 'Organic SEO Campaign'),
(UUID(), 'lead-uuid-1', 'paid_search', 'Google Ads', 'Spring Cleanup Campaign'),
(UUID(), 'lead-uuid-2', 'social_media', 'Facebook', 'Facebook Lead Ads'),
(UUID(), 'lead-uuid-3', 'referral', 'Customer Referral', 'Referral Program'),
(UUID(), 'lead-uuid-4', 'direct', 'Website Contact Form', 'Website Leads');
```

### Insert Sample Lead Activities
```sql
INSERT INTO lead_activities (id, lead_id, activity_type, subject, description, activity_date, outcome, next_action, next_action_date) VALUES
(UUID(), 'lead-uuid-1', 'phone_call', 'Initial Contact', 'Called lead to discuss junk removal needs. Very interested in our services.', NOW(), 'positive', 'Send quote', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
(UUID(), 'lead-uuid-1', 'email', 'Quote Sent', 'Sent detailed quote for junk removal services.', NOW(), 'neutral', 'Follow up call', DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
(UUID(), 'lead-uuid-2', 'meeting', 'Site Visit', 'Conducted on-site assessment of junk removal needs.', NOW(), 'positive', 'Send proposal', DATE_ADD(CURDATE(), INTERVAL 1 DAY));
```

## Key Relationships

1. **leads** → **lead_contacts** (via lead_id)
2. **leads** → **lead_activities** (via lead_id)
3. **leads** → **lead_notes** (via lead_id)
4. **leads** → **lead_qualifications** (via lead_id)
5. **leads** → **lead_sources** (via lead_id)
6. **leads** → **lead_quotes** (via lead_id)
7. **leads** → **lead_follow_ups** (via lead_id)
8. **leads** → **lead_conversions** (via lead_id)
9. **leads** → **lead_tag_assignments** (via lead_id)
10. **leads** → **lead_workflows** (via lead_id)
11. **lead_tag_assignments** → **lead_tags** (via tag_id)
12. **leads** → **customers** (via converted_to_customer_id)

## Indexes for Performance

The schema includes strategic indexes for:
- Lead search and filtering
- Status and source-based queries
- Activity tracking and follow-ups
- Qualification and scoring
- Source attribution and campaign tracking
- Workflow progression monitoring

## Additional Considerations

1. **Lead Scoring**: Implement automated lead scoring based on activities and qualifications
2. **Workflow Automation**: Set up automated workflows for lead progression
3. **Source Attribution**: Track marketing campaign effectiveness and ROI
4. **Follow-up Management**: Automated reminders and task assignments
5. **Conversion Tracking**: Monitor conversion rates and optimize sales process
6. **Lead Nurturing**: Automated email sequences and follow-up campaigns
7. **Performance Analytics**: Track lead performance by source, employee, and campaign
8. **Integration**: Connect with CRM systems and marketing automation tools

This schema provides a robust foundation for managing leads, tracking their progression through the sales funnel, and converting them into customers for your junk removal business.
