# Customers API Documentation

This document outlines the complete REST API endpoints needed to support the Customers tab functionality in your junk removal management system. Built with Node.js, Express, and MySQL.

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

## Customers Endpoints

### 1. Get All Customers

**GET** `/customers`

Retrieve all customers with optional filtering, sorting, and pagination.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `search` (string): Search term for customer name, email, or phone
- `status` (string): Filter by customer status (active, inactive, pending, etc.)
- `customer_type` (string): Filter by customer type (residential, commercial, industrial)
- `city` (string): Filter by city
- `state` (string): Filter by state
- `sort_by` (string): Sort field (default: 'name')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'asc')
- `include_inactive` (boolean): Include inactive customers (default: false)

#### Example Request
```bash
GET /api/v1/customers?page=1&limit=20&status=active&customer_type=commercial&sort_by=name&sort_order=asc
```

#### Example Response
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "customers": [
      {
        "id": "cust-1",
        "name": "Downtown Office Complex",
        "customer_type": "commercial",
        "status": "active",
        "primary_contact": {
          "name": "John Smith",
          "email": "john.smith@downtownoffice.com",
          "phone": "555-0100"
        },
        "primary_address": {
          "street": "321 Commerce St",
          "city": "Wilmington",
          "state": "NC",
          "zip_code": "28401"
        },
        "total_jobs": 45,
        "total_spent": 12500.00,
        "last_job_date": "2024-01-10",
        "created": "2023-06-15T10:30:00.000Z",
        "updated": "2024-01-10T15:45:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    },
    "summary": {
      "total_customers": 156,
      "active_customers": 142,
      "commercial_customers": 89,
      "residential_customers": 67,
      "total_revenue": 450000.00
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Customer by ID

**GET** `/customers/:id`

Retrieve a specific customer by ID with all related information.

#### Path Parameters
- `id` (string): Customer ID

#### Example Request
```bash
GET /api/v1/customers/cust-1
```

#### Example Response
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "customer": {
      "id": "cust-1",
      "name": "Downtown Office Complex",
      "customer_type": "commercial",
      "status": "active",
      "company_details": {
        "legal_name": "Downtown Office Complex LLC",
        "tax_id": "12-3456789",
        "industry": "Real Estate",
        "employee_count": 150
      },
      "contacts": [
        {
          "id": "contact-1",
          "name": "John Smith",
          "title": "Facility Manager",
          "email": "john.smith@downtownoffice.com",
          "phone": "555-0100",
          "mobile": "555-0101",
          "is_primary": true,
          "notes": "Main point of contact for all services"
        }
      ],
      "addresses": [
        {
          "id": "addr-1",
          "type": "billing",
          "street": "321 Commerce St",
          "city": "Wilmington",
          "state": "NC",
          "zip_code": "28401",
          "country": "USA",
          "is_primary": true
        }
      ],
      "tags": [
        {
          "id": "tag-1",
          "name": "Premium Customer",
          "color": "#10B981"
        }
      ],
      "preferences": {
        "communication_method": "email",
        "billing_frequency": "monthly",
        "service_reminders": true,
        "marketing_emails": false
      },
      "service_history": {
        "total_jobs": 45,
        "total_spent": 12500.00,
        "average_job_value": 277.78,
        "last_job_date": "2024-01-10",
        "favorite_services": ["Office Cleanout", "Regular Pickup"]
      },
      "created": "2023-06-15T10:30:00.000Z",
      "updated": "2024-01-10T15:45:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Create New Customer

**POST** `/customers`

Create a new customer with all required information.

#### Request Body
```json
{
  "name": "Riverside Apartments",
  "customer_type": "commercial",
  "status": "active",
  "company_details": {
    "legal_name": "Riverside Apartments LLC",
    "industry": "Property Management",
    "employee_count": 25
  },
  "primary_contact": {
    "name": "Sarah Johnson",
    "title": "Property Manager",
    "email": "sarah.johnson@riversideapts.com",
    "phone": "555-0200"
  },
  "primary_address": {
    "street": "456 River Rd",
    "city": "Wilmington",
    "state": "NC",
    "zip_code": "28403"
  },
  "preferences": {
    "communication_method": "phone",
    "billing_frequency": "quarterly",
    "service_reminders": true
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "customer_id": "cust-2",
    "customer": {
      "id": "cust-2",
      "name": "Riverside Apartments",
      "customer_type": "commercial",
      "status": "active",
      "created": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Customer

**PUT** `/customers/:id`

Update an existing customer by ID.

#### Path Parameters
- `id` (string): Customer ID

#### Request Body
```json
{
  "name": "Updated Riverside Apartments",
  "status": "active",
  "company_details": {
    "employee_count": 30
  },
  "preferences": {
    "billing_frequency": "monthly"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "customer_id": "cust-2",
    "updated_fields": ["name", "company_details.employee_count", "preferences.billing_frequency"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Delete Customer

**DELETE** `/customers/:id`

Delete a customer by ID (soft delete - sets status to 'deleted').

#### Path Parameters
- `id` (string): Customer ID

#### Example Response
```json
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": {
    "customer_id": "cust-2",
    "status": "deleted"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Search Customers

**GET** `/customers/search`

Advanced customer search with multiple criteria.

#### Query Parameters
- `q` (string): Search query (required)
- `search_fields` (string): Comma-separated fields to search (name, email, phone, address)
- `customer_type` (string): Filter by customer type
- `status` (string): Filter by status
- `city` (string): Filter by city
- `state` (string): Filter by state
- `has_active_jobs` (boolean): Filter customers with active jobs
- `min_total_spent` (number): Minimum total amount spent
- `max_total_spent` (number): Maximum total amount spent

#### Example Request
```bash
GET /api/v1/customers/search?q=office&search_fields=name,address&customer_type=commercial&has_active_jobs=true
```

#### Example Response
```json
{
  "success": true,
  "message": "Customer search completed successfully",
  "data": {
    "query": "office",
    "search_fields": ["name", "address"],
    "results": [
      {
        "id": "cust-1",
        "name": "Downtown Office Complex",
        "customer_type": "commercial",
        "status": "active",
        "match_reason": "Name contains 'office'",
        "relevance_score": 0.95
      }
    ],
    "total_results": 1,
    "search_time_ms": 45
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Customer Contacts Endpoints

### 7. Get Customer Contacts

**GET** `/customers/:id/contacts`

Get all contacts for a specific customer.

#### Path Parameters
- `id` (string): Customer ID

#### Example Response
```json
{
  "success": true,
  "message": "Customer contacts retrieved successfully",
  "data": {
    "customer_id": "cust-1",
    "contacts": [
      {
        "id": "contact-1",
        "name": "John Smith",
        "title": "Facility Manager",
        "email": "john.smith@downtownoffice.com",
        "phone": "555-0100",
        "mobile": "555-0101",
        "is_primary": true,
        "notes": "Main point of contact for all services",
        "created": "2023-06-15T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 8. Add Customer Contact

**POST** `/customers/:id/contacts`

Add a new contact to an existing customer.

#### Path Parameters
- `id` (string): Customer ID

#### Request Body
```json
{
  "name": "Mike Wilson",
  "title": "Assistant Manager",
  "email": "mike.wilson@downtownoffice.com",
  "phone": "555-0102",
  "mobile": "555-0103",
  "is_primary": false,
  "notes": "Backup contact for emergencies"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Contact added successfully",
  "data": {
    "contact_id": "contact-2",
    "customer_id": "cust-1",
    "contact_name": "Mike Wilson"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 9. Update Customer Contact

**PUT** `/customers/:id/contacts/:contactId`

Update an existing contact for a customer.

#### Path Parameters
- `id` (string): Customer ID
- `contactId` (string): Contact ID

#### Request Body
```json
{
  "title": "Senior Facility Manager",
  "phone": "555-0104",
  "notes": "Updated contact information"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "contact_id": "contact-1",
    "updated_fields": ["title", "phone", "notes"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 10. Delete Customer Contact

**DELETE** `/customers/:id/contacts/:contactId`

Delete a contact from a customer.

#### Path Parameters
- `id` (string): Customer ID
- `contactId` (string): Contact ID

#### Example Response
```json
{
  "success": true,
  "message": "Contact deleted successfully",
  "data": {
    "contact_id": "contact-2",
    "customer_id": "cust-1"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Customer Addresses Endpoints

### 11. Get Customer Addresses

**GET** `/customers/:id/addresses`

Get all addresses for a specific customer.

#### Path Parameters
- `id` (string): Customer ID

#### Example Response
```json
{
  "success": true,
  "message": "Customer addresses retrieved successfully",
  "data": {
    "customer_id": "cust-1",
    "addresses": [
      {
        "id": "addr-1",
        "type": "billing",
        "street": "321 Commerce St",
        "city": "Wilmington",
        "state": "NC",
        "zip_code": "28401",
        "country": "USA",
        "is_primary": true,
        "notes": "Main office location",
        "created": "2023-06-15T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 12. Add Customer Address

**POST** `/customers/:id/addresses`

Add a new address to an existing customer.

#### Path Parameters
- `id` (string): Customer ID

#### Request Body
```json
{
  "type": "service",
  "street": "789 Business Blvd",
  "city": "Wilmington",
  "state": "NC",
  "zip_code": "28405",
  "country": "USA",
  "is_primary": false,
  "notes": "Secondary service location"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "address_id": "addr-2",
    "customer_id": "cust-1",
    "address_type": "service"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Customer Tags Endpoints

### 13. Get Customer Tags

**GET** `/customers/:id/tags`

Get all tags assigned to a specific customer.

#### Path Parameters
- `id` (string): Customer ID

#### Example Response
```json
{
  "success": true,
  "message": "Customer tags retrieved successfully",
  "data": {
    "customer_id": "cust-1",
    "tags": [
      {
        "id": "tag-1",
        "name": "Premium Customer",
        "color": "#10B981",
        "description": "High-value commercial customers",
        "assigned_date": "2023-08-15T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 14. Assign Tag to Customer

**POST** `/customers/:id/tags`

Assign a tag to a customer.

#### Path Parameters
- `id` (string): Customer ID

#### Request Body
```json
{
  "tag_id": "tag-2",
  "notes": "Customer upgraded to premium service"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Tag assigned successfully",
  "data": {
    "customer_id": "cust-1",
    "tag_id": "tag-2",
    "tag_name": "VIP Customer"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 15. Remove Tag from Customer

**DELETE** `/customers/:id/tags/:tagId`

Remove a tag from a customer.

#### Path Parameters
- `id` (string): Customer ID
- `tagId` (string): Tag ID

#### Example Response
```json
{
  "success": true,
  "message": "Tag removed successfully",
  "data": {
    "customer_id": "cust-1",
    "tag_id": "tag-2"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Customer Notes Endpoints

### 16. Get Customer Notes

**GET** `/customers/:id/notes`

Get all notes for a specific customer.

#### Path Parameters
- `id` (string): Customer ID

#### Query Parameters
- `note_type` (string): Filter by note type
- `created_by` (string): Filter by user who created the note
- `date_from` (date): Filter notes from this date
- `date_to` (date): Filter notes to this date

#### Example Response
```json
{
  "success": true,
  "message": "Customer notes retrieved successfully",
  "data": {
    "customer_id": "cust-1",
    "notes": [
      {
        "id": "note-1",
        "type": "service",
        "content": "Customer requested weekly pickup service starting next month",
        "created_by": "emp-1",
        "created_by_name": "John Driver",
        "created": "2024-01-10T15:45:00.000Z",
        "is_important": false
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 17. Add Customer Note

**POST** `/customers/:id/notes`

Add a new note to a customer.

#### Path Parameters
- `id` (string): Customer ID

#### Request Body
```json
{
  "type": "communication",
  "content": "Customer called to confirm pickup time for tomorrow",
  "is_important": false
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "note_id": "note-2",
    "customer_id": "cust-1",
    "type": "communication"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Customer Communications Endpoints

### 18. Get Customer Communications

**GET** `/customers/:id/communications`

Get all communications with a specific customer.

#### Path Parameters
- `id` (string): Customer ID

#### Query Parameters
- `communication_type` (string): Filter by type (email, phone, sms, in_person)
- `direction` (string): Filter by direction (inbound, outbound)
- `date_from` (date): Filter communications from this date
- `date_to` (date): Filter communications to this date

#### Example Response
```json
{
  "success": true,
  "message": "Customer communications retrieved successfully",
  "data": {
    "customer_id": "cust-1",
    "communications": [
      {
        "id": "comm-1",
        "type": "email",
        "direction": "outbound",
        "subject": "Service Confirmation",
        "content": "Your pickup service has been confirmed for tomorrow",
        "sent_at": "2024-01-10T09:00:00.000Z",
        "status": "delivered",
        "recipient": "john.smith@downtownoffice.com"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 19. Log Customer Communication

**POST** `/customers/:id/communications`

Log a new communication with a customer.

#### Path Parameters
- `id` (string): Customer ID

#### Request Body
```json
{
  "type": "phone",
  "direction": "inbound",
  "subject": "Service Inquiry",
  "content": "Customer called to ask about pricing for office cleanout",
  "duration_minutes": 5,
  "notes": "Customer interested in monthly service"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Communication logged successfully",
  "data": {
    "communication_id": "comm-2",
    "customer_id": "cust-1",
    "type": "phone",
    "direction": "inbound"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Customer Preferences Endpoints

### 20. Get Customer Preferences

**GET** `/customers/:id/preferences`

Get customer preferences and settings.

#### Path Parameters
- `id` (string): Customer ID

#### Example Response
```json
{
  "success": true,
  "message": "Customer preferences retrieved successfully",
  "data": {
    "customer_id": "cust-1",
    "preferences": {
      "communication_method": "email",
      "billing_frequency": "monthly",
      "billing_method": "electronic",
      "service_reminders": true,
      "reminder_frequency": "weekly",
      "marketing_emails": false,
      "sms_notifications": true,
      "preferred_contact_time": "09:00-17:00",
      "special_instructions": "Call before arrival, use loading dock entrance",
      "payment_terms": "Net 30"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 21. Update Customer Preferences

**PUT** `/customers/:id/preferences`

Update customer preferences and settings.

#### Path Parameters
- `id` (string): Customer ID

#### Request Body
```json
{
  "billing_frequency": "quarterly",
  "service_reminders": false,
  "preferred_contact_time": "10:00-16:00",
  "special_instructions": "Updated: Use main entrance, call 15 minutes before arrival"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Customer preferences updated successfully",
  "data": {
    "customer_id": "cust-1",
    "updated_fields": ["billing_frequency", "service_reminders", "preferred_contact_time", "special_instructions"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Customer Service History Endpoints

### 22. Get Customer Service History

**GET** `/customers/:id/service-history`

Get detailed service history for a specific customer.

#### Path Parameters
- `id` (string): Customer ID

#### Query Parameters
- `date_from` (date): Filter services from this date
- `date_to` (date): Filter services to this date
- `service_type` (string): Filter by service type
- `status` (string): Filter by service status
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page

#### Example Response
```json
{
  "success": true,
  "message": "Customer service history retrieved successfully",
  "data": {
    "customer_id": "cust-1",
    "summary": {
      "total_jobs": 45,
      "total_spent": 12500.00,
      "average_job_value": 277.78,
      "first_service": "2023-06-20",
      "last_service": "2024-01-10",
      "favorite_services": ["Office Cleanout", "Regular Pickup"]
    },
    "services": [
      {
        "id": "job-1",
        "type": "Office Cleanout",
        "date": "2024-01-10",
        "status": "completed",
        "amount": 450.00,
        "crew": "Morning Crew",
        "notes": "Large office cleanout, took 6 hours"
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

## Customer Reports Endpoints

### 23. Get Customer Summary Report

**GET** `/customers/reports/summary`

Get a summary report of all customers with analytics.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `customer_type` (string): Filter by customer type
- `status` (string): Filter by customer status
- `format` (string): 'json' or 'pdf'

#### Example Response
```json
{
  "success": true,
  "message": "Customer summary report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "summary": {
      "total_customers": 156,
      "new_customers": 12,
      "active_customers": 142,
      "inactive_customers": 14,
      "total_revenue": 450000.00,
      "average_customer_value": 2884.62
    },
    "customers_by_type": {
      "commercial": 89,
      "residential": 67
    },
    "customers_by_status": {
      "active": 142,
      "inactive": 14
    },
    "top_customers": [
      {
        "id": "cust-1",
        "name": "Downtown Office Complex",
        "total_spent": 12500.00,
        "job_count": 45
      }
    ],
    "customer_growth": {
      "monthly_growth": 8.5,
      "quarterly_growth": 15.2,
      "yearly_growth": 28.7
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
- `CUSTOMER_NOT_FOUND` - Customer with specified ID not found
- `DUPLICATE_CUSTOMER` - Customer with same email/phone already exists
- `INVALID_CUSTOMER_TYPE` - Invalid customer type specified
- `CONTACT_NOT_FOUND` - Contact with specified ID not found
- `ADDRESS_NOT_FOUND` - Address with specified ID not found
- `TAG_NOT_FOUND` - Tag with specified ID not found
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Search endpoints**: 50 requests per minute per IP
- **Report endpoints**: 20 requests per minute per IP

## Customer Management Features

### **Core Customer Management:**
- Full CRUD operations for customer records
- Customer type classification (residential, commercial, industrial)
- Status management and lifecycle tracking
- Company details and business information

### **Contact Management:**
- Multiple contacts per customer
- Primary contact designation
- Contact roles and titles
- Communication preferences

### **Address Management:**
- Multiple address types (billing, service, shipping)
- Primary address designation
- Address validation and geocoding
- Service area mapping

### **Customer Organization:**
- Tag-based categorization
- Custom customer attributes
- Relationship mapping
- Customer segmentation

### **Communication Tracking:**
- Complete communication history
- Multiple communication types
- Inbound/outbound tracking
- Communication effectiveness metrics

### **Service History:**
- Complete job history
- Revenue tracking
- Service preferences
- Customer satisfaction metrics

### **Reporting & Analytics:**
- Customer growth metrics
- Revenue analysis
- Customer lifetime value
- Service utilization reports

### **Integration Features:**
- Job system integration
- Billing system sync
- CRM integration
- Marketing automation

## Webhook Support

Configure webhooks to receive real-time updates:
- Customer creation and updates
- Contact changes
- Status updates
- Service completions

Webhook endpoint: `POST /webhooks/customers`

## Testing

### Test Environment
- **Base URL**: `http://localhost:3001/api/v1`
- **Test Database**: Separate test database with sample data
- **Authentication**: Use test JWT tokens

### Sample Test Data
```bash
# Create test customer
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_customer.json

# Search customers
curl -X GET "http://localhost:3001/api/v1/customers/search?q=office" \
  -H "Authorization: Bearer test_token"
```

This API documentation provides a comprehensive foundation for implementing the Customers tab functionality with Node.js, covering all customer management, contact handling, address management, and reporting capabilities needed for a robust customer relationship management system.
