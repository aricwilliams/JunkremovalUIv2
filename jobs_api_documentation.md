# Jobs API Documentation

This document outlines the complete REST API endpoints needed to support the Jobs tab functionality in your junk removal management system. Built with Node.js, Express, and MySQL.

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

## Jobs Endpoints

### 1. Get All Jobs

**GET** `/jobs`

Retrieve all jobs with optional filtering, sorting, and pagination.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `status` (string): Filter by job status
- `customer_id` (string): Filter by customer ID
- `crew_id` (string): Filter by crew ID
- `date_from` (date): Filter jobs from this date
- `date_to` (date): Filter jobs to this date
- `sort_by` (string): Sort field (default: 'scheduled_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /api/v1/jobs?page=1&limit=20&status=scheduled&sort_by=scheduled_date&sort_order=asc
```

#### Example Response
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": "job-1",
        "customer_id": "cust-1",
        "customer_name": "Downtown Office Complex",
        "customer_phone": "555-0100",
        "customer_email": "admin@downtownoffice.com",
        "address": "321 Commerce St",
        "city": "Wilmington",
        "state": "NC",
        "zip_code": "28401",
        "latitude": 34.2257,
        "longitude": -77.9447,
        "scheduled_date": "2024-01-16",
        "time_slot": "09:00 AM",
        "estimated_hours": 3,
        "status": "scheduled",
        "priority": "medium",
        "total_estimate": 225.00,
        "actual_total": null,
        "notes": "Access through loading dock",
        "created": "2024-01-15T10:30:00.000Z",
        "updated": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Job by ID

**GET** `/jobs/:id`

Retrieve a specific job by its ID with all related information.

#### Path Parameters
- `id` (string): Job ID

#### Example Request
```bash
GET /api/v1/jobs/job-1
```

#### Example Response
```json
{
  "success": true,
  "message": "Job retrieved successfully",
  "data": {
    "job": {
      "id": "job-1",
      "customer_id": "cust-1",
      "customer_name": "Downtown Office Complex",
      "customer_phone": "555-0100",
      "customer_email": "admin@downtownoffice.com",
      "address": "321 Commerce St",
      "city": "Wilmington",
      "state": "NC",
      "zip_code": "28401",
      "latitude": 34.2257,
      "longitude": -77.9447,
      "scheduled_date": "2024-01-16",
      "time_slot": "09:00 AM",
      "estimated_hours": 3,
      "status": "scheduled",
      "priority": "medium",
      "total_estimate": 225.00,
      "actual_total": null,
      "notes": "Access through loading dock",
      "items": [
        {
          "id": "item-1",
          "name": "Office Waste",
          "category": "General Waste",
          "quantity": 1,
          "base_price": 150.00,
          "difficulty": "easy",
          "estimated_time": 2
        }
      ],
      "before_photos": ["/uploads/jobs/job-1/before-1.jpg"],
      "after_photos": [],
      "crew_assignment": {
        "crew_id": "crew-1",
        "crew_name": "Morning Crew",
        "members": [
          {
            "employee_id": "emp-1",
            "name": "John Driver",
            "role": "driver"
          }
        ]
      },
      "created": "2024-01-15T10:30:00.000Z",
      "updated": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Create New Job

**POST** `/jobs`

Create a new job with all required information.

#### Request Body
```json
{
  "customer_id": "cust-1",
  "customer_name": "Downtown Office Complex",
  "customer_phone": "555-0100",
  "customer_email": "admin@downtownoffice.com",
  "address": "321 Commerce St",
  "city": "Wilmington",
  "state": "NC",
  "zip_code": "28401",
  "latitude": 34.2257,
  "longitude": -77.9447,
  "scheduled_date": "2024-01-16",
  "time_slot": "09:00 AM",
  "estimated_hours": 3,
  "priority": "medium",
  "total_estimate": 225.00,
  "notes": "Access through loading dock",
  "items": [
    {
      "name": "Office Waste",
      "category": "General Waste",
      "quantity": 1,
      "base_price": 150.00,
      "difficulty": "easy",
      "estimated_time": 2
    }
  ]
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "job_id": "job-2",
    "job": {
      "id": "job-2",
      "customer_id": "cust-1",
      "customer_name": "Downtown Office Complex",
      "status": "scheduled",
      "scheduled_date": "2024-01-16",
      "created": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Job

**PUT** `/jobs/:id`

Update an existing job by ID.

#### Path Parameters
- `id` (string): Job ID

#### Request Body
```json
{
  "scheduled_date": "2024-01-17",
  "time_slot": "10:00 AM",
  "estimated_hours": 4,
  "priority": "high",
  "notes": "Updated notes - urgent cleanup needed"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "job_id": "job-1",
    "updated_fields": ["scheduled_date", "time_slot", "estimated_hours", "priority", "notes"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Delete Job

**DELETE** `/jobs/:id`

Delete a job by ID (soft delete - sets status to 'cancelled').

#### Path Parameters
- `id` (string): Job ID

#### Example Response
```json
{
  "success": true,
  "message": "Job cancelled successfully",
  "data": {
    "job_id": "job-1",
    "status": "cancelled"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Update Job Status

**PATCH** `/jobs/:id/status`

Update the status of a specific job.

#### Path Parameters
- `id` (string): Job ID

#### Request Body
```json
{
  "status": "in-progress",
  "status_notes": "Crew arrived and started work",
  "actual_start_time": "2024-01-16T09:15:00.000Z"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Job status updated successfully",
  "data": {
    "job_id": "job-1",
    "old_status": "scheduled",
    "new_status": "in-progress",
    "status_notes": "Crew arrived and started work",
    "actual_start_time": "2024-01-16T09:15:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Assign Crew to Job

**POST** `/jobs/:id/crew`

Assign a crew to a specific job.

#### Path Parameters
- `id` (string): Job ID

#### Request Body
```json
{
  "crew_id": "crew-1",
  "assignment_notes": "Morning crew assigned - experienced with office cleanouts"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Crew assigned successfully",
  "data": {
    "job_id": "job-1",
    "crew_id": "crew-1",
    "crew_name": "Morning Crew",
    "assignment_notes": "Morning crew assigned - experienced with office cleanouts"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 8. Get Job Progress

**GET** `/jobs/:id/progress`

Get detailed progress information for a specific job.

#### Path Parameters
- `id` (string): Job ID

#### Example Response
```json
{
  "success": true,
  "message": "Job progress retrieved successfully",
  "data": {
    "job_id": "job-1",
    "current_status": "in-progress",
    "progress_percentage": 65,
    "time_logs": [
      {
        "id": "log-1",
        "crew_member": "John Driver",
        "activity": "Loading truck",
        "start_time": "2024-01-16T09:00:00.000Z",
        "end_time": "2024-01-16T09:45:00.000Z",
        "duration_minutes": 45
      }
    ],
    "photos": {
      "before": ["/uploads/jobs/job-1/before-1.jpg"],
      "after": ["/uploads/jobs/job-1/after-1.jpg"]
    },
    "notes": [
      {
        "id": "note-1",
        "crew_member": "John Driver",
        "note": "Found additional items in basement",
        "timestamp": "2024-01-16T09:30:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Job Items Endpoints

### 9. Get Job Items

**GET** `/jobs/:id/items`

Get all items for a specific job.

#### Path Parameters
- `id` (string): Job ID

#### Example Response
```json
{
  "success": true,
  "message": "Job items retrieved successfully",
  "data": {
    "job_id": "job-1",
    "items": [
      {
        "id": "item-1",
        "name": "Office Waste",
        "category": "General Waste",
        "quantity": 1,
        "base_price": 150.00,
        "difficulty": "easy",
        "estimated_time": 2,
        "actual_time": 1.5,
        "notes": "Mostly paper and cardboard"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 10. Add Item to Job

**POST** `/jobs/:id/items`

Add a new item to an existing job.

#### Path Parameters
- `id` (string): Job ID

#### Request Body
```json
{
  "name": "Electronics",
  "category": "E-Waste",
  "quantity": 2,
  "base_price": 75.00,
  "difficulty": "medium",
  "estimated_time": 1,
  "notes": "Old computers and monitors"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Item added to job successfully",
  "data": {
    "item_id": "item-2",
    "job_id": "job-1"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Job Photos Endpoints

### 11. Upload Job Photos

**POST** `/jobs/:id/photos`

Upload photos for a specific job (before/after).

#### Path Parameters
- `id` (string): Job ID

#### Request Body (multipart/form-data)
- `photos`: Array of photo files
- `photo_type`: 'before' or 'after'
- `description`: Optional description

#### Example Response
```json
{
  "success": true,
  "message": "Photos uploaded successfully",
  "data": {
    "job_id": "job-1",
    "uploaded_photos": [
      {
        "id": "photo-1",
        "filename": "before-1.jpg",
        "url": "/uploads/jobs/job-1/before-1.jpg",
        "photo_type": "before",
        "description": "Main area before cleanup"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 12. Get Job Photos

**GET** `/jobs/:id/photos`

Get all photos for a specific job.

#### Path Parameters
- `id` (string): Job ID

#### Query Parameters
- `photo_type` (string): Filter by 'before' or 'after'

#### Example Response
```json
{
  "success": true,
  "message": "Job photos retrieved successfully",
  "data": {
    "job_id": "job-1",
    "photos": {
      "before": [
        {
          "id": "photo-1",
          "filename": "before-1.jpg",
          "url": "/uploads/jobs/job-1/before-1.jpg",
          "photo_type": "before",
          "description": "Main area before cleanup",
          "uploaded_at": "2024-01-15T10:30:00.000Z"
        }
      ],
      "after": []
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Job Time Logs Endpoints

### 13. Start Job Time Log

**POST** `/jobs/:id/time-logs/start`

Start timing a job activity.

#### Path Parameters
- `id` (string): Job ID

#### Request Body
```json
{
  "crew_member_id": "emp-1",
  "activity": "Loading truck",
  "notes": "Starting to load items into truck"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Time log started successfully",
  "data": {
    "time_log_id": "log-1",
    "job_id": "job-1",
    "start_time": "2024-01-16T09:00:00.000Z",
    "status": "active"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 14. Stop Job Time Log

**POST** `/jobs/:id/time-logs/:logId/stop`

Stop timing a job activity.

#### Path Parameters
- `id` (string): Job ID
- `logId` (string): Time log ID

#### Request Body
```json
{
  "notes": "Finished loading truck, ready to depart"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Time log stopped successfully",
  "data": {
    "time_log_id": "log-1",
    "job_id": "job-1",
    "start_time": "2024-01-16T09:00:00.000Z",
    "end_time": "2024-01-16T09:45:00.000Z",
    "duration_minutes": 45,
    "status": "completed"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Job Notifications Endpoints

### 15. Send Job Notification

**POST** `/jobs/:id/notifications`

Send a notification about a job update.

#### Path Parameters
- `id` (string): Job ID

#### Request Body
```json
{
  "type": "status_update",
  "title": "Job Started",
  "message": "Your junk removal job has started",
  "recipients": ["customer", "crew"],
  "send_email": true,
  "send_sms": false
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "notification_id": "notif-1",
    "job_id": "job-1",
    "sent_to": ["customer@email.com", "crew@company.com"],
    "delivery_status": "sent"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Job Reports Endpoints

### 16. Get Job Summary Report

**GET** `/jobs/reports/summary`

Get a summary report of jobs for a specific period.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `crew_id` (string): Filter by crew
- `status` (string): Filter by status
- `format` (string): 'json' or 'pdf'

#### Example Response
```json
{
  "success": true,
  "message": "Job summary report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "summary": {
      "total_jobs": 45,
      "completed_jobs": 42,
      "scheduled_jobs": 3,
      "total_revenue": 12500.00,
      "average_job_value": 277.78,
      "total_hours": 135,
      "average_job_duration": 3.0
    },
    "jobs_by_status": {
      "completed": 42,
      "scheduled": 3,
      "cancelled": 0
    },
    "jobs_by_crew": {
      "crew-1": 25,
      "crew-2": 20
    }
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
- `JOB_NOT_FOUND` - Job with specified ID not found
- `INVALID_STATUS_TRANSITION` - Invalid status change
- `CREW_NOT_AVAILABLE` - Specified crew is not available
- `INVALID_DATE_RANGE` - Invalid date range for scheduling
- `DUPLICATE_JOB` - Job already exists for this customer/date
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **File uploads**: 10 requests per minute per IP
- **Authentication endpoints**: 5 requests per minute per IP

## File Upload Limits

- **Photo files**: Maximum 10MB per file, JPG/PNG formats
- **Video files**: Maximum 100MB per file, MP4/MOV formats
- **Total uploads per job**: Maximum 20 files

## Webhook Support

Configure webhooks to receive real-time updates:
- Job status changes
- Crew assignments
- Photo uploads
- Time log updates

Webhook endpoint: `POST /webhooks/jobs`

## Testing

### Test Environment
- **Base URL**: `http://localhost:3001/api/v1`
- **Test Database**: Separate test database with sample data
- **Authentication**: Use test JWT tokens

### Sample Test Data
```bash
# Create test job
curl -X POST http://localhost:3001/api/v1/jobs \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_job.json

# Get test job
curl -X GET http://localhost:3001/api/v1/jobs/job-test-1 \
  -H "Authorization: Bearer test_token"
```

This API documentation provides a comprehensive foundation for implementing the Jobs tab functionality with Node.js, covering all CRUD operations, status management, file uploads, time tracking, and reporting capabilities.

