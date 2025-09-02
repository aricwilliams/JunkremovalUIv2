# Fleet Management Database Schema for MySQL

This document outlines the complete MySQL database schema needed to support the Fleet Management tab functionality in your junk removal management system.

## Core Tables

### 1. vehicles
Main table for storing all fleet vehicles (trucks, trailers, etc.).

```sql
CREATE TABLE vehicles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vin VARCHAR(17) NULL UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    vehicle_type ENUM('truck', 'trailer', 'van', 'pickup', 'dump_truck', 'flatbed', 'other') DEFAULT 'truck',
    status ENUM('available', 'in-use', 'maintenance', 'out-of-service', 'retired', 'reserved') DEFAULT 'available',
    capacity_weight DECIMAL(10, 2) NULL,
    capacity_volume DECIMAL(8, 2) NULL,
    capacity_units VARCHAR(20) DEFAULT 'lbs',
    volume_units VARCHAR(20) DEFAULT 'yds³',
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'other') DEFAULT 'gasoline',
    fuel_capacity DECIMAL(6, 2) NULL,
    fuel_capacity_units VARCHAR(10) DEFAULT 'gallons',
    current_fuel_level DECIMAL(5, 2) NULL,
    mileage DECIMAL(10, 2) NOT NULL DEFAULT 0,
    mileage_units VARCHAR(10) DEFAULT 'miles',
    last_service_date DATE NULL,
    next_service_date DATE NULL,
    last_service_mileage DECIMAL(10, 2) NULL,
    next_service_mileage DECIMAL(10, 2) NULL,
    assigned_crew_id VARCHAR(36) NULL,
    assigned_job_id VARCHAR(36) NULL,
    current_location_lat DECIMAL(10, 8) NULL,
    current_location_lng DECIMAL(11, 8) NULL,
    current_location_address TEXT NULL,
    notes TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_vehicle_type (vehicle_type),
    INDEX idx_make_model (make, model),
    INDEX idx_next_service_date (next_service_date),
    INDEX idx_assigned_crew_id (assigned_crew_id),
    INDEX idx_assigned_job_id (assigned_job_id),
    INDEX idx_is_active (is_active)
);
```

### 2. vehicle_insurance
Insurance information for each vehicle.

```sql
CREATE TABLE vehicle_insurance (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    insurance_company VARCHAR(255) NOT NULL,
    policy_type ENUM('liability', 'comprehensive', 'collision', 'commercial', 'other') DEFAULT 'commercial',
    coverage_amount DECIMAL(12, 2) NULL,
    deductible DECIMAL(8, 2) NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    premium_amount DECIMAL(8, 2) NULL,
    premium_frequency ENUM('monthly', 'quarterly', 'semi-annually', 'annually') DEFAULT 'annually',
    agent_name VARCHAR(255) NULL,
    agent_phone VARCHAR(20) NULL,
    agent_email VARCHAR(255) NULL,
    notes TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_is_active (is_active)
);
```

### 3. vehicle_registration
Registration and licensing information for each vehicle.

```sql
CREATE TABLE vehicle_registration (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    registration_state VARCHAR(2) NOT NULL,
    registration_type ENUM('commercial', 'personal', 'farm', 'other') DEFAULT 'commercial',
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    renewal_fee DECIMAL(8, 2) NULL,
    weight_class VARCHAR(50) NULL,
    emissions_rating VARCHAR(50) NULL,
    notes TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_registration_state (registration_state),
    INDEX idx_is_active (is_active)
);
```

### 4. vehicle_maintenance
Maintenance records and service history for vehicles.

```sql
CREATE TABLE vehicle_maintenance (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'emergency', 'inspection', 'tire', 'brake', 'engine', 'transmission', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent', 'critical') DEFAULT 'medium',
    status ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'deferred') DEFAULT 'scheduled',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    scheduled_date DATE NULL,
    completed_date DATE NULL,
    scheduled_mileage DECIMAL(10, 2) NULL,
    completed_mileage DECIMAL(10, 2) NULL,
    estimated_cost DECIMAL(8, 2) NULL,
    actual_cost DECIMAL(8, 2) NULL,
    labor_hours DECIMAL(5, 2) NULL,
    labor_rate DECIMAL(6, 2) NULL,
    parts_cost DECIMAL(8, 2) NULL,
    performed_by VARCHAR(36) NULL,
    performed_by_name VARCHAR(255) NULL,
    service_location VARCHAR(255) NULL,
    next_service_date DATE NULL,
    next_service_mileage DECIMAL(10, 2) NULL,
    warranty_expiry DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_maintenance_type (maintenance_type),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_completed_date (completed_date),
    INDEX idx_performed_by (performed_by)
);
```

### 5. vehicle_maintenance_items
Individual maintenance items and parts used in maintenance records.

```sql
CREATE TABLE vehicle_maintenance_items (
    id VARCHAR(36) PRIMARY KEY,
    maintenance_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_type ENUM('part', 'fluid', 'filter', 'tire', 'tool', 'other') DEFAULT 'part',
    part_number VARCHAR(100) NULL,
    manufacturer VARCHAR(255) NULL,
    quantity DECIMAL(8, 2) NOT NULL DEFAULT 1,
    unit_cost DECIMAL(8, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(8, 2) NOT NULL DEFAULT 0,
    warranty_months INT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maintenance_id) REFERENCES vehicle_maintenance(id) ON DELETE CASCADE,
    INDEX idx_maintenance_id (maintenance_id),
    INDEX idx_item_type (item_type)
);
```

### 6. vehicle_maintenance_attachments
Files and documents related to maintenance records.

```sql
CREATE TABLE vehicle_maintenance_attachments (
    id VARCHAR(36) PRIMARY KEY,
    maintenance_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NULL,
    file_type VARCHAR(100) NULL,
    description VARCHAR(255) NULL,
    uploaded_by VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maintenance_id) REFERENCES vehicle_maintenance(id) ON DELETE CASCADE,
    INDEX idx_maintenance_id (maintenance_id),
    INDEX idx_file_type (file_type)
);
```

### 7. vehicle_fuel_logs
Fuel consumption and refueling records.

```sql
CREATE TABLE vehicle_fuel_logs (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    fuel_date DATE NOT NULL,
    fuel_time TIME NULL,
    fuel_station VARCHAR(255) NULL,
    fuel_station_address TEXT NULL,
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'other') DEFAULT 'gasoline',
    fuel_quantity DECIMAL(6, 2) NOT NULL,
    fuel_quantity_units VARCHAR(10) DEFAULT 'gallons',
    fuel_cost_per_unit DECIMAL(6, 2) NOT NULL,
    total_fuel_cost DECIMAL(8, 2) NOT NULL,
    odometer_reading DECIMAL(10, 2) NOT NULL,
    fuel_level_before DECIMAL(5, 2) NULL,
    fuel_level_after DECIMAL(5, 2) NULL,
    driver_id VARCHAR(36) NULL,
    driver_name VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_fuel_date (fuel_date),
    INDEX idx_driver_id (driver_id),
    INDEX idx_fuel_type (fuel_type)
);
```

### 8. vehicle_inspections
Vehicle inspection records and checklists.

```sql
CREATE TABLE vehicle_inspections (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    inspection_type ENUM('pre-trip', 'post-trip', 'daily', 'weekly', 'monthly', 'annual', 'safety', 'compliance') DEFAULT 'pre-trip',
    inspection_date DATE NOT NULL,
    inspection_time TIME NULL,
    inspector_id VARCHAR(36) NULL,
    inspector_name VARCHAR(255) NULL,
    odometer_reading DECIMAL(10, 2) NOT NULL,
    overall_condition ENUM('excellent', 'good', 'fair', 'poor', 'unsafe') DEFAULT 'good',
    passed_inspection BOOLEAN DEFAULT TRUE,
    failed_items TEXT NULL,
    corrective_actions TEXT NULL,
    next_inspection_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_inspection_type (inspection_type),
    INDEX idx_inspection_date (inspection_date),
    INDEX idx_inspector_id (inspector_id),
    INDEX idx_passed_inspection (passed_inspection)
);
```

### 9. vehicle_inspection_items
Individual inspection checklist items and their results.

```sql
CREATE TABLE vehicle_inspection_items (
    id VARCHAR(36) PRIMARY KEY,
    inspection_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(100) NULL,
    item_description TEXT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    status ENUM('pass', 'fail', 'na', 'attention') DEFAULT 'pass',
    notes TEXT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id) ON DELETE CASCADE,
    INDEX idx_inspection_id (inspection_id),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
);
```

### 10. vehicle_accidents
Accident and incident records for vehicles.

```sql
CREATE TABLE vehicle_accidents (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    accident_date DATE NOT NULL,
    accident_time TIME NULL,
    accident_location TEXT NOT NULL,
    accident_type ENUM('collision', 'rollover', 'fire', 'theft', 'vandalism', 'weather', 'mechanical', 'other') DEFAULT 'collision',
    severity ENUM('minor', 'moderate', 'major', 'totaled') DEFAULT 'minor',
    description TEXT NOT NULL,
    involved_parties TEXT NULL,
    police_report_number VARCHAR(100) NULL,
    insurance_claim_number VARCHAR(100) NULL,
    estimated_damage_cost DECIMAL(10, 2) NULL,
    actual_damage_cost DECIMAL(10, 2) NULL,
    vehicle_damage_description TEXT NULL,
    injuries TEXT NULL,
    witnesses TEXT NULL,
    weather_conditions VARCHAR(255) NULL,
    road_conditions VARCHAR(255) NULL,
    driver_id VARCHAR(36) NULL,
    driver_name VARCHAR(255) NULL,
    is_at_fault BOOLEAN DEFAULT FALSE,
    fault_description TEXT NULL,
    legal_status ENUM('pending', 'investigation', 'settled', 'closed', 'litigation') DEFAULT 'pending',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_accident_date (accident_date),
    INDEX idx_accident_type (accident_type),
    INDEX idx_severity (severity),
    INDEX idx_driver_id (driver_id),
    INDEX idx_legal_status (legal_status)
);
```

### 11. vehicle_documents
Document management for vehicles (manuals, warranties, etc.).

```sql
CREATE TABLE vehicle_documents (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    document_type ENUM('manual', 'warranty', 'title', 'registration', 'insurance', 'maintenance_log', 'inspection_report', 'accident_report', 'other') DEFAULT 'other',
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NULL,
    file_size BIGINT NULL,
    file_type VARCHAR(100) NULL,
    document_number VARCHAR(100) NULL,
    issue_date DATE NULL,
    expiry_date DATE NULL,
    description TEXT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by VARCHAR(36) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_document_type (document_type),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_is_required (is_required)
);
```

### 12. vehicle_assignments
Historical record of vehicle assignments to crews and jobs.

```sql
CREATE TABLE vehicle_assignments (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    crew_id VARCHAR(36) NULL,
    job_id VARCHAR(36) NULL,
    assignment_type ENUM('crew', 'job', 'maintenance', 'training', 'other') DEFAULT 'crew',
    start_date DATE NOT NULL,
    start_time TIME NULL,
    end_date DATE NULL,
    end_time TIME NULL,
    start_mileage DECIMAL(10, 2) NULL,
    end_mileage DECIMAL(10, 2) NULL,
    assigned_by VARCHAR(36) NULL,
    assigned_by_name VARCHAR(255) NULL,
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_crew_id (crew_id),
    INDEX idx_job_id (job_id),
    INDEX idx_assignment_type (assignment_type),
    INDEX idx_start_date (start_date),
    INDEX idx_status (status)
);
```

### 13. vehicle_tracking
Real-time and historical GPS tracking data for vehicles.

```sql
CREATE TABLE vehicle_tracking (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    tracking_date DATE NOT NULL,
    tracking_time TIME NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2) NULL,
    speed DECIMAL(6, 2) NULL,
    speed_units VARCHAR(10) DEFAULT 'mph',
    heading DECIMAL(5, 2) NULL,
    fuel_level DECIMAL(5, 2) NULL,
    engine_status ENUM('running', 'stopped', 'idle', 'unknown') DEFAULT 'unknown',
    ignition_status ENUM('on', 'off', 'unknown') DEFAULT 'unknown',
    door_status ENUM('open', 'closed', 'unknown') DEFAULT 'unknown',
    battery_voltage DECIMAL(4, 2) NULL,
    temperature DECIMAL(5, 2) NULL,
    temperature_units VARCHAR(10) DEFAULT 'fahrenheit',
    location_address TEXT NULL,
    accuracy DECIMAL(4, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_tracking_date (tracking_date),
    INDEX idx_tracking_time (tracking_time),
    INDEX idx_latitude_longitude (latitude, longitude)
);
```

### 14. vehicle_costs
Comprehensive cost tracking for vehicles.

```sql
CREATE TABLE vehicle_costs (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    cost_date DATE NOT NULL,
    cost_type ENUM('fuel', 'maintenance', 'repair', 'insurance', 'registration', 'tires', 'depreciation', 'lease', 'loan', 'other') NOT NULL,
    cost_category VARCHAR(100) NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    quantity DECIMAL(8, 2) NULL,
    unit_cost DECIMAL(8, 2) NULL,
    vendor VARCHAR(255) NULL,
    invoice_number VARCHAR(100) NULL,
    payment_method ENUM('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'other') DEFAULT 'cash',
    odometer_reading DECIMAL(10, 2) NULL,
    maintenance_id VARCHAR(36) NULL,
    fuel_log_id VARCHAR(36) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (maintenance_id) REFERENCES vehicle_maintenance(id) ON DELETE SET NULL,
    FOREIGN KEY (fuel_log_id) REFERENCES vehicle_fuel_logs(id) ON DELETE SET NULL,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_cost_date (cost_date),
    INDEX idx_cost_type (cost_type),
    INDEX idx_maintenance_id (maintenance_id),
    INDEX idx_fuel_log_id (fuel_log_id)
);
```

## Sample Data

### Insert Sample Vehicle Types
```sql
INSERT INTO vehicles (id, name, license_plate, make, model, year, vehicle_type, status, capacity_weight, capacity_volume, fuel_type, fuel_capacity, mileage, next_service_date) VALUES
('veh-1', 'Truck 1', 'ABC-123', 'Ford', 'F-650', 2022, 'truck', 'available', 10000.00, 20.00, 'diesel', 50.00, 45000.00, '2024-04-01'),
('veh-2', 'Truck 2', 'XYZ-789', 'Chevrolet', 'Silverado 3500', 2021, 'truck', 'in-use', 8000.00, 15.00, 'gasoline', 26.00, 62000.00, '2024-03-15'),
('veh-3', 'Truck 3', 'DEF-456', 'Dodge', 'Ram 3500', 2020, 'truck', 'maintenance', 12000.00, 25.00, 'diesel', 32.00, 78000.00, '2024-02-01'),
('veh-4', 'Trailer 1', 'TRA-001', 'Utility', '3000R', 2023, 'trailer', 'available', 3000.00, 10.00, 'none', 0.00, 15000.00, '2024-05-01');
```

### Insert Sample Insurance Records
```sql
INSERT INTO vehicle_insurance (id, vehicle_id, policy_number, insurance_company, policy_type, coverage_amount, start_date, expiry_date, premium_amount) VALUES
('ins-1', 'veh-1', 'INS-001', 'State Farm', 'commercial', 1000000.00, '2024-01-01', '2024-12-31', 2500.00),
('ins-2', 'veh-2', 'INS-002', 'Allstate', 'commercial', 1000000.00, '2024-01-01', '2024-12-31', 2200.00),
('ins-3', 'veh-3', 'INS-003', 'Progressive', 'commercial', 1000000.00, '2024-01-01', '2024-12-31', 2800.00);
```

### Insert Sample Maintenance Records
```sql
INSERT INTO vehicle_maintenance (id, vehicle_id, maintenance_type, priority, status, title, description, scheduled_date, completed_date, scheduled_mileage, actual_cost, performed_by_name) VALUES
('maint-1', 'veh-2', 'routine', 'medium', 'completed', 'Oil Change & Inspection', 'Oil change, tire rotation, brake inspection', '2023-12-15', '2023-12-15', 60000.00, 350.00, 'John Mechanic'),
('maint-2', 'veh-3', 'repair', 'high', 'completed', 'Transmission Repair', 'Transmission repair and clutch replacement', '2024-01-15', '2024-01-15', 78000.00, 2800.00, 'Mike Technician'),
('maint-3', 'veh-1', 'routine', 'medium', 'scheduled', 'Scheduled Service', 'Oil change, filter replacement, inspection', '2024-04-01', NULL, 50000.00, NULL, NULL);
```

## Key Features

### **Vehicle Management:**
- Complete vehicle specifications and capacity tracking
- Real-time status monitoring (available, in-use, maintenance, out-of-service)
- GPS location tracking and history
- Fuel level monitoring and consumption tracking

### **Maintenance & Service:**
- Comprehensive maintenance scheduling and history
- Service cost tracking and analysis
- Warranty and service interval management
- Maintenance item and parts tracking

### **Documentation & Compliance:**
- Insurance and registration management
- Document storage and organization
- Inspection checklists and results
- Accident and incident reporting

### **Cost Management:**
- Fuel cost tracking and analysis
- Maintenance and repair cost history
- Total cost of ownership calculations
- Vendor and invoice management

### **Safety & Compliance:**
- Pre-trip and post-trip inspections
- Safety checklist management
- Compliance tracking and reporting
- Driver assignment and responsibility

### **Advanced Features:**
- Real-time GPS tracking and geofencing
- Predictive maintenance scheduling
- Fuel efficiency analysis
- Fleet utilization optimization
- Cost per mile calculations

This schema provides a robust foundation for comprehensive fleet management, including vehicle tracking, maintenance scheduling, cost analysis, and compliance management for your junk removal business.
