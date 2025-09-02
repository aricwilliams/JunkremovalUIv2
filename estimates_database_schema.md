# Estimates Database Schema for MySQL

This document outlines the complete MySQL database schema needed to support the Estimates tab functionality in your junk removal management system.

## Core Tables

### 1. client_requests
Main table for storing client portal requests that can be converted to estimates.

```sql
CREATE TABLE client_requests (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NULL,
    customer_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    type ENUM('pickup', 'service', 'emergency', 'maintenance') DEFAULT 'service',
    priority ENUM('urgent', 'high', 'medium', 'low', 'standard') DEFAULT 'medium',
    status ENUM('pending', 'reviewing', 'quoted', 'scheduled', 'completed', 'cancelled') DEFAULT 'pending',
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    requested_date DATE NOT NULL,
    preferred_date DATE NULL,
    preferred_time VARCHAR(50) NULL,
    service_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    location_on_property VARCHAR(255) NULL,
    approximate_volume VARCHAR(100) NULL,
    approximate_item_count VARCHAR(100) NULL,
    gate_code VARCHAR(50) NULL,
    apartment_number VARCHAR(50) NULL,
    access_considerations TEXT NULL,
    material_types JSON NULL,
    hazardous_material BOOLEAN DEFAULT FALSE,
    hazardous_description TEXT NULL,
    has_mold BOOLEAN DEFAULT FALSE,
    has_pests BOOLEAN DEFAULT FALSE,
    has_sharp_objects BOOLEAN DEFAULT FALSE,
    heavy_lifting_required BOOLEAN DEFAULT FALSE,
    disassembly_required BOOLEAN DEFAULT FALSE,
    disassembly_description TEXT NULL,
    filled_with_water BOOLEAN DEFAULT FALSE,
    filled_with_oil BOOLEAN DEFAULT FALSE,
    items_in_bags BOOLEAN DEFAULT FALSE,
    bag_contents TEXT NULL,
    oversized_items BOOLEAN DEFAULT FALSE,
    oversized_description TEXT NULL,
    request_donation_pickup BOOLEAN DEFAULT FALSE,
    request_demolition BOOLEAN DEFAULT FALSE,
    demolition_description TEXT NULL,
    text_opt_in BOOLEAN DEFAULT FALSE,
    how_did_you_hear VARCHAR(255) NULL,
    additional_notes TEXT NULL,
    attachments JSON NULL,
    notes TEXT NULL,
    can_create_estimate BOOLEAN DEFAULT TRUE,
    estimate_status ENUM('pending', 'created', 'sent', 'accepted', 'rejected') DEFAULT 'pending',
    estimate_id VARCHAR(36) NULL,
    volume_weight DECIMAL(10, 2) NULL,
    volume_yardage DECIMAL(8, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_estimate_status (estimate_status),
    INDEX idx_preferred_date (preferred_date),
    INDEX idx_created_at (created_at)
);
```

### 2. estimates
Main table for storing estimates created from client requests.

```sql
CREATE TABLE estimates (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    labor_hours DECIMAL(4, 2) NOT NULL DEFAULT 0,
    labor_rate DECIMAL(8, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted') DEFAULT 'draft',
    sent_date TIMESTAMP NULL,
    expiry_date DATE NOT NULL,
    accepted_date TIMESTAMP NULL,
    rejected_date TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    notes TEXT NULL,
    terms_conditions TEXT NULL,
    payment_terms VARCHAR(255) NULL,
    volume_weight DECIMAL(10, 2) NULL,
    volume_yardage DECIMAL(8, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_created_at (created_at)
);
```

### 3. estimate_items
Individual items within each estimate with pricing and specifications.

```sql
CREATE TABLE estimate_items (
    id VARCHAR(36) PRIMARY KEY,
    estimate_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity DECIMAL(8, 2) NOT NULL DEFAULT 1,
    base_price DECIMAL(8, 2) NOT NULL DEFAULT 0,
    price_per_unit DECIMAL(8, 2) NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    estimated_time DECIMAL(4, 2) NULL,
    volume_weight DECIMAL(8, 2) NULL,
    volume_yardage DECIMAL(6, 2) NULL,
    description TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
    INDEX idx_estimate_id (estimate_id),
    INDEX idx_category (category)
);
```

### 4. estimate_additional_fees
Additional fees applied to estimates (disposal, travel, difficulty, etc.).

```sql
CREATE TABLE estimate_additional_fees (
    id VARCHAR(36) PRIMARY KEY,
    estimate_id VARCHAR(36) NOT NULL,
    fee_type ENUM('disposal', 'travel', 'difficulty', 'hazardous', 'after_hours', 'weekend', 'holiday', 'rush', 'custom') NOT NULL,
    description VARCHAR(255) NULL,
    amount DECIMAL(8, 2) NOT NULL DEFAULT 0,
    is_percentage BOOLEAN DEFAULT FALSE,
    percentage_rate DECIMAL(5, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
    INDEX idx_estimate_id (estimate_id),
    INDEX idx_fee_type (fee_type)
);
```

### 5. pricing_items
Master catalog of pricing items that can be used in estimates.

```sql
CREATE TABLE pricing_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_price DECIMAL(8, 2) NOT NULL DEFAULT 0,
    price_per_unit DECIMAL(8, 2) NULL,
    unit_type VARCHAR(50) NULL,
    estimated_time DECIMAL(4, 2) NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    description TEXT NULL,
    volume_weight DECIMAL(8, 2) NULL,
    volume_yardage DECIMAL(6, 2) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
);
```

### 6. pricing_categories
Categories for organizing pricing items.

```sql
CREATE TABLE pricing_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) NULL,
    icon VARCHAR(50) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
);
```

### 7. estimate_templates
Reusable estimate templates for common service types.

```sql
CREATE TABLE estimate_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);
```

### 8. estimate_template_items
Items within estimate templates.

```sql
CREATE TABLE estimate_template_items (
    id VARCHAR(36) PRIMARY KEY,
    template_id VARCHAR(36) NOT NULL,
    pricing_item_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity DECIMAL(8, 2) NOT NULL DEFAULT 1,
    base_price DECIMAL(8, 2) NOT NULL DEFAULT 0,
    price_per_unit DECIMAL(8, 2) NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    estimated_time DECIMAL(4, 2) NULL,
    volume_weight DECIMAL(8, 2) NULL,
    volume_yardage DECIMAL(6, 2) NULL,
    description TEXT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES estimate_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (pricing_item_id) REFERENCES pricing_items(id) ON DELETE SET NULL,
    INDEX idx_template_id (template_id),
    INDEX idx_sort_order (sort_order)
);
```

### 9. estimate_attachments
Files and documents attached to estimates.

```sql
CREATE TABLE estimate_attachments (
    id VARCHAR(36) PRIMARY KEY,
    estimate_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NULL,
    file_type VARCHAR(100) NULL,
    description VARCHAR(255) NULL,
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
    INDEX idx_estimate_id (estimate_id),
    INDEX idx_file_type (file_type)
);
```

### 10. estimate_history
Audit trail of all changes made to estimates.

```sql
CREATE TABLE estimate_history (
    id VARCHAR(36) PRIMARY KEY,
    estimate_id VARCHAR(36) NOT NULL,
    action ENUM('created', 'updated', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted') NOT NULL,
    user_id VARCHAR(36) NULL,
    user_name VARCHAR(255) NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    notes TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
    INDEX idx_estimate_id (estimate_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);
```

### 11. estimate_settings
Configuration settings for estimates (defaults, templates, etc.).

```sql
CREATE TABLE estimate_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);
```

## Sample Data

### Insert Sample Pricing Categories
```sql
INSERT INTO pricing_categories (id, name, description, color, icon, sort_order) VALUES
('cat-1', 'General Waste', 'Household and office waste materials', '#3B82F6', 'trash', 1),
('cat-2', 'Furniture', 'Furniture removal and disposal', '#10B981', 'sofa', 2),
('cat-3', 'Appliances', 'Large appliance removal', '#F59E0B', 'tv', 3),
('cat-4', 'Construction', 'Construction and renovation debris', '#EF4444', 'hammer', 4),
('cat-5', 'Electronics', 'Electronic waste and devices', '#8B5CF6', 'smartphone', 5),
('cat-6', 'Hazardous', 'Hazardous materials and chemicals', '#DC2626', 'alert-triangle', 6);
```

### Insert Sample Pricing Items
```sql
INSERT INTO pricing_items (id, name, category, base_price, price_per_unit, unit_type, estimated_time, difficulty, description, volume_weight, volume_yardage) VALUES
('price-1', 'General Waste', 'General Waste', 150.00, 25.00, 'bag', 2.0, 'easy', 'General household and office waste', 800.00, 12.00),
('price-2', 'Furniture', 'Furniture', 75.00, 50.00, 'piece', 1.5, 'medium', 'Furniture removal and disposal', 200.00, 4.00),
('price-3', 'Appliances', 'Appliances', 100.00, 75.00, 'piece', 2.0, 'hard', 'Large appliance removal', 300.00, 6.00),
('price-4', 'Construction Debris', 'Construction', 200.00, 100.00, 'yard', 3.0, 'hard', 'Construction and renovation debris', 1000.00, 15.00),
('price-5', 'Electronics', 'Electronics', 50.00, 25.00, 'piece', 1.0, 'medium', 'Electronic waste disposal', 50.00, 1.00),
('price-6', 'Hazardous Materials', 'Hazardous', 300.00, 150.00, 'container', 4.0, 'hard', 'Hazardous materials handling', 500.00, 8.00);
```

### Insert Sample Estimate Settings
```sql
INSERT INTO estimate_settings (id, setting_key, setting_value, setting_type, description) VALUES
('est-1', 'default_labor_rate', '50.00', 'number', 'Default hourly labor rate for estimates'),
('est-2', 'estimate_expiry_days', '30', 'number', 'Number of days estimates are valid'),
('est-3', 'default_terms', 'Payment due upon completion. 30-day warranty on work performed.', 'string', 'Default terms and conditions'),
('est-4', 'require_customer_signature', 'true', 'boolean', 'Whether customer signature is required'),
('est-5', 'auto_send_followup', 'true', 'boolean', 'Automatically send follow-up emails'),
('est-6', 'default_payment_terms', 'Net 30', 'string', 'Default payment terms'),
('est-7', 'estimate_number_prefix', 'EST-', 'string', 'Prefix for estimate numbers'),
('est-8', 'include_photos', 'true', 'boolean', 'Include photos in estimates by default');
```

## Key Features

### **Client Request Management:**
- Complete customer information capture
- Service details and specifications
- Hazardous materials identification
- Access considerations and special requirements
- Photo attachments and documentation

### **Estimate Generation:**
- Itemized pricing with quantities
- Labor cost calculations
- Additional fees (disposal, travel, difficulty)
- Volume and weight tracking
- Template-based estimates

### **Pricing Management:**
- Master catalog of pricing items
- Category organization
- Difficulty-based pricing
- Time and volume estimates
- Active/inactive item management

### **Documentation & Tracking:**
- File attachments
- Complete audit trail
- Status tracking
- Expiry management
- Conversion tracking

### **Advanced Features:**
- Reusable estimate templates
- Customer portal integration
- Automated follow-ups
- Multi-currency support
- Tax calculations

This schema provides a robust foundation for managing the complete estimate lifecycle from client request to job conversion, with comprehensive tracking and reporting capabilities.
