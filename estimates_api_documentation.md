# Estimates API Documentation

This document outlines the complete REST API endpoints needed to support the Estimates tab functionality in your junk removal management system. Built with Node.js, Express, and MySQL.

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

## Client Requests Endpoints

### 1. Get All Client Requests

**GET** `/estimates/client-requests`

Retrieve all client requests with optional filtering, sorting, and pagination.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `search` (string): Search term for client name, email, or phone
- `status` (string): Filter by request status (pending, in_progress, completed, cancelled)
- `service_type` (string): Filter by service type
- `priority` (string): Filter by priority (high, medium, low)
- `date_from` (date): Filter requests from this date
- `date_to` (date): Filter requests to this date
- `sort_by` (string): Sort field (default: 'created_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /api/v1/estimates/client-requests?page=1&limit=20&status=pending&priority=high&sort_by=created_date&sort_order=desc
```

#### Example Response
```json
{
  "success": true,
  "message": "Client requests retrieved successfully",
  "data": {
    "client_requests": [
      {
        "id": "req-1",
        "client_name": "John Smith",
        "client_email": "john.smith@email.com",
        "client_phone": "555-0100",
        "service_type": "Residential Cleanout",
        "status": "pending",
        "priority": "high",
        "location": "123 Main St, Wilmington, NC",
        "estimated_value": 800.00,
        "requested_date": "2024-01-20",
        "created": "2024-01-15T10:30:00.000Z",
        "assigned_to": "emp-1"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 35,
      "pages": 2
    },
    "summary": {
      "total_requests": 35,
      "pending_requests": 15,
      "in_progress_requests": 12,
      "completed_requests": 8,
      "total_potential_value": 28000.00
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Client Request by ID

**GET** `/estimates/client-requests/:id`

Retrieve a specific client request by ID with all related information.

#### Path Parameters
- `id` (string): Client Request ID

#### Example Request
```bash
GET /api/v1/estimates/client-requests/req-1
```

#### Example Response
```json
{
  "success": true,
  "message": "Client request retrieved successfully",
  "data": {
    "client_request": {
      "id": "req-1",
      "client_name": "John Smith",
      "client_email": "john.smith@email.com",
      "client_phone": "555-0100",
      "client_address": "123 Main St, Wilmington, NC 28401",
      "service_type": "Residential Cleanout",
      "status": "pending",
      "priority": "high",
      "location": {
        "street": "123 Main St",
        "city": "Wilmington",
        "state": "NC",
        "zip_code": "28401"
      },
      "project_details": {
        "description": "Complete cleanout of 3-bedroom house after tenant departure",
        "square_footage": 1800,
        "rooms": ["kitchen", "living_room", "3_bedrooms", "2_bathrooms", "garage"],
        "items_to_remove": ["furniture", "appliances", "clothing", "debris"],
        "special_requirements": "Need to be completed by end of month"
      },
      "timeline": {
        "requested_date": "2024-01-20",
        "preferred_time": "morning",
        "urgency": "high",
        "flexible_dates": false
      },
      "budget": {
        "estimated_value": 800.00,
        "budget_range": "600-1000",
        "payment_method": "credit_card"
      },
      "photos": [
        {
          "id": "photo-1",
          "url": "https://example.com/photo1.jpg",
          "description": "Living room full of furniture",
          "uploaded": "2024-01-15T10:30:00.000Z"
        }
      ],
      "notes": "Client is moving out of state and needs everything removed quickly",
      "assigned_to": "emp-1",
      "assigned_to_name": "Mike Estimator",
      "created": "2024-01-15T10:30:00.000Z",
      "updated": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Create Client Request

**POST** `/estimates/client-requests`

Create a new client request for estimate generation.

#### Request Body
```json
{
  "client_name": "Sarah Johnson",
  "client_email": "sarah.johnson@email.com",
  "client_phone": "555-0200",
  "client_address": "456 Oak Ave, Wilmington, NC 28403",
  "service_type": "Office Cleanout",
  "priority": "medium",
  "project_details": {
    "description": "Small office space cleanout after business closure",
    "square_footage": 800,
    "rooms": ["main_office", "break_room", "storage"],
    "items_to_remove": ["desks", "chairs", "office_equipment", "paperwork"]
  },
  "timeline": {
    "requested_date": "2024-01-25",
    "preferred_time": "afternoon",
    "urgency": "medium"
  },
  "budget": {
    "budget_range": "400-600"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Client request created successfully",
  "data": {
    "request_id": "req-2",
    "client_request": {
      "id": "req-2",
      "client_name": "Sarah Johnson",
      "service_type": "Office Cleanout",
      "status": "pending",
      "created": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Client Request

**PUT** `/estimates/client-requests/:id`

Update an existing client request by ID.

#### Path Parameters
- `id` (string): Client Request ID

#### Request Body
```json
{
  "status": "in_progress",
  "priority": "high",
  "project_details": {
    "description": "Updated: Small office space cleanout after business closure - urgent timeline",
    "urgency": "high"
  },
  "timeline": {
    "requested_date": "2024-01-22"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Client request updated successfully",
  "data": {
    "request_id": "req-2",
    "updated_fields": ["status", "priority", "project_details", "timeline"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Delete Client Request

**DELETE** `/estimates/client-requests/:id`

Delete a client request by ID (soft delete - sets status to 'cancelled').

#### Path Parameters
- `id` (string): Client Request ID

#### Example Response
```json
{
  "success": true,
  "message": "Client request deleted successfully",
  "data": {
    "request_id": "req-2",
    "status": "cancelled"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Estimates Endpoints

### 6. Get All Estimates

**GET** `/estimates`

Retrieve all estimates with optional filtering, sorting, and pagination.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `search` (string): Search term for client name or estimate number
- `status` (string): Filter by estimate status (draft, sent, accepted, rejected, expired)
- `client_request_id` (string): Filter by client request ID
- `date_from` (date): Filter estimates from this date
- `date_to` (date): Filter estimates to this date
- `min_total` (number): Minimum total amount
- `max_total` (number): Maximum total amount
- `sort_by` (string): Sort field (default: 'created_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /api/v1/estimates?page=1&limit=20&status=sent&min_total=500&sort_by=created_date&sort_order=desc
```

#### Example Response
```json
{
  "success": true,
  "message": "Estimates retrieved successfully",
  "data": {
    "estimates": [
      {
        "id": "est-1",
        "estimate_number": "EST-2024-001",
        "client_name": "John Smith",
        "client_email": "john.smith@email.com",
        "service_type": "Residential Cleanout",
        "status": "sent",
        "total_amount": 850.00,
        "valid_until": "2024-02-15",
        "created": "2024-01-15T10:30:00.000Z",
        "sent_date": "2024-01-15T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 28,
      "pages": 2
    },
    "summary": {
      "total_estimates": 28,
      "draft_estimates": 5,
      "sent_estimates": 15,
      "accepted_estimates": 6,
      "rejected_estimates": 2,
      "total_value": 22400.00
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Get Estimate by ID

**GET** `/estimates/:id`

Retrieve a specific estimate by ID with all related information.

#### Path Parameters
- `id` (string): Estimate ID

#### Example Request
```bash
GET /api/v1/estimates/est-1
```

#### Example Response
```json
{
  "success": true,
  "message": "Estimate retrieved successfully",
  "data": {
    "estimate": {
      "id": "est-1",
      "estimate_number": "EST-2024-001",
      "client_request_id": "req-1",
      "client_name": "John Smith",
      "client_email": "john.smith@email.com",
      "client_phone": "555-0100",
      "client_address": "123 Main St, Wilmington, NC 28401",
      "service_type": "Residential Cleanout",
      "status": "sent",
      "project_details": {
        "description": "Complete cleanout of 3-bedroom house after tenant departure",
        "square_footage": 1800,
        "estimated_duration": "4-6 hours",
        "crew_size": 3
      },
      "items": [
        {
          "id": "item-1",
          "description": "Furniture removal and disposal",
          "quantity": 1,
          "unit_price": 300.00,
          "total_price": 300.00,
          "category": "furniture"
        },
        {
          "id": "item-2",
          "description": "Appliance removal and disposal",
          "quantity": 1,
          "unit_price": 200.00,
          "total_price": 200.00,
          "category": "appliances"
        }
      ],
      "additional_fees": [
        {
          "id": "fee-1",
          "description": "Hazardous waste disposal",
          "amount": 50.00,
          "type": "additional"
        }
      ],
      "pricing": {
        "subtotal": 500.00,
        "tax_rate": 7.0,
        "tax_amount": 35.00,
        "total_amount": 850.00,
        "deposit_required": 200.00,
        "payment_terms": "50% deposit, balance upon completion"
      },
      "timeline": {
        "estimated_start_date": "2024-01-20",
        "estimated_completion_date": "2024-01-20",
        "valid_until": "2024-02-15"
      },
      "terms_conditions": "Standard terms apply. Estimate valid for 30 days.",
      "notes": "Client prefers morning appointments. May need additional time for garage cleanout.",
      "created_by": "emp-1",
      "created_by_name": "Mike Estimator",
      "created": "2024-01-15T10:30:00.000Z",
      "sent_date": "2024-01-15T14:00:00.000Z",
      "updated": "2024-01-15T14:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 8. Create Estimate

**POST** `/estimates`

Create a new estimate from a client request.

#### Request Body
```json
{
  "client_request_id": "req-2",
  "estimate_number": "EST-2024-002",
  "items": [
    {
      "description": "Office furniture removal and disposal",
      "quantity": 1,
      "unit_price": 250.00,
      "category": "furniture"
    },
    {
      "description": "Office equipment removal and disposal",
      "quantity": 1,
      "unit_price": 150.00,
      "category": "equipment"
    }
  ],
  "additional_fees": [
    {
      "description": "After-hours service fee",
      "amount": 75.00,
      "type": "additional"
    }
  ],
  "pricing": {
    "tax_rate": 7.0,
    "deposit_required": 150.00,
    "payment_terms": "50% deposit, balance upon completion"
  },
  "timeline": {
    "estimated_start_date": "2024-01-25",
    "estimated_completion_date": "2024-01-25",
    "valid_until": "2024-02-24"
  },
  "terms_conditions": "Standard terms apply. Estimate valid for 30 days.",
  "notes": "Client needs flexible scheduling due to business hours."
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Estimate created successfully",
  "data": {
    "estimate_id": "est-2",
    "estimate_number": "EST-2024-002",
    "total_amount": 507.50,
    "created": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 9. Update Estimate

**PUT** `/estimates/:id`

Update an existing estimate by ID.

#### Path Parameters
- `id` (string): Estimate ID

#### Request Body
```json
{
  "items": [
    {
      "id": "item-1",
      "unit_price": 275.00,
      "total_price": 275.00
    }
  ],
  "pricing": {
    "deposit_required": 175.00
  },
  "notes": "Updated pricing based on site visit. Additional furniture found in storage area."
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Estimate updated successfully",
  "data": {
    "estimate_id": "est-2",
    "updated_fields": ["items", "pricing", "notes"],
    "new_total_amount": 532.50
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 10. Send Estimate

**POST** `/estimates/:id/send`

Send an estimate to the client via email.

#### Path Parameters
- `id` (string): Estimate ID

#### Request Body
```json
{
  "send_method": "email",
  "email_template": "estimate_proposal",
  "additional_message": "Thank you for considering our services. Please review the estimate and let us know if you have any questions.",
  "cc_emails": ["manager@company.com"]
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Estimate sent successfully",
  "data": {
    "estimate_id": "est-2",
    "sent_date": "2024-01-15T15:00:00.000Z",
    "sent_to": "sarah.johnson@email.com",
    "email_id": "email-123"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 11. Update Estimate Status

**PUT** `/estimates/:id/status`

Update the status of an estimate.

#### Path Parameters
- `id` (string): Estimate ID

#### Request Body
```json
{
  "status": "accepted",
  "status_notes": "Client accepted estimate and scheduled for January 25th",
  "accepted_date": "2024-01-16T10:00:00.000Z",
  "next_action": "Create job and schedule crew"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Estimate status updated successfully",
  "data": {
    "estimate_id": "est-2",
    "status": "accepted",
    "accepted_date": "2024-01-16T10:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Estimate Items Endpoints

### 12. Get Estimate Items

**GET** `/estimates/:id/items`

Get all items for a specific estimate.

#### Path Parameters
- `id` (string): Estimate ID

#### Example Response
```json
{
  "success": true,
  "message": "Estimate items retrieved successfully",
  "data": {
    "estimate_id": "est-1",
    "items": [
      {
        "id": "item-1",
        "description": "Furniture removal and disposal",
        "quantity": 1,
        "unit_price": 300.00,
        "total_price": 300.00,
        "category": "furniture",
        "notes": "Includes all furniture in living room and bedrooms"
      }
    ],
    "summary": {
      "total_items": 2,
      "subtotal": 500.00,
      "categories": ["furniture", "appliances"]
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 13. Add Estimate Item

**POST** `/estimates/:id/items`

Add a new item to an estimate.

#### Path Parameters
- `id` (string): Estimate ID

#### Request Body
```json
{
  "description": "Garage cleanout and debris removal",
  "quantity": 1,
  "unit_price": 150.00,
  "category": "debris",
  "notes": "Garage is full of old tools and miscellaneous items"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Estimate item added successfully",
  "data": {
    "item_id": "item-3",
    "estimate_id": "est-1",
    "total_price": 150.00,
    "new_estimate_total": 1000.00
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Pricing Items Endpoints

### 14. Get Pricing Items

**GET** `/estimates/pricing-items`

Get all available pricing items for estimate generation.

#### Query Parameters
- `category` (string): Filter by pricing category
- `is_active` (boolean): Filter by active status
- `search` (string): Search term for item description

#### Example Response
```json
{
  "success": true,
  "message": "Pricing items retrieved successfully",
  "data": {
    "pricing_items": [
      {
        "id": "price-1",
        "description": "Furniture removal and disposal",
        "category": "furniture",
        "base_price": 300.00,
        "unit": "per_room",
        "is_active": true,
        "notes": "Standard furniture removal including disposal fees"
      }
    ],
    "categories": [
      {
        "id": "cat-1",
        "name": "Furniture",
        "description": "Furniture removal and disposal services",
        "item_count": 15
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 15. Create Pricing Item

**POST** `/estimates/pricing-items`

Create a new pricing item.

#### Request Body
```json
{
  "description": "Electronics disposal and recycling",
  "category": "electronics",
  "base_price": 75.00,
  "unit": "per_item",
  "notes": "Includes proper disposal and recycling of electronic waste"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Pricing item created successfully",
  "data": {
    "pricing_item_id": "price-2",
    "description": "Electronics disposal and recycling",
    "base_price": 75.00
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Estimate Templates Endpoints

### 16. Get Estimate Templates

**GET** `/estimates/templates`

Get all available estimate templates.

#### Example Response
```json
{
  "success": true,
  "message": "Estimate templates retrieved successfully",
  "data": {
    "templates": [
      {
        "id": "template-1",
        "name": "Standard Residential Cleanout",
        "description": "Template for typical residential cleanout projects",
        "service_type": "residential",
        "items": [
          {
            "description": "Furniture removal and disposal",
            "base_price": 300.00,
            "category": "furniture"
          }
        ],
        "is_default": true
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 17. Create Estimate from Template

**POST** `/estimates/from-template`

Create a new estimate using a template.

#### Request Body
```json
{
  "template_id": "template-1",
  "client_request_id": "req-3",
  "customizations": {
    "items": [
      {
        "description": "Furniture removal and disposal",
        "quantity": 2,
        "unit_price": 300.00
      }
    ],
    "additional_fees": [
      {
        "description": "Hazardous waste disposal",
        "amount": 50.00
      }
    ]
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Estimate created from template successfully",
  "data": {
    "estimate_id": "est-3",
    "template_used": "Standard Residential Cleanout",
    "total_amount": 650.00
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Estimate Reports Endpoints

### 18. Get Estimates Summary Report

**GET** `/estimates/reports/summary`

Get a summary report of all estimates with analytics.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `status` (string): Filter by estimate status
- `service_type` (string): Filter by service type
- `format` (string): 'json' or 'pdf'

#### Example Response
```json
{
  "success": true,
  "message": "Estimates summary report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "summary": {
      "total_estimates": 28,
      "draft_estimates": 5,
      "sent_estimates": 15,
      "accepted_estimates": 6,
      "rejected_estimates": 2,
      "total_value": 22400.00,
      "accepted_value": 4800.00,
      "conversion_rate": 21.4
    },
    "estimates_by_service_type": {
      "residential": 18,
      "commercial": 8,
      "industrial": 2
    },
    "estimates_by_status": {
      "draft": 5,
      "sent": 15,
      "accepted": 6,
      "rejected": 2
    },
    "top_performing_items": [
      {
        "description": "Furniture removal and disposal",
        "total_quantity": 25,
        "total_value": 7500.00
      }
    ],
    "monthly_trends": {
      "estimates_created": [5, 8, 12, 3],
      "estimates_accepted": [1, 2, 3, 0]
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 19. Get Estimate Performance Report

**GET** `/estimates/reports/performance`

Get detailed performance metrics for estimates and sales team.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `employee_id` (string): Filter by specific employee
- `service_type` (string): Filter by service type

#### Example Response
```json
{
  "success": true,
  "message": "Estimate performance report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "team_performance": [
      {
        "employee_id": "emp-1",
        "employee_name": "Mike Estimator",
        "estimates_created": 15,
        "estimates_sent": 12,
        "estimates_accepted": 4,
        "conversion_rate": 33.3,
        "total_value": 12000.00,
        "average_response_time": "2.5 hours"
      }
    ],
    "service_type_performance": [
      {
        "service_type": "residential",
        "total_estimates": 18,
        "conversion_rate": 25.0,
        "average_value": 800.00
      }
    ],
    "conversion_funnel": {
      "estimates_created": 28,
      "estimates_sent": 15,
      "estimates_viewed": 12,
      "estimates_accepted": 6
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
- `CLIENT_REQUEST_NOT_FOUND` - Client request with specified ID not found
- `ESTIMATE_NOT_FOUND` - Estimate with specified ID not found
- `INVALID_ESTIMATE_STATUS` - Invalid estimate status specified
- `PRICING_ITEM_NOT_FOUND` - Pricing item with specified ID not found
- `TEMPLATE_NOT_FOUND` - Template with specified ID not found
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Search endpoints**: 50 requests per minute per IP
- **Report endpoints**: 20 requests per minute per IP

## Estimate Management Features

### **Core Estimate Management:**
- Full CRUD operations for estimates
- Estimate status tracking and lifecycle management
- Estimate numbering and versioning
- Client request integration

### **Client Request Management:**
- Client request creation and tracking
- Project details and requirements capture
- Photo attachments and documentation
- Request assignment and prioritization

### **Estimate Generation:**
- Template-based estimate creation
- Dynamic pricing calculations
- Item categorization and organization
- Additional fees and adjustments

### **Pricing Management:**
- Standardized pricing items
- Category-based pricing structure
- Dynamic pricing calculations
- Pricing history and updates

### **Estimate Workflow:**
- Draft to sent workflow
- Client acceptance tracking
- Estimate expiration management
- Status updates and notifications

### **Reporting & Analytics:**
- Estimate performance metrics
- Conversion rate analysis
- Service type effectiveness
- Team performance tracking

### **Integration Features:**
- Client system integration
- Job system connection
- Email automation
- Document generation

## Webhook Support

Configure webhooks to receive real-time updates:
- Estimate creation and updates
- Status changes
- Client acceptance/rejection
- Estimate expiration

Webhook endpoint: `POST /webhooks/estimates`

## Testing

### Test Environment
- **Base URL**: `http://localhost:3001/api/v1`
- **Test Database**: Separate test database with sample data
- **Authentication**: Use test JWT tokens

### Sample Test Data
```bash
# Create test client request
curl -X POST http://localhost:3001/api/v1/estimates/client-requests \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_client_request.json

# Create estimate from request
curl -X POST http://localhost:3001/api/v1/estimates \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_estimate.json
```

This API documentation provides a comprehensive foundation for implementing the Estimates tab functionality with Node.js, covering all estimate generation, pricing, client requests, and estimate management functionality.
