# Client Portal API Documentation

This document outlines the complete REST API endpoints needed to support the Client Portal tab functionality in your junk removal management system. Built with Node.js, Express, and MySQL.

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

## Portal Users Endpoints

### 1. Get All Portal Users

**GET** `/portal/users`

Retrieve all portal users with optional filtering, sorting, and pagination.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `search` (string): Search term for user name, email, or phone
- `status` (string): Filter by user status (active, inactive, suspended)
- `user_type` (string): Filter by user type (customer, business, contractor)
- `date_from` (date): Filter users from this date
- `date_to` (date): Filter users to this date
- `sort_by` (string): Sort field (default: 'created_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /api/v1/portal/users?page=1&limit=20&status=active&user_type=customer&sort_by=created_date&sort_order=desc
```

#### Example Response
```json
{
  "success": true,
  "message": "Portal users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user-1",
        "username": "john.doe",
        "email": "john.doe@email.com",
        "first_name": "John",
        "last_name": "Doe",
        "user_type": "customer",
        "status": "active",
        "last_login": "2024-01-15T08:30:00.000Z",
        "created": "2023-06-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    },
    "summary": {
      "total_users": 150,
      "active_users": 142,
      "inactive_users": 5,
      "suspended_users": 3,
      "user_types": {
        "customer": 120,
        "business": 25,
        "contractor": 5
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Portal User by ID

**GET** `/portal/users/:id`

Retrieve a specific portal user by ID with all related information.

#### Path Parameters
- `id` (string): Portal User ID

#### Example Request
```bash
GET /api/v1/portal/users/user-1
```

#### Example Response
```json
{
  "success": true,
  "message": "Portal user retrieved successfully",
  "data": {
    "user": {
      "id": "user-1",
      "username": "john.doe",
      "email": "john.doe@email.com",
      "personal_info": {
        "first_name": "John",
        "last_name": "Doe",
        "phone": "555-0100",
        "mobile": "555-0101",
        "date_of_birth": "1985-06-15",
        "preferred_contact_method": "email"
      },
      "account_info": {
        "user_type": "customer",
        "status": "active",
        "email_verified": true,
        "phone_verified": false,
        "two_factor_enabled": false,
        "last_login": "2024-01-15T08:30:00.000Z",
        "created": "2023-06-15T10:30:00.000Z"
      },
      "preferences": {
        "language": "en",
        "timezone": "America/New_York",
        "notification_preferences": {
          "email_notifications": true,
          "sms_notifications": false,
          "push_notifications": true,
          "marketing_emails": false
        },
        "communication_preferences": {
          "preferred_contact_time": "business_hours",
          "preferred_contact_method": "email"
        }
      },
      "billing_info": {
        "billing_address": {
          "street": "123 Main St",
          "city": "Wilmington",
          "state": "NC",
          "zip_code": "28401",
          "country": "USA"
        },
        "payment_methods": [
          {
            "id": "pm-1",
            "type": "credit_card",
            "last_four": "1234",
            "expiry_month": 12,
            "expiry_year": 2025,
            "is_default": true
          }
        ]
      },
      "service_history": {
        "total_jobs": 8,
        "total_spent": 1250.00,
        "last_service_date": "2024-01-10T10:00:00.000Z",
        "average_rating": 4.8
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Create Portal User

**POST** `/portal/users`

Create a new portal user account.

#### Request Body
```json
{
  "username": "jane.smith",
  "email": "jane.smith@email.com",
  "password": "securePassword123",
  "personal_info": {
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "555-0200",
    "mobile": "555-0201"
  },
  "user_type": "customer",
  "preferences": {
    "language": "en",
    "timezone": "America/New_York",
    "notification_preferences": {
      "email_notifications": true,
      "sms_notifications": true
    }
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Portal user created successfully",
  "data": {
    "user_id": "user-2",
    "user": {
      "id": "user-2",
      "username": "jane.smith",
      "email": "jane.smith@email.com",
      "user_type": "customer",
      "status": "active",
      "created": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Portal User

**PUT** `/portal/users/:id`

Update an existing portal user by ID.

#### Path Parameters
- `id` (string): Portal User ID

#### Request Body
```json
{
  "personal_info": {
    "phone": "555-0202",
    "mobile": "555-0203"
  },
  "preferences": {
    "notification_preferences": {
      "sms_notifications": false,
      "push_notifications": true
    }
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Portal user updated successfully",
  "data": {
    "user_id": "user-2",
    "updated_fields": ["personal_info", "preferences"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Delete Portal User

**DELETE** `/portal/users/:id`

Delete a portal user by ID (soft delete - sets status to 'inactive').

#### Path Parameters
- `id` (string): Portal User ID

#### Example Response
```json
{
  "success": true,
  "message": "Portal user deleted successfully",
  "data": {
    "user_id": "user-2",
    "status": "inactive"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Portal Authentication Endpoints

### 6. User Login

**POST** `/portal/auth/login`

Authenticate a portal user and return JWT token.

#### Request Body
```json
{
  "username": "john.doe",
  "password": "userPassword123"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-1",
      "username": "john.doe",
      "email": "john.doe@email.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "refresh_token": "refresh_token_here"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. User Logout

**POST** `/portal/auth/logout`

Logout a portal user and invalidate their token.

#### Example Response
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "user_id": "user-1",
    "logout_time": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 8. Refresh Token

**POST** `/portal/auth/refresh`

Refresh an expired JWT token.

#### Request Body
```json
{
  "refresh_token": "refresh_token_here"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Service Requests Endpoints

### 9. Get All Service Requests

**GET** `/portal/requests`

Retrieve all service requests for the authenticated user.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `status` (string): Filter by request status (pending, approved, in_progress, completed, cancelled)
- `request_type` (string): Filter by request type (junk_removal, furniture_pickup, construction_debris, appliance_removal)
- `date_from` (date): Filter requests from this date
- `date_to` (date): Filter requests to this date
- `sort_by` (string): Sort field (default: 'created_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /api/v1/portal/requests?page=1&limit=20&status=pending&sort_by=created_date&sort_order=desc
```

#### Example Response
```json
{
  "success": true,
  "message": "Service requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": "req-1",
        "request_number": "SR-2024-001",
        "title": "Basement Cleanout",
        "description": "Need to remove old furniture and debris from basement",
        "request_type": "junk_removal",
        "status": "pending",
        "priority": "medium",
        "estimated_cost": 350.00,
        "scheduled_date": "2024-01-20T10:00:00.000Z",
        "created": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "pages": 1
    },
    "summary": {
      "total_requests": 12,
      "pending_requests": 3,
      "approved_requests": 2,
      "in_progress_requests": 4,
      "completed_requests": 3
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 10. Get Service Request by ID

**GET** `/portal/requests/:id`

Retrieve a specific service request by ID.

#### Path Parameters
- `id` (string): Service Request ID

#### Example Response
```json
{
  "success": true,
  "message": "Service request retrieved successfully",
  "data": {
    "request": {
      "id": "req-1",
      "request_number": "SR-2024-001",
      "title": "Basement Cleanout",
      "description": "Need to remove old furniture and debris from basement. Items include: old couch, broken table, construction debris, and general clutter.",
      "request_type": "junk_removal",
      "status": "pending",
      "priority": "medium",
      "location": {
        "address": "123 Main St, Wilmington, NC 28401",
        "access_notes": "Side entrance, basement door on left",
        "parking_info": "Street parking available"
      },
      "items": [
        {
          "id": "item-1",
          "description": "Old couch",
          "quantity": 1,
          "size": "3-seater",
          "condition": "worn"
        },
        {
          "id": "item-2",
          "description": "Broken table",
          "quantity": 1,
          "size": "4x2 feet",
          "condition": "broken"
        }
      ],
      "scheduling": {
        "preferred_date": "2024-01-20",
        "preferred_time": "10:00 AM",
        "flexible_timing": true,
        "estimated_duration": "2-3 hours"
      },
      "pricing": {
        "estimated_cost": 350.00,
        "deposit_required": 100.00,
        "payment_terms": "50% deposit, balance upon completion"
      },
      "status_history": [
        {
          "status": "pending",
          "timestamp": "2024-01-15T10:30:00.000Z",
          "notes": "Request submitted"
        }
      ],
      "attachments": [
        {
          "id": "att-1",
          "filename": "basement_photo.jpg",
          "file_type": "image",
          "uploaded": "2024-01-15T10:30:00.000Z"
        }
      ],
      "created": "2024-01-15T10:30:00.000Z",
      "updated": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 11. Create Service Request

**POST** `/portal/requests`

Create a new service request.

#### Request Body
```json
{
  "title": "Garage Cleanout",
  "description": "Need to remove old tools, broken equipment, and general debris from garage",
  "request_type": "junk_removal",
  "priority": "high",
  "location": {
    "address": "456 Oak Ave, Wilmington, NC 28401",
    "access_notes": "Garage door, code required for entry",
    "parking_info": "Driveway available"
  },
  "items": [
    {
      "description": "Old tools",
      "quantity": 1,
      "size": "Various",
      "condition": "worn"
    }
  ],
  "scheduling": {
    "preferred_date": "2024-01-25",
    "preferred_time": "2:00 PM",
    "flexible_timing": false,
    "estimated_duration": "1-2 hours"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Service request created successfully",
  "data": {
    "request_id": "req-2",
    "request_number": "SR-2024-002",
    "status": "pending",
    "estimated_response_time": "24 hours"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 12. Update Service Request

**PUT** `/portal/requests/:id`

Update an existing service request.

#### Path Parameters
- `id` (string): Service Request ID

#### Request Body
```json
{
  "scheduling": {
    "preferred_date": "2024-01-26",
    "preferred_time": "3:00 PM"
  },
  "description": "Updated description with additional items"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Service request updated successfully",
  "data": {
    "request_id": "req-2",
    "updated_fields": ["scheduling", "description"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 13. Cancel Service Request

**PUT** `/portal/requests/:id/cancel`

Cancel a service request.

#### Path Parameters
- `id` (string): Service Request ID

#### Request Body
```json
{
  "cancellation_reason": "Schedule conflict, will reschedule later",
  "cancellation_notes": "Need to postpone due to work commitment"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Service request cancelled successfully",
  "data": {
    "request_id": "req-2",
    "status": "cancelled",
    "cancellation_date": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Job History Endpoints

### 14. Get Job History

**GET** `/portal/jobs`

Retrieve job history for the authenticated user.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `status` (string): Filter by job status (scheduled, in_progress, completed, cancelled)
- `date_from` (date): Filter jobs from this date
- `date_to` (date): Filter jobs to this date
- `sort_by` (string): Sort field (default: 'scheduled_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Response
```json
{
  "success": true,
  "message": "Job history retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": "job-1",
        "job_number": "JOB-2024-001",
        "title": "Basement Cleanout",
        "status": "completed",
        "scheduled_date": "2024-01-10T10:00:00.000Z",
        "completed_date": "2024-01-10T13:30:00.000Z",
        "total_cost": 350.00,
        "crew_size": 3,
        "duration": "3.5 hours",
        "rating": 5,
        "review": "Excellent service, very professional crew"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "pages": 1
    },
    "summary": {
      "total_jobs": 8,
      "completed_jobs": 6,
      "scheduled_jobs": 1,
      "cancelled_jobs": 1,
      "total_spent": 2850.00,
      "average_rating": 4.8
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 15. Get Job Details

**GET** `/portal/jobs/:id`

Retrieve detailed information about a specific job.

#### Path Parameters
- `id` (string): Job ID

#### Example Response
```json
{
  "success": true,
  "message": "Job details retrieved successfully",
  "data": {
    "job": {
      "id": "job-1",
      "job_number": "JOB-2024-001",
      "title": "Basement Cleanout",
      "description": "Complete basement cleanout including old furniture, construction debris, and general clutter removal",
      "status": "completed",
      "scheduling": {
        "scheduled_date": "2024-01-10T10:00:00.000Z",
        "start_time": "10:00 AM",
        "estimated_duration": "3-4 hours",
        "actual_duration": "3.5 hours"
      },
      "location": {
        "address": "123 Main St, Wilmington, NC 28401",
        "access_notes": "Side entrance, basement door on left",
        "parking_info": "Street parking available"
      },
      "crew": {
        "crew_leader": "Mike Johnson",
        "crew_size": 3,
        "crew_members": ["Mike Johnson", "Tom Wilson", "Chris Davis"]
      },
      "progress": {
        "start_time": "2024-01-10T10:15:00.000Z",
        "completion_time": "2024-01-10T13:30:00.000Z",
        "break_time": "30 minutes",
        "status_updates": [
          {
            "status": "arrived",
            "timestamp": "2024-01-10T10:15:00.000Z",
            "notes": "Crew arrived on site"
          },
          {
            "status": "in_progress",
            "timestamp": "2024-01-10T10:30:00.000Z",
            "notes": "Started basement cleanout"
          }
        ]
      },
      "items_removed": [
        {
          "description": "Old couch",
          "quantity": 1,
          "disposal_method": "landfill"
        },
        {
          "description": "Construction debris",
          "quantity": "2 cubic yards",
          "disposal_method": "landfill"
        }
      ],
      "pricing": {
        "base_cost": 300.00,
        "additional_fees": 50.00,
        "total_cost": 350.00,
        "payment_status": "paid",
        "payment_method": "credit_card"
      },
      "customer_feedback": {
        "rating": 5,
        "review": "Excellent service, very professional crew. They were efficient and cleaned up after themselves. Highly recommend!",
        "submitted_date": "2024-01-10T14:00:00.000Z"
      },
      "photos": {
        "before": ["before1.jpg", "before2.jpg"],
        "after": ["after1.jpg", "after2.jpg"],
        "during": ["during1.jpg", "during2.jpg"]
      },
      "created": "2024-01-08T10:30:00.000Z",
      "updated": "2024-01-10T13:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Invoice Management Endpoints

### 16. Get Invoices

**GET** `/portal/invoices`

Retrieve all invoices for the authenticated user.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `status` (string): Filter by invoice status (pending, paid, overdue, cancelled)
- `date_from` (date): Filter invoices from this date
- `date_to` (date): Filter invoices to this date
- `sort_by` (string): Sort field (default: 'due_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Response
```json
{
  "success": true,
  "message": "Invoices retrieved successfully",
  "data": {
    "invoices": [
      {
        "id": "inv-1",
        "invoice_number": "INV-2024-001",
        "job_number": "JOB-2024-001",
        "title": "Basement Cleanout",
        "amount": 350.00,
        "status": "paid",
        "issue_date": "2024-01-10T14:00:00.000Z",
        "due_date": "2024-01-24T14:00:00.000Z",
        "paid_date": "2024-01-12T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "pages": 1
    },
    "summary": {
      "total_invoices": 8,
      "paid_invoices": 6,
      "pending_invoices": 1,
      "overdue_invoices": 1,
      "total_amount": 2850.00,
      "total_paid": 2500.00,
      "total_pending": 350.00
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 17. Get Invoice Details

**GET** `/portal/invoices/:id`

Retrieve detailed information about a specific invoice.

#### Path Parameters
- `id` (string): Invoice ID

#### Example Response
```json
{
  "success": true,
  "message": "Invoice details retrieved successfully",
  "data": {
    "invoice": {
      "id": "inv-1",
      "invoice_number": "INV-2024-001",
      "job_number": "JOB-2024-001",
      "title": "Basement Cleanout",
      "description": "Complete basement cleanout including old furniture, construction debris, and general clutter removal",
      "status": "paid",
      "issue_date": "2024-01-10T14:00:00.000Z",
      "due_date": "2024-01-24T14:00:00.000Z",
      "paid_date": "2024-01-12T10:30:00.000Z",
      "line_items": [
        {
          "description": "Basement cleanout - labor",
          "quantity": 3.5,
          "unit": "hours",
          "rate": 75.00,
          "amount": 262.50
        },
        {
          "description": "Disposal fees",
          "quantity": 1,
          "unit": "flat",
          "rate": 87.50,
          "amount": 87.50
        }
      ],
      "subtotal": 350.00,
      "tax_amount": 0.00,
      "total_amount": 350.00,
      "payment_terms": "Net 14",
      "payment_method": "credit_card",
      "payment_reference": "TXN-123456789",
      "notes": "Payment received via online portal"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 18. Pay Invoice

**POST** `/portal/invoices/:id/pay`

Process payment for an invoice.

#### Path Parameters
- `id` (string): Invoice ID

#### Request Body
```json
{
  "payment_method": "credit_card",
  "payment_reference": "TXN-987654321",
  "amount": 350.00,
  "notes": "Payment via online portal"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Invoice payment processed successfully",
  "data": {
    "invoice_id": "inv-1",
    "payment_status": "paid",
    "paid_date": "2024-01-15T10:30:00.000Z",
    "payment_reference": "TXN-987654321"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Client Profile Endpoints

### 19. Get Client Profile

**GET** `/portal/profile`

Retrieve the authenticated user's profile information.

#### Example Response
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "profile": {
      "id": "user-1",
      "username": "john.doe",
      "email": "john.doe@email.com",
      "personal_info": {
        "first_name": "John",
        "last_name": "Doe",
        "phone": "555-0100",
        "mobile": "555-0101",
        "date_of_birth": "1985-06-15",
        "preferred_contact_method": "email"
      },
      "addresses": [
        {
          "id": "addr-1",
          "type": "primary",
          "street": "123 Main St",
          "city": "Wilmington",
          "state": "NC",
          "zip_code": "28401",
          "country": "USA",
          "is_default": true
        }
      ],
      "preferences": {
        "language": "en",
        "timezone": "America/New_York",
        "notification_preferences": {
          "email_notifications": true,
          "sms_notifications": false,
          "push_notifications": true,
          "marketing_emails": false
        }
      },
      "service_history": {
        "total_jobs": 8,
        "total_spent": 2850.00,
        "last_service_date": "2024-01-10T10:00:00.000Z",
        "average_rating": 4.8,
        "favorite_services": ["junk_removal", "furniture_pickup"]
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 20. Update Client Profile

**PUT** `/portal/profile`

Update the authenticated user's profile information.

#### Request Body
```json
{
  "personal_info": {
    "phone": "555-0102",
    "mobile": "555-0103"
  },
  "preferences": {
    "notification_preferences": {
      "sms_notifications": true,
      "marketing_emails": true
    }
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "updated_fields": ["personal_info", "preferences"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 21. Change Password

**PUT** `/portal/profile/password`

Change the authenticated user's password.

#### Request Body
```json
{
  "current_password": "oldPassword123",
  "new_password": "newSecurePassword456",
  "confirm_password": "newSecurePassword456"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "password_changed": true,
    "changed_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Portal Reports Endpoints

### 22. Get Service Summary Report

**GET** `/portal/reports/service-summary`

Get a summary report of all services for the authenticated user.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `format` (string): 'json' or 'pdf'

#### Example Response
```json
{
  "success": true,
  "message": "Service summary report generated successfully",
  "data": {
    "report_period": {
      "from": "2023-01-01",
      "to": "2024-01-15"
    },
    "service_overview": {
      "total_requests": 15,
      "total_jobs": 12,
      "completed_jobs": 10,
      "cancelled_jobs": 2,
      "total_spent": 4250.00
    },
    "service_types": {
      "junk_removal": {
        "count": 8,
        "total_spent": 2800.00,
        "average_cost": 350.00
      },
      "furniture_pickup": {
        "count": 3,
        "total_spent": 900.00,
        "average_cost": 300.00
      },
      "construction_debris": {
        "count": 1,
        "total_spent": 550.00,
        "average_cost": 550.00
      }
    },
    "monthly_trends": [
      {
        "month": "January 2024",
        "jobs": 2,
        "spent": 650.00
      }
    ],
    "ratings": {
      "average_rating": 4.8,
      "total_reviews": 10,
      "rating_distribution": {
        "5_star": 8,
        "4_star": 2,
        "3_star": 0,
        "2_star": 0,
        "1_star": 0
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Portal Settings Endpoints

### 23. Get Portal Settings

**GET** `/portal/settings`

Get all portal settings and configurations.

#### Example Response
```json
{
  "success": true,
  "message": "Portal settings retrieved successfully",
  "data": {
    "general_settings": {
      "default_language": "en",
      "default_timezone": "America/New_York",
      "date_format": "MM/DD/YYYY",
      "time_format": "12-hour"
    },
    "notification_settings": {
      "email_notifications": true,
      "sms_notifications": false,
      "push_notifications": true,
      "marketing_emails": false,
      "service_updates": true,
      "payment_reminders": true
    },
    "privacy_settings": {
      "profile_visibility": "private",
      "service_history_visibility": "private",
      "allow_marketing_communications": false
    },
    "security_settings": {
      "two_factor_authentication": false,
      "session_timeout_minutes": 60,
      "password_expiry_days": 90,
      "login_attempts_limit": 5
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 24. Update Portal Settings

**PUT** `/portal/settings`

Update portal settings.

#### Request Body
```json
{
  "notification_settings": {
    "sms_notifications": true,
    "marketing_emails": true
  },
  "privacy_settings": {
    "profile_visibility": "public"
  },
  "security_settings": {
    "two_factor_authentication": true
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Portal settings updated successfully",
  "data": {
    "updated_fields": ["notification_settings", "privacy_settings", "security_settings"]
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
- `USER_NOT_FOUND` - Portal user with specified ID not found
- `INVALID_USER_STATUS` - Invalid user status specified
- `SERVICE_REQUEST_NOT_FOUND` - Service request with specified ID not found
- `INVALID_REQUEST_STATUS` - Invalid request status specified
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `INVALID_PAYMENT_METHOD` - Invalid payment method specified

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 20 requests per minute per IP
- **Report endpoints**: 10 requests per minute per IP

## Client Portal Features

### **Core Portal Management:**
- Full CRUD operations for portal users
- User status tracking and lifecycle management
- Personal and account information management
- User authentication and authorization

### **Service Request Management:**
- Complete service request lifecycle
- Request status tracking and updates
- Item and scheduling management
- Attachment and photo management

### **Job History & Tracking:**
- Complete job history and details
- Progress tracking and status updates
- Crew information and scheduling
- Before/after photos and documentation

### **Invoice Management:**
- Invoice generation and tracking
- Payment processing and status
- Payment method management
- Financial history and reporting

### **Client Profile Management:**
- Personal information management
- Address and contact management
- Preference and notification settings
- Password and security management

### **Reporting & Analytics:**
- Service summary reports
- Spending analysis and trends
- Rating and review tracking
- Service type analytics

### **Portal Customization:**
- Language and timezone settings
- Notification preferences
- Privacy and security settings
- User experience customization

### **Integration Features:**
- Payment gateway integration
- Email and SMS notifications
- File upload and management
- Mobile app support

## Webhook Support

Configure webhooks to receive real-time updates:
- Service request status changes
- Job progress updates
- Invoice status changes
- Payment confirmations

Webhook endpoint: `POST /webhooks/portal`

## Testing

### Test Environment
- **Base URL**: `http://localhost:3001/api/v1`
- **Test Database**: Separate test database with sample data
- **Authentication**: Use test JWT tokens

### Sample Test Data
```bash
# Create test portal user
curl -X POST http://localhost:3001/api/v1/portal/users \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_portal_user.json

# Create service request
curl -X POST http://localhost:3001/api/v1/portal/requests \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_service_request.json
```

This API documentation provides a comprehensive foundation for implementing the Client Portal tab functionality with Node.js, covering all client portal, service requests, job history, client management, invoices, reports, and profile capabilities needed for a robust client portal system.
