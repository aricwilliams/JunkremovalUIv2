# Leads API Documentation

This document outlines the complete REST API endpoints needed to support the Leads tab functionality in your junk removal management system. Built with Node.js, Express, and MySQL.

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

## Leads Endpoints

### 1. Get All Leads

**GET** `/leads`

Retrieve all leads with optional filtering, sorting, and pagination.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20, max: 100)
- `search` (string): Search term for lead name, email, or phone
- `status` (string): Filter by lead status (new, qualified, contacted, converted, lost)
- `source` (string): Filter by lead source (website, referral, cold_call, social_media, etc.)
- `priority` (string): Filter by priority (high, medium, low)
- `assigned_to` (string): Filter by assigned employee
- `date_from` (date): Filter leads from this date
- `date_to` (date): Filter leads to this date
- `sort_by` (string): Sort field (default: 'created_date')
- `sort_order` (string): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /api/v1/leads?page=1&limit=20&status=new&source=website&priority=high&sort_by=created_date&sort_order=desc
```

#### Example Response
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": {
    "leads": [
      {
        "id": "lead-1",
        "name": "Coastal Retail Center",
        "company": "Coastal Retail Group",
        "email": "manager@coastalretail.com",
        "phone": "555-0300",
        "status": "new",
        "source": "website",
        "priority": "high",
        "assigned_to": "emp-2",
        "assigned_to_name": "Sarah Sales",
        "estimated_value": 2500.00,
        "service_type": "Commercial Cleanout",
        "location": "789 Beach Blvd, Wilmington, NC",
        "created": "2024-01-15T10:30:00.000Z",
        "last_contact": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    },
    "summary": {
      "total_leads": 45,
      "new_leads": 15,
      "qualified_leads": 20,
      "converted_leads": 8,
      "lost_leads": 2,
      "total_potential_value": 125000.00
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Lead by ID

**GET** `/leads/:id`

Retrieve a specific lead by ID with all related information.

#### Path Parameters
- `id` (string): Lead ID

#### Example Request
```bash
GET /api/v1/leads/lead-1
```

#### Example Response
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": {
    "lead": {
      "id": "lead-1",
      "name": "Coastal Retail Center",
      "company": "Coastal Retail Group",
      "email": "manager@coastalretail.com",
      "phone": "555-0300",
      "mobile": "555-0301",
      "status": "new",
      "source": "website",
      "priority": "high",
      "assigned_to": "emp-2",
      "assigned_to_name": "Sarah Sales",
      "estimated_value": 2500.00,
      "service_type": "Commercial Cleanout",
      "location": {
        "street": "789 Beach Blvd",
        "city": "Wilmington",
        "state": "NC",
        "zip_code": "28405"
      },
      "project_details": {
        "description": "Complete cleanout of retail space after tenant departure",
        "timeline": "2 weeks",
        "budget_range": "2000-3000",
        "urgency": "high"
      },
      "qualification": {
        "is_qualified": false,
        "qualification_score": 75,
        "qualification_notes": "Good budget, clear timeline, needs follow-up"
      },
      "activities": [
        {
          "id": "activity-1",
          "type": "initial_contact",
          "description": "Lead submitted through website contact form",
          "created": "2024-01-15T10:30:00.000Z"
        }
      ],
      "notes": [
        {
          "id": "note-1",
          "content": "Lead seems serious about project, follow up within 24 hours",
          "created_by": "emp-2",
          "created": "2024-01-15T10:30:00.000Z"
        }
      ],
      "created": "2024-01-15T10:30:00.000Z",
      "updated": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Create New Lead

**POST** `/leads`

Create a new lead with all required information.

#### Request Body
```json
{
  "name": "Downtown Office Building",
  "company": "Downtown Properties LLC",
  "email": "contact@downtownproperties.com",
  "phone": "555-0400",
  "status": "new",
  "source": "referral",
  "priority": "medium",
  "assigned_to": "emp-1",
  "estimated_value": 3500.00,
  "service_type": "Office Cleanout",
  "location": {
    "street": "123 Main St",
    "city": "Wilmington",
    "state": "NC",
    "zip_code": "28401"
  },
  "project_details": {
    "description": "Office space cleanout for new tenant",
    "timeline": "1 week",
    "budget_range": "3000-4000"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "lead_id": "lead-2",
    "lead": {
      "id": "lead-2",
      "name": "Downtown Office Building",
      "company": "Downtown Properties LLC",
      "status": "new",
      "source": "referral",
      "created": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Lead

**PUT** `/leads/:id`

Update an existing lead by ID.

#### Path Parameters
- `id` (string): Lead ID

#### Request Body
```json
{
  "status": "qualified",
  "priority": "high",
  "estimated_value": 4000.00,
  "project_details": {
    "timeline": "2 weeks",
    "budget_range": "3500-4500"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "lead_id": "lead-1",
    "updated_fields": ["status", "priority", "estimated_value", "project_details"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Delete Lead

**DELETE** `/leads/:id`

Delete a lead by ID (soft delete - sets status to 'deleted').

#### Path Parameters
- `id` (string): Lead ID

#### Example Response
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": {
    "lead_id": "lead-2",
    "status": "deleted"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Search Leads

**GET** `/leads/search`

Advanced lead search with multiple criteria.

#### Query Parameters
- `q` (string): Search query (required)
- `search_fields` (string): Comma-separated fields to search (name, company, email, phone)
- `status` (string): Filter by lead status
- `source` (string): Filter by lead source
- `priority` (string): Filter by priority
- `assigned_to` (string): Filter by assigned employee
- `min_estimated_value` (number): Minimum estimated value
- `max_estimated_value` (number): Maximum estimated value
- `service_type` (string): Filter by service type

#### Example Request
```bash
GET /api/v1/leads/search?q=office&search_fields=name,company&status=new&source=website&min_estimated_value=2000
```

#### Example Response
```json
{
  "success": true,
  "message": "Lead search completed successfully",
  "data": {
    "query": "office",
    "search_fields": ["name", "company"],
    "results": [
      {
        "id": "lead-2",
        "name": "Downtown Office Building",
        "company": "Downtown Properties LLC",
        "status": "new",
        "source": "referral",
        "match_reason": "Company name contains 'office'",
        "relevance_score": 0.85
      }
    ],
    "total_results": 1,
    "search_time_ms": 32
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Convert Lead to Customer

**POST** `/leads/:id/convert`

Convert a qualified lead to a customer.

#### Path Parameters
- `id` (string): Lead ID

#### Request Body
```json
{
  "customer_name": "Downtown Properties LLC",
  "customer_type": "commercial",
  "first_job_details": {
    "service_type": "Office Cleanout",
    "estimated_value": 4000.00,
    "preferred_date": "2024-02-01",
    "notes": "Converted from lead - urgent timeline"
  },
  "billing_info": {
    "billing_address": "123 Main St, Wilmington, NC 28401",
    "payment_terms": "Net 30"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Lead converted successfully",
  "data": {
    "lead_id": "lead-2",
    "customer_id": "cust-3",
    "customer_name": "Downtown Properties LLC",
    "first_job_id": "job-3",
    "conversion_value": 4000.00
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Lead Activities Endpoints

### 8. Get Lead Activities

**GET** `/leads/:id/activities`

Get all activities for a specific lead.

#### Path Parameters
- `id` (string): Lead ID

#### Query Parameters
- `activity_type` (string): Filter by activity type
- `date_from` (date): Filter activities from this date
- `date_to` (date): Filter activities to this date

#### Example Response
```json
{
  "success": true,
  "message": "Lead activities retrieved successfully",
  "data": {
    "lead_id": "lead-1",
    "activities": [
      {
        "id": "activity-1",
        "type": "initial_contact",
        "description": "Lead submitted through website contact form",
        "created": "2024-01-15T10:30:00.000Z",
        "created_by": "system"
      },
      {
        "id": "activity-2",
        "type": "phone_call",
        "description": "Initial follow-up call made, customer interested",
        "created": "2024-01-15T14:00:00.000Z",
        "created_by": "emp-2",
        "duration_minutes": 15,
        "outcome": "positive"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 9. Add Lead Activity

**POST** `/leads/:id/activities`

Add a new activity to a lead.

#### Path Parameters
- `id` (string): Lead ID

#### Request Body
```json
{
  "type": "email_sent",
  "description": "Follow-up email sent with service proposal",
  "outcome": "positive",
  "next_action": "Schedule site visit",
  "scheduled_follow_up": "2024-01-17T10:00:00.000Z"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Activity added successfully",
  "data": {
    "activity_id": "activity-3",
    "lead_id": "lead-1",
    "type": "email_sent"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Lead Notes Endpoints

### 10. Get Lead Notes

**GET** `/leads/:id/notes`

Get all notes for a specific lead.

#### Path Parameters
- `id` (string): Lead ID

#### Query Parameters
- `note_type` (string): Filter by note type
- `created_by` (string): Filter by user who created the note
- `date_from` (date): Filter notes from this date
- `date_to` (date): Filter notes to this date

#### Example Response
```json
{
  "success": true,
  "message": "Lead notes retrieved successfully",
  "data": {
    "lead_id": "lead-1",
    "notes": [
      {
        "id": "note-1",
        "type": "qualification",
        "content": "Lead seems serious about project, follow up within 24 hours",
        "created_by": "emp-2",
        "created_by_name": "Sarah Sales",
        "created": "2024-01-15T10:30:00.000Z",
        "is_important": true
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 11. Add Lead Note

**POST** `/leads/:id/notes`

Add a new note to a lead.

#### Path Parameters
- `id` (string): Lead ID

#### Request Body
```json
{
  "type": "follow_up",
  "content": "Customer called back, very interested in our services. Wants to schedule site visit next week.",
  "is_important": true
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "note_id": "note-2",
    "lead_id": "lead-1",
    "type": "follow_up"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Lead Qualification Endpoints

### 12. Update Lead Qualification

**PUT** `/leads/:id/qualification`

Update lead qualification status and scoring.

#### Path Parameters
- `id` (string): Lead ID

#### Request Body
```json
{
  "is_qualified": true,
  "qualification_score": 85,
  "qualification_notes": "Customer has budget, clear timeline, and decision-making authority",
  "qualification_criteria": {
    "budget": "qualified",
    "timeline": "qualified",
    "authority": "qualified",
    "need": "qualified"
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Lead qualification updated successfully",
  "data": {
    "lead_id": "lead-1",
    "is_qualified": true,
    "qualification_score": 85,
    "updated_fields": ["is_qualified", "qualification_score", "qualification_notes", "qualification_criteria"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 13. Get Lead Qualification

**GET** `/leads/:id/qualification`

Get lead qualification details and scoring.

#### Path Parameters
- `id` (string): Lead ID

#### Example Response
```json
{
  "success": true,
  "message": "Lead qualification retrieved successfully",
  "data": {
    "lead_id": "lead-1",
    "qualification": {
      "is_qualified": true,
      "qualification_score": 85,
      "qualification_notes": "Customer has budget, clear timeline, and decision-making authority",
      "qualification_criteria": {
        "budget": "qualified",
        "timeline": "qualified",
        "authority": "qualified",
        "need": "qualified"
      },
      "qualified_date": "2024-01-15T15:30:00.000Z",
      "qualified_by": "emp-2"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Lead Follow-ups Endpoints

### 14. Get Lead Follow-ups

**GET** `/leads/:id/follow-ups`

Get all follow-up activities for a specific lead.

#### Path Parameters
- `id` (string): Lead ID

#### Query Parameters
- `status` (string): Filter by follow-up status (scheduled, completed, overdue)
- `date_from` (date): Filter follow-ups from this date
- `date_to` (date): Filter follow-ups to this date

#### Example Response
```json
{
  "success": true,
  "message": "Lead follow-ups retrieved successfully",
  "data": {
    "lead_id": "lead-1",
    "follow_ups": [
      {
        "id": "followup-1",
        "type": "phone_call",
        "description": "Follow-up call to discuss proposal",
        "scheduled_date": "2024-01-17T10:00:00.000Z",
        "status": "scheduled",
        "assigned_to": "emp-2",
        "notes": "Customer prefers afternoon calls"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 15. Schedule Lead Follow-up

**POST** `/leads/:id/follow-ups`

Schedule a new follow-up for a lead.

#### Path Parameters
- `id` (string): Lead ID

#### Request Body
```json
{
  "type": "site_visit",
  "description": "Schedule site visit to assess project scope",
  "scheduled_date": "2024-01-20T14:00:00.000Z",
  "assigned_to": "emp-1",
  "notes": "Customer available after 2 PM, bring camera for photos"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Follow-up scheduled successfully",
  "data": {
    "followup_id": "followup-2",
    "lead_id": "lead-1",
    "type": "site_visit",
    "scheduled_date": "2024-01-20T14:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 16. Complete Lead Follow-up

**PUT** `/leads/:id/follow-ups/:followupId`

Mark a follow-up as completed.

#### Path Parameters
- `id` (string): Lead ID
- `followupId` (string): Follow-up ID

#### Request Body
```json
{
  "status": "completed",
  "completion_notes": "Site visit completed. Project scope is larger than initially estimated. Customer very interested.",
  "outcome": "positive",
  "next_action": "Prepare detailed proposal"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Follow-up completed successfully",
  "data": {
    "followup_id": "followup-2",
    "status": "completed",
    "completion_notes": "Site visit completed. Project scope is larger than initially estimated. Customer very interested."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Lead Sources Endpoints

### 17. Get Lead Sources

**GET** `/leads/sources`

Get all available lead sources with statistics.

#### Example Response
```json
{
  "success": true,
  "message": "Lead sources retrieved successfully",
  "data": {
    "sources": [
      {
        "id": "source-1",
        "name": "Website",
        "description": "Lead generation from company website",
        "total_leads": 25,
        "conversion_rate": 32.0,
        "average_value": 2800.00,
        "is_active": true
      },
      {
        "id": "source-2",
        "name": "Referral",
        "description": "Customer and partner referrals",
        "total_leads": 15,
        "conversion_rate": 46.7,
        "average_value": 3500.00,
        "is_active": true
      }
    ],
    "summary": {
      "total_sources": 8,
      "active_sources": 6,
      "total_leads": 45,
      "overall_conversion_rate": 35.6
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 18. Create Lead Source

**POST** `/leads/sources`

Create a new lead source.

#### Request Body
```json
{
  "name": "Social Media",
  "description": "Lead generation from social media platforms",
  "is_active": true
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Lead source created successfully",
  "data": {
    "source_id": "source-3",
    "name": "Social Media",
    "is_active": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Lead Workflows Endpoints

### 19. Get Lead Workflows

**GET** `/leads/workflows`

Get all available lead workflows and automation rules.

#### Example Response
```json
{
  "success": true,
  "message": "Lead workflows retrieved successfully",
  "data": {
    "workflows": [
      {
        "id": "workflow-1",
        "name": "New Lead Follow-up",
        "description": "Automated follow-up sequence for new leads",
        "triggers": ["lead_created"],
        "actions": [
          {
            "type": "send_email",
            "template": "welcome_email",
            "delay_hours": 1
          },
          {
            "type": "schedule_follow_up",
            "delay_hours": 24
          }
        ],
        "is_active": true
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 20. Create Lead Workflow

**POST** `/leads/workflows`

Create a new lead workflow.

#### Request Body
```json
{
  "name": "High Priority Lead Escalation",
  "description": "Escalate high priority leads to senior sales team",
  "triggers": ["lead_priority_changed"],
  "conditions": {
    "priority": "high",
    "status": "new"
  },
  "actions": [
    {
      "type": "reassign_lead",
      "assigned_to": "emp-3"
    },
    {
      "type": "send_notification",
      "recipients": ["sales_manager"]
    }
  ]
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Lead workflow created successfully",
  "data": {
    "workflow_id": "workflow-2",
    "name": "High Priority Lead Escalation"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Lead Reports Endpoints

### 21. Get Lead Summary Report

**GET** `/leads/reports/summary`

Get a summary report of all leads with analytics.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `status` (string): Filter by lead status
- `source` (string): Filter by lead source
- `assigned_to` (string): Filter by assigned employee
- `format` (string): 'json' or 'pdf'

#### Example Response
```json
{
  "success": true,
  "message": "Lead summary report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "summary": {
      "total_leads": 45,
      "new_leads": 15,
      "qualified_leads": 20,
      "converted_leads": 8,
      "lost_leads": 2,
      "total_potential_value": 125000.00,
      "conversion_rate": 17.8
    },
    "leads_by_source": {
      "website": 25,
      "referral": 15,
      "cold_call": 5
    },
    "leads_by_status": {
      "new": 15,
      "qualified": 20,
      "converted": 8,
      "lost": 2
    },
    "leads_by_priority": {
      "high": 10,
      "medium": 25,
      "low": 10
    },
    "top_performing_sources": [
      {
        "source": "referral",
        "conversion_rate": 46.7,
        "average_value": 3500.00
      }
    ],
    "lead_growth": {
      "monthly_growth": 12.5,
      "quarterly_growth": 28.3
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 22. Get Lead Performance Report

**GET** `/leads/reports/performance`

Get detailed performance metrics for leads and sales team.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `employee_id` (string): Filter by specific employee
- `source` (string): Filter by lead source

#### Example Response
```json
{
  "success": true,
  "message": "Lead performance report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "team_performance": [
      {
        "employee_id": "emp-1",
        "employee_name": "John Sales",
        "leads_assigned": 20,
        "leads_qualified": 15,
        "leads_converted": 6,
        "conversion_rate": 30.0,
        "total_value": 18000.00,
        "average_response_time": "2.5 hours"
      }
    ],
    "source_performance": [
      {
        "source": "website",
        "total_leads": 25,
        "conversion_rate": 32.0,
        "average_value": 2800.00,
        "cost_per_lead": 50.00
      }
    ],
    "conversion_funnel": {
      "new_leads": 45,
      "contacted_leads": 38,
      "qualified_leads": 20,
      "proposal_sent": 12,
      "converted_leads": 8
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
- `LEAD_NOT_FOUND` - Lead with specified ID not found
- `DUPLICATE_LEAD` - Lead with same email/phone already exists
- `INVALID_LEAD_STATUS` - Invalid lead status specified
- `INVALID_LEAD_SOURCE` - Invalid lead source specified
- `FOLLOWUP_NOT_FOUND` - Follow-up with specified ID not found
- `ACTIVITY_NOT_FOUND` - Activity with specified ID not found
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Search endpoints**: 50 requests per minute per IP
- **Report endpoints**: 20 requests per minute per IP

## Lead Management Features

### **Core Lead Management:**
- Full CRUD operations for lead records
- Lead status tracking and lifecycle management
- Source attribution and tracking
- Priority classification and assignment

### **Lead Qualification:**
- Qualification scoring system
- Qualification criteria tracking
- Automated qualification workflows
- Qualification status updates

### **Lead Activities:**
- Complete activity tracking
- Multiple activity types
- Outcome recording
- Next action planning

### **Follow-up Management:**
- Scheduled follow-ups
- Follow-up completion tracking
- Automated follow-up reminders
- Follow-up outcome recording

### **Lead Conversion:**
- Lead to customer conversion
- First job creation
- Customer record setup
- Conversion value tracking

### **Lead Sources:**
- Source tracking and analytics
- Source performance metrics
- Cost per lead analysis
- Source optimization insights

### **Workflow Automation:**
- Automated lead processing
- Trigger-based actions
- Conditional workflows
- Workflow performance tracking

### **Reporting & Analytics:**
- Lead performance metrics
- Conversion rate analysis
- Source effectiveness
- Team performance tracking

### **Integration Features:**
- Customer system integration
- Job system connection
- Email automation
- CRM integration

## Webhook Support

Configure webhooks to receive real-time updates:
- Lead creation and updates
- Status changes
- Qualification updates
- Conversion events

Webhook endpoint: `POST /webhooks/leads`

## Testing

### Test Environment
- **Base URL**: `http://localhost:3001/api/v1`
- **Test Database**: Separate test database with sample data
- **Authentication**: Use test JWT tokens

### Sample Test Data
```bash
# Create test lead
curl -X POST http://localhost:3001/api/v1/leads \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_lead.json

# Search leads
curl -X GET "http://localhost:3001/api/v1/leads/search?q=office" \
  -H "Authorization: Bearer test_token"
```

This API documentation provides a comprehensive foundation for implementing the Leads tab functionality with Node.js, covering all lead management, qualification, follow-up, conversion, and reporting capabilities needed for a robust lead management system.
