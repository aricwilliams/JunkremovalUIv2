# Fleet Management API Documentation

This document outlines the complete REST API endpoints needed to support the Fleet Management tab functionality in your junk removal management system. Built with Node.js, Express, and MySQL.

## Base Configuration

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
All API responses follow this standard format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Vehicles Endpoints

### 1. Get All Vehicles

**GET** `/fleet/vehicles`

Retrieve all vehicles with optional filtering, sorting, and pagination.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `search` (string): Search term for vehicle name, make, model, or license plate
- `status` (string): Filter by vehicle status (active, maintenance, retired, out_of_service)
- `vehicle_type` (string): Filter by vehicle type (truck, van, trailer, equipment)
- `assigned_driver` (string): Filter by assigned driver
- `date_from` (date): Filter vehicles from this date
- `date_to` (date): Filter vehicles to this date
- `sort_by` (string): Sort field (default: 'created_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /api/v1/fleet/vehicles?page=1&limit=20&status=active&vehicle_type=truck&sort_by=created_date&sort_order=desc
```

#### Example Response
```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": {
    "vehicles": [
      {
        "id": "veh-1",
        "name": "Junk Hauler 1",
        "make": "Ford",
        "model": "F-650",
        "year": 2022,
        "license_plate": "NC-12345",
        "vin": "1FD6X2HT8NEA12345",
        "vehicle_type": "truck",
        "status": "active",
        "assigned_driver": "emp-1",
        "assigned_driver_name": "John Driver",
        "current_location": "123 Main St, Wilmington, NC",
        "fuel_level": 85,
        "mileage": 15420,
        "created": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    },
    "summary": {
      "total_vehicles": 15,
      "active_vehicles": 12,
      "maintenance_vehicles": 2,
      "retired_vehicles": 1,
      "total_fleet_value": 450000.00
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Vehicle by ID

**GET** `/fleet/vehicles/:id`

Retrieve a specific vehicle by ID with all related information.

#### Path Parameters
- `id` (string): Vehicle ID

#### Example Request
```bash
GET /api/v1/fleet/vehicles/veh-1
```

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle retrieved successfully",
  "data": {
    "vehicle": {
      "id": "veh-1",
      "name": "Junk Hauler 1",
      "make": "Ford",
      "model": "F-650",
      "year": 2022,
      "license_plate": "NC-12345",
      "vin": "1FD6X2HT8NEA12345",
      "vehicle_type": "truck",
      "status": "active",
      "assigned_driver": "emp-1",
      "assigned_driver_name": "John Driver",
      "specifications": {
        "engine": "6.7L Power Stroke V8",
        "transmission": "6-speed automatic",
        "fuel_type": "diesel",
        "fuel_capacity": "40 gallons",
        "payload_capacity": "15,000 lbs",
        "gross_vehicle_weight": "26,000 lbs"
      },
      "location": {
        "current_location": "123 Main St, Wilmington, NC",
        "home_base": "Fleet Yard, 456 Fleet Ave, Wilmington, NC",
        "last_updated": "2024-01-15T10:30:00.000Z"
      },
      "operational_data": {
        "fuel_level": 85,
        "mileage": 15420,
        "engine_hours": 1250,
        "last_service": "2024-01-10T08:00:00.000Z",
        "next_service": "2024-01-25T08:00:00.000Z"
      },
      "maintenance": {
        "maintenance_schedule": "every_5000_miles",
        "last_maintenance_mileage": 15000,
        "next_maintenance_mileage": 20000,
        "maintenance_history": [
          {
            "id": "maint-1",
            "type": "oil_change",
            "date": "2024-01-10T08:00:00.000Z",
            "mileage": 15000,
            "cost": 85.00
          }
        ]
      },
      "insurance": {
        "policy_number": "INS-2024-001",
        "provider": "Fleet Insurance Co",
        "coverage_amount": 1000000.00,
        "expiration_date": "2024-12-31",
        "is_active": true
      },
      "registration": {
        "registration_number": "REG-2024-001",
        "expiration_date": "2024-12-31",
        "is_active": true
      },
      "created": "2024-01-15T10:30:00.000Z",
      "updated": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Create Vehicle

**POST** `/fleet/vehicles`

Create a new vehicle in the fleet.

#### Request Body
```json
{
  "name": "Junk Hauler 2",
  "make": "Chevrolet",
  "model": "Silverado 3500HD",
  "year": 2023,
  "license_plate": "NC-67890",
  "vin": "1GC4YWD8N5F123456",
  "vehicle_type": "truck",
  "specifications": {
    "engine": "6.6L Duramax V8",
    "transmission": "6-speed automatic",
    "fuel_type": "diesel",
    "fuel_capacity": "36 gallons",
    "payload_capacity": "12,000 lbs"
  },
  "home_base": "Fleet Yard, 456 Fleet Ave, Wilmington, NC",
  "maintenance_schedule": "every_5000_miles",
  "insurance": {
    "policy_number": "INS-2024-002",
    "provider": "Fleet Insurance Co",
    "coverage_amount": 1000000.00,
    "expiration_date": "2024-12-31"
  },
  "registration": {
    "registration_number": "REG-2024-002",
    "expiration_date": "2024-12-31"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "vehicle_id": "veh-2",
    "vehicle": {
      "id": "veh-2",
      "name": "Junk Hauler 2",
      "make": "Chevrolet",
      "model": "Silverado 3500HD",
      "status": "active",
      "created": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Vehicle

**PUT** `/fleet/vehicles/:id`

Update an existing vehicle by ID.

#### Path Parameters
- `id` (string): Vehicle ID

#### Request Body
```json
{
  "status": "maintenance",
  "assigned_driver": "emp-2",
  "operational_data": {
    "fuel_level": 75,
    "mileage": 15800
  },
  "maintenance": {
    "next_maintenance_mileage": 20000
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "vehicle_id": "veh-1",
    "updated_fields": ["status", "assigned_driver", "operational_data", "maintenance"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Delete Vehicle

**DELETE** `/fleet/vehicles/:id`

Delete a vehicle by ID (soft delete - sets status to 'retired').

#### Path Parameters
- `id` (string): Vehicle ID

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle deleted successfully",
  "data": {
    "vehicle_id": "veh-2",
    "status": "retired"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Vehicle Maintenance Endpoints

### 6. Get Vehicle Maintenance Records

**GET** `/fleet/vehicles/:id/maintenance`

Get all maintenance records for a specific vehicle.

#### Path Parameters
- `id` (string): Vehicle ID

#### Query Parameters
- `maintenance_type` (string): Filter by maintenance type
- `date_from` (date): Filter maintenance from this date
- `date_to` (date): Filter maintenance to this date
- `status` (string): Filter by maintenance status (scheduled, in_progress, completed)

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle maintenance records retrieved successfully",
  "data": {
    "vehicle_id": "veh-1",
    "maintenance_records": [
      {
        "id": "maint-1",
        "type": "oil_change",
        "description": "Oil change and filter replacement",
        "date": "2024-01-10T08:00:00.000Z",
        "mileage": 15000,
        "status": "completed",
        "cost": 85.00,
        "technician": "emp-3",
        "technician_name": "Mike Mechanic",
        "notes": "Standard oil change, no issues found"
      }
    ],
    "summary": {
      "total_records": 5,
      "total_cost": 1250.00,
      "last_maintenance": "2024-01-10T08:00:00.000Z",
      "next_scheduled": "2024-01-25T08:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Create Maintenance Record

**POST** `/fleet/vehicles/:id/maintenance`

Create a new maintenance record for a vehicle.

#### Path Parameters
- `id` (string): Vehicle ID

#### Request Body
```json
{
  "type": "brake_service",
  "description": "Front brake pad replacement and rotor resurfacing",
  "date": "2024-01-20T08:00:00.000Z",
  "mileage": 15800,
  "status": "scheduled",
  "estimated_cost": 350.00,
  "technician": "emp-3",
  "priority": "high",
  "notes": "Customer reported brake noise, inspection needed"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Maintenance record created successfully",
  "data": {
    "maintenance_id": "maint-2",
    "vehicle_id": "veh-1",
    "type": "brake_service",
    "status": "scheduled"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 8. Update Maintenance Record

**PUT** `/fleet/vehicles/:id/maintenance/:maintenanceId`

Update an existing maintenance record.

#### Path Parameters
- `id` (string): Vehicle ID
- `maintenanceId` (string): Maintenance Record ID

#### Request Body
```json
{
  "status": "completed",
  "actual_cost": 375.00,
  "completion_notes": "Brake service completed. Replaced front brake pads and resurfaced rotors. Vehicle ready for service.",
  "completion_date": "2024-01-20T14:00:00.000Z"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Maintenance record updated successfully",
  "data": {
    "maintenance_id": "maint-2",
    "status": "completed",
    "actual_cost": 375.00
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Vehicle Tracking Endpoints

### 9. Get Vehicle Location

**GET** `/fleet/vehicles/:id/location`

Get current location and tracking information for a vehicle.

#### Path Parameters
- `id` (string): Vehicle ID

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle location retrieved successfully",
  "data": {
    "vehicle_id": "veh-1",
    "current_location": {
      "address": "123 Main St, Wilmington, NC 28401",
      "coordinates": {
        "latitude": 34.2107,
        "longitude": -77.8868
      },
      "last_updated": "2024-01-15T10:30:00.000Z"
    },
    "tracking_data": {
      "speed": 0,
      "heading": 180,
      "fuel_level": 85,
      "engine_status": "idle",
      "driver_status": "on_break"
    },
    "route_history": [
      {
        "timestamp": "2024-01-15T09:00:00.000Z",
        "location": "456 Oak Ave, Wilmington, NC",
        "coordinates": {
          "latitude": 34.2105,
          "longitude": -77.8865
        }
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 10. Update Vehicle Location

**POST** `/fleet/vehicles/:id/location`

Update the current location of a vehicle.

#### Path Parameters
- `id` (string): Vehicle ID

#### Request Body
```json
{
  "address": "789 Pine St, Wilmington, NC 28401",
  "coordinates": {
    "latitude": 34.2110,
    "longitude": -77.8870
  },
  "tracking_data": {
    "speed": 25,
    "heading": 90,
    "fuel_level": 82,
    "engine_status": "running"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle location updated successfully",
  "data": {
    "vehicle_id": "veh-1",
    "location_updated": "2024-01-15T10:35:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Vehicle Assignment Endpoints

### 11. Get Vehicle Assignments

**GET** `/fleet/vehicles/:id/assignments`

Get all driver assignments for a specific vehicle.

#### Path Parameters
- `id` (string): Vehicle ID

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle assignments retrieved successfully",
  "data": {
    "vehicle_id": "veh-1",
    "assignments": [
      {
        "id": "assign-1",
        "driver_id": "emp-1",
        "driver_name": "John Driver",
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": null,
        "status": "active",
        "assigned_by": "emp-5",
        "assigned_by_name": "Fleet Manager",
        "notes": "Primary driver for Junk Hauler 1"
      }
    ],
    "current_assignment": {
      "driver_id": "emp-1",
      "driver_name": "John Driver",
      "start_date": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 12. Assign Vehicle to Driver

**POST** `/fleet/vehicles/:id/assign`

Assign a vehicle to a driver.

#### Path Parameters
- `id` (string): Vehicle ID

#### Request Body
```json
{
  "driver_id": "emp-2",
  "start_date": "2024-01-16T00:00:00.000Z",
  "end_date": "2024-01-31T23:59:59.000Z",
  "reason": "Temporary assignment while John is on vacation",
  "assigned_by": "emp-5"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Vehicle assigned successfully",
  "data": {
    "assignment_id": "assign-2",
    "vehicle_id": "veh-1",
    "driver_id": "emp-2",
    "start_date": "2024-01-16T00:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Fuel Management Endpoints

### 13. Get Fuel Logs

**GET** `/fleet/vehicles/:id/fuel-logs`

Get all fuel logs for a specific vehicle.

#### Path Parameters
- `id` (string): Vehicle ID

#### Query Parameters
- `date_from` (date): Filter fuel logs from this date
- `date_to` (date): Filter fuel logs to this date
- `fuel_type` (string): Filter by fuel type

#### Example Response
```json
{
  "success": true,
  "message": "Fuel logs retrieved successfully",
  "data": {
    "vehicle_id": "veh-1",
    "fuel_logs": [
      {
        "id": "fuel-1",
        "date": "2024-01-15T08:00:00.000Z",
        "fuel_type": "diesel",
        "gallons": 25.5,
        "cost_per_gallon": 3.85,
        "total_cost": 98.18,
        "odometer": 15420,
        "fuel_station": "Shell Station, 123 Gas Ave",
        "driver": "emp-1",
        "driver_name": "John Driver",
        "notes": "Full tank fill-up"
      }
    ],
    "summary": {
      "total_gallons": 125.5,
      "total_cost": 483.18,
      "average_cost_per_gallon": 3.85,
      "last_fuel_date": "2024-01-15T08:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 14. Add Fuel Log

**POST** `/fleet/vehicles/:id/fuel-logs`

Add a new fuel log entry for a vehicle.

#### Path Parameters
- `id` (string): Vehicle ID

#### Request Body
```json
{
  "date": "2024-01-16T08:00:00.000Z",
  "fuel_type": "diesel",
  "gallons": 30.0,
  "cost_per_gallon": 3.80,
  "total_cost": 114.00,
  "odometer": 15800,
  "fuel_station": "Exxon Station, 456 Fuel Blvd",
  "driver": "emp-2",
  "notes": "Fill-up before long trip"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Fuel log added successfully",
  "data": {
    "fuel_log_id": "fuel-2",
    "vehicle_id": "veh-1",
    "total_cost": 114.00,
    "gallons": 30.0
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Fleet Reports Endpoints

### 15. Get Fleet Summary Report

**GET** `/fleet/reports/summary`

Get a summary report of all fleet operations and metrics.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `vehicle_type` (string): Filter by vehicle type
- `format` (string): 'json' or 'pdf'

#### Example Response
```json
{
  "success": true,
  "message": "Fleet summary report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "fleet_overview": {
      "total_vehicles": 15,
      "active_vehicles": 12,
      "maintenance_vehicles": 2,
      "retired_vehicles": 1,
      "total_fleet_value": 450000.00
    },
    "vehicle_types": {
      "trucks": 10,
      "vans": 3,
      "trailers": 2
    },
    "operational_metrics": {
      "total_mileage": 125000,
      "total_fuel_consumed": 8500,
      "total_fuel_cost": 32750.00,
      "average_fuel_efficiency": "14.7 mpg"
    },
    "maintenance_summary": {
      "maintenance_records": 25,
      "total_maintenance_cost": 8500.00,
      "scheduled_maintenance": 8,
      "emergency_repairs": 3
    },
    "driver_assignments": {
      "assigned_vehicles": 12,
      "unassigned_vehicles": 3,
      "active_drivers": 8
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 16. Get Fleet Performance Report

**GET** `/fleet/reports/performance`

Get detailed performance metrics for fleet operations.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `vehicle_id` (string): Filter by specific vehicle
- `driver_id` (string): Filter by specific driver

#### Example Response
```json
{
  "success": true,
  "message": "Fleet performance report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "vehicle_performance": [
      {
        "vehicle_id": "veh-1",
        "vehicle_name": "Junk Hauler 1",
        "total_mileage": 12500,
        "fuel_efficiency": "15.2 mpg",
        "maintenance_cost": 850.00,
        "downtime_hours": 24,
        "utilization_rate": 92.5
      }
    ],
    "driver_performance": [
      {
        "driver_id": "emp-1",
        "driver_name": "John Driver",
        "assigned_vehicle": "veh-1",
        "total_mileage": 12500,
        "fuel_efficiency": "15.2 mpg",
        "safety_score": 95,
        "on_time_percentage": 98.5
      }
    ],
    "cost_analysis": {
      "total_operating_cost": 45000.00,
      "fuel_cost_percentage": 72.8,
      "maintenance_cost_percentage": 18.9,
      "insurance_cost_percentage": 8.3,
      "cost_per_mile": 0.36
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Fleet Settings Endpoints

### 17. Get Fleet Settings

**GET** `/fleet/settings`

Get all fleet management settings and configurations.

#### Example Response
```json
{
  "success": true,
  "message": "Fleet settings retrieved successfully",
  "data": {
    "maintenance_settings": {
      "oil_change_interval": 5000,
      "brake_service_interval": 25000,
      "tire_rotation_interval": 7500,
      "preventive_maintenance_reminder_days": 7
    },
    "fuel_settings": {
      "low_fuel_threshold": 20,
      "fuel_efficiency_target": 15.0,
      "fuel_cost_alert_threshold": 4.00
    },
    "tracking_settings": {
      "location_update_interval": 300,
      "enable_geofencing": true,
      "enable_speed_alerts": true,
      "speed_limit": 70
    },
    "notification_settings": {
      "maintenance_reminders": true,
      "fuel_alerts": true,
      "location_alerts": true,
      "email_notifications": true,
      "sms_notifications": false
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 18. Update Fleet Settings

**PUT** `/fleet/settings`

Update fleet management settings.

#### Request Body
```json
{
  "maintenance_settings": {
    "oil_change_interval": 6000,
    "brake_service_interval": 30000
  },
  "fuel_settings": {
    "low_fuel_threshold": 25,
    "fuel_efficiency_target": 16.0
  },
  "tracking_settings": {
    "location_update_interval": 240,
    "speed_limit": 75
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Fleet settings updated successfully",
  "data": {
    "updated_fields": ["maintenance_settings", "fuel_settings", "tracking_settings"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Application Error Codes
- `VEHICLE_NOT_FOUND` - Vehicle with specified ID not found
- `MAINTENANCE_RECORD_NOT_FOUND` - Maintenance record with specified ID not found
- `INVALID_VEHICLE_STATUS` - Invalid vehicle status specified
- `DRIVER_NOT_FOUND` - Driver with specified ID not found
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Tracking endpoints**: 200 requests per minute per IP
- **Report endpoints**: 20 requests per minute per IP

## Fleet Management Features

### **Core Vehicle Management:**
- Full CRUD operations for vehicles
- Vehicle status tracking and lifecycle management
- Vehicle specifications and documentation
- Vehicle assignment and driver management

### **Maintenance Management:**
- Complete maintenance record tracking
- Scheduled maintenance scheduling
- Maintenance cost tracking and analysis
- Maintenance history and documentation

### **Vehicle Tracking:**
- Real-time location tracking
- Route history and analytics
- Fuel level monitoring
- Engine status and diagnostics

### **Driver Assignment:**
- Driver-vehicle assignment management
- Assignment history tracking
- Temporary and permanent assignments
- Assignment scheduling and planning

### **Fuel Management:**
- Fuel consumption tracking
- Fuel cost analysis
- Fuel efficiency monitoring
- Fuel station and cost tracking

### **Insurance & Registration:**
- Insurance policy management
- Registration tracking and renewal
- Compliance monitoring
- Document management

### **Reporting & Analytics:**
- Fleet performance metrics
- Cost analysis and budgeting
- Maintenance analytics
- Driver performance tracking

### **Integration Features:**
- GPS tracking system integration
- Maintenance shop integration
- Fuel card system integration
- Driver management system connection

## Webhook Support

Configure webhooks to receive real-time updates:
- Vehicle location updates
- Maintenance status changes
- Fuel level alerts
- Driver assignment changes

Webhook endpoint: `POST /webhooks/fleet`

## Testing

### Test Environment
- **Base URL**: `http://localhost:3001/api/v1`
- **Test Database**: Separate test database with sample data
- **Authentication**: Use test JWT tokens

### Sample Test Data
```bash
# Create test vehicle
curl -X POST http://localhost:3001/api/v1/fleet/vehicles \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_vehicle.json

# Add maintenance record
curl -X POST http://localhost:3001/api/v1/fleet/vehicles/veh-1/maintenance \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_maintenance.json
```

This API documentation provides a comprehensive foundation for implementing the Fleet Management tab functionality with Node.js, covering all vehicle management, maintenance, tracking, and fleet operations capabilities needed for a robust fleet management system.
