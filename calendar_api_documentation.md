# Calendar API Documentation

This document outlines the complete REST API endpoints needed to support the Calendar tab functionality in your junk removal management system. Built with Node.js, Express, and MySQL.

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

## Calendar Events Endpoints

### 1. Get Calendar Events

**GET** `/calendar/events`

Retrieve calendar events with optional filtering, date ranges, and pagination.

#### Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 50, max: 200)
- `date_from` (date): Filter events from this date
- `date_to` (date): Filter events to this date
- `event_type` (string): Filter by event type (job, meeting, maintenance, holiday, etc.)
- `customer_id` (string): Filter by customer ID
- `crew_id` (string): Filter by crew ID
- `status` (string): Filter by event status
- `view` (string): Calendar view type (day, week, month, agenda)
- `include_recurring` (boolean): Include recurring events (default: true)

#### Example Request
```bash
GET /api/v1/calendar/events?date_from=2024-01-01&date_to=2024-01-31&event_type=job&view=month
```

#### Example Response
```json
{
  "success": true,
  "message": "Calendar events retrieved successfully",
  "data": {
    "events": [
      {
        "id": "event-1",
        "title": "Office Cleanout - Downtown Complex",
        "description": "Complete office cleanout including furniture and electronics",
        "event_type": "job",
        "start_date": "2024-01-16",
        "start_time": "09:00:00",
        "end_date": "2024-01-16",
        "end_time": "17:00:00",
        "all_day": false,
        "location": "321 Commerce St, Wilmington, NC",
        "customer_id": "cust-1",
        "customer_name": "Downtown Office Complex",
        "crew_id": "crew-1",
        "crew_name": "Morning Crew",
        "status": "scheduled",
        "priority": "medium",
        "color": "#3B82F6",
        "is_recurring": false,
        "recurring_pattern": null,
        "created": "2024-01-15T10:30:00.000Z",
        "updated": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "pages": 1
    },
    "calendar_summary": {
      "total_events": 25,
      "jobs": 18,
      "meetings": 5,
      "maintenance": 2,
      "holidays": 0
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Event by ID

**GET** `/calendar/events/:id`

Retrieve a specific calendar event by its ID with all related information.

#### Path Parameters
- `id` (string): Event ID

#### Example Request
```bash
GET /api/v1/calendar/events/event-1
```

#### Example Response
```json
{
  "success": true,
  "message": "Calendar event retrieved successfully",
  "data": {
    "event": {
      "id": "event-1",
      "title": "Office Cleanout - Downtown Complex",
      "description": "Complete office cleanout including furniture and electronics",
      "event_type": "job",
      "start_date": "2024-01-16",
      "start_time": "09:00:00",
      "end_date": "2024-01-16",
      "end_time": "17:00:00",
      "all_day": false,
      "location": "321 Commerce St, Wilmington, NC",
      "customer_id": "cust-1",
      "customer_name": "Downtown Office Complex",
      "crew_id": "crew-1",
      "crew_name": "Morning Crew",
      "status": "scheduled",
      "priority": "medium",
      "color": "#3B82F6",
      "is_recurring": false,
      "recurring_pattern": null,
      "categories": [
        {
          "id": "cat-1",
          "name": "Office Cleanout",
          "color": "#3B82F6"
        }
      ],
      "attendees": [
        {
          "id": "attendee-1",
          "employee_id": "emp-1",
          "name": "John Driver",
          "role": "driver",
          "response": "accepted"
        }
      ],
      "reminders": [
        {
          "id": "reminder-1",
          "type": "email",
          "minutes_before": 60,
          "sent": false
        }
      ],
      "created": "2024-01-15T10:30:00.000Z",
      "updated": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Create Calendar Event

**POST** `/calendar/events`

Create a new calendar event with all required information.

#### Request Body
```json
{
  "title": "Weekly Office Pickup",
  "description": "Regular weekly pickup of office waste and recycling",
  "event_type": "job",
  "start_date": "2024-01-16",
  "start_time": "09:00:00",
  "end_date": "2024-01-16",
  "end_time": "11:00:00",
  "all_day": false,
  "location": "321 Commerce St, Wilmington, NC",
  "customer_id": "cust-1",
  "crew_id": "crew-1",
  "status": "scheduled",
  "priority": "medium",
  "color": "#3B82F6",
  "categories": ["cat-1"],
  "attendees": ["emp-1", "emp-2"],
  "reminders": [
    {
      "type": "email",
      "minutes_before": 60
    }
  ]
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Calendar event created successfully",
  "data": {
    "event_id": "event-2",
    "event": {
      "id": "event-2",
      "title": "Weekly Office Pickup",
      "event_type": "job",
      "start_date": "2024-01-16",
      "status": "scheduled",
      "created": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Calendar Event

**PUT** `/calendar/events/:id`

Update an existing calendar event by ID.

#### Path Parameters
- `id` (string): Event ID

#### Request Body
```json
{
  "title": "Updated Office Pickup",
  "start_time": "10:00:00",
  "end_time": "12:00:00",
  "description": "Updated description for the office pickup",
  "priority": "high"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Calendar event updated successfully",
  "data": {
    "event_id": "event-1",
    "updated_fields": ["title", "start_time", "end_time", "description", "priority"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Delete Calendar Event

**DELETE** `/calendar/events/:id`

Delete a calendar event by ID.

#### Path Parameters
- `id` (string): Event ID

#### Query Parameters
- `delete_recurring` (boolean): Delete all recurring instances (default: false)

#### Example Response
```json
{
  "success": true,
  "message": "Calendar event deleted successfully",
  "data": {
    "event_id": "event-1",
    "deleted_instances": 1
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Get Calendar View

**GET** `/calendar/view`

Get calendar events organized by view type (day, week, month, agenda).

#### Query Parameters
- `view` (string): View type - 'day', 'week', 'month', 'agenda' (required)
- `date` (date): Reference date for the view (default: today)
- `customer_id` (string): Filter by customer
- `crew_id` (string): Filter by crew
- `event_type` (string): Filter by event type

#### Example Request
```bash
GET /api/v1/calendar/view?view=week&date=2024-01-15
```

#### Example Response (Week View)
```json
{
  "success": true,
  "message": "Calendar week view retrieved successfully",
  "data": {
    "view_type": "week",
    "reference_date": "2024-01-15",
    "week_start": "2024-01-14",
    "week_end": "2024-01-20",
    "days": [
      {
        "date": "2024-01-15",
        "day_name": "Monday",
        "events": [
          {
            "id": "event-1",
            "title": "Office Cleanout",
            "start_time": "09:00",
            "end_time": "17:00",
            "event_type": "job",
            "color": "#3B82F6"
          }
        ]
      },
      {
        "date": "2024-01-16",
        "day_name": "Tuesday",
        "events": []
      }
    ],
    "summary": {
      "total_events": 5,
      "jobs": 4,
      "meetings": 1
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Recurring Events Endpoints

### 7. Create Recurring Event

**POST** `/calendar/events/recurring`

Create a recurring calendar event with pattern definition.

#### Request Body
```json
{
  "title": "Monthly Maintenance Check",
  "description": "Monthly truck and equipment maintenance",
  "event_type": "maintenance",
  "start_date": "2024-01-15",
  "start_time": "08:00:00",
  "end_time": "10:00:00",
  "recurring_pattern": {
    "frequency": "monthly",
    "interval": 1,
    "end_date": "2024-12-31",
    "weekday": null,
    "month_day": 15,
    "exceptions": ["2024-06-15", "2024-12-15"]
  },
  "location": "Maintenance Yard",
  "crew_id": "crew-3",
  "color": "#EF4444"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Recurring calendar event created successfully",
  "data": {
    "event_id": "event-3",
    "recurring_pattern_id": "pattern-1",
    "generated_instances": 12
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 8. Update Recurring Pattern

**PUT** `/calendar/events/:id/recurring`

Update the recurring pattern for an existing event.

#### Path Parameters
- `id` (string): Event ID

#### Request Body
```json
{
  "recurring_pattern": {
    "frequency": "weekly",
    "interval": 2,
    "end_date": "2024-06-30",
    "weekday": "monday",
    "exceptions": ["2024-04-15", "2024-05-20"]
  }
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Recurring pattern updated successfully",
  "data": {
    "event_id": "event-1",
    "updated_instances": 8,
    "deleted_instances": 4
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Event Categories Endpoints

### 9. Get Event Categories

**GET** `/calendar/categories`

Get all available event categories for calendar organization.

#### Example Response
```json
{
  "success": true,
  "message": "Event categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "cat-1",
        "name": "Office Cleanout",
        "description": "Office and commercial cleanout jobs",
        "color": "#3B82F6",
        "icon": "building",
        "is_default": false,
        "created": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "cat-2",
        "name": "Residential Pickup",
        "description": "Residential junk removal",
        "color": "#10B981",
        "icon": "home",
        "is_default": false,
        "created": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 10. Create Event Category

**POST** `/calendar/categories`

Create a new event category.

#### Request Body
```json
{
  "name": "Emergency Cleanup",
  "description": "Urgent and emergency cleanup jobs",
  "color": "#EF4444",
  "icon": "alert-triangle"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Event category created successfully",
  "data": {
    "category_id": "cat-3",
    "category": {
      "id": "cat-3",
      "name": "Emergency Cleanup",
      "color": "#EF4444",
      "created": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Event Attendees Endpoints

### 11. Add Event Attendee

**POST** `/calendar/events/:id/attendees`

Add an attendee to a calendar event.

#### Path Parameters
- `id` (string): Event ID

#### Request Body
```json
{
  "employee_id": "emp-3",
  "role": "helper",
  "notes": "Backup crew member"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Attendee added successfully",
  "data": {
    "attendee_id": "attendee-2",
    "event_id": "event-1",
    "employee_name": "Mike Helper",
    "role": "helper"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 12. Update Attendee Response

**PUT** `/calendar/events/:id/attendees/:attendeeId`

Update an attendee's response to an event invitation.

#### Path Parameters
- `id` (string): Event ID
- `attendeeId` (string): Attendee ID

#### Request Body
```json
{
  "response": "accepted",
  "notes": "Will arrive 15 minutes early"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Attendee response updated successfully",
  "data": {
    "attendee_id": "attendee-1",
    "response": "accepted",
    "notes": "Will arrive 15 minutes early"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Event Reminders Endpoints

### 13. Set Event Reminder

**POST** `/calendar/events/:id/reminders`

Set a reminder for a calendar event.

#### Path Parameters
- `id` (string): Event ID

#### Request Body
```json
{
  "type": "sms",
  "minutes_before": 30,
  "message": "Reminder: Office cleanout starts in 30 minutes"
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Event reminder set successfully",
  "data": {
    "reminder_id": "reminder-2",
    "event_id": "event-1",
    "type": "sms",
    "scheduled_for": "2024-01-16T08:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 14. Get Event Reminders

**GET** `/calendar/events/:id/reminders`

Get all reminders for a specific event.

#### Path Parameters
- `id` (string): Event ID

#### Example Response
```json
{
  "success": true,
  "message": "Event reminders retrieved successfully",
  "data": {
    "event_id": "event-1",
    "reminders": [
      {
        "id": "reminder-1",
        "type": "email",
        "minutes_before": 60,
        "message": "Reminder: Office cleanout tomorrow",
        "scheduled_for": "2024-01-15T08:00:00.000Z",
        "sent": false
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Calendar Availability Endpoints

### 15. Check Crew Availability

**GET** `/calendar/availability/crew`

Check crew availability for a specific date and time range.

#### Query Parameters
- `crew_id` (string): Crew ID to check
- `date` (date): Date to check availability
- `start_time` (time): Start time
- `end_time` (time): End time
- `exclude_event_id` (string): Event ID to exclude from conflict check

#### Example Request
```bash
GET /api/v1/calendar/availability/crew?crew_id=crew-1&date=2024-01-16&start_time=09:00&end_time=17:00
```

#### Example Response
```json
{
  "success": true,
  "message": "Crew availability checked successfully",
  "data": {
    "crew_id": "crew-1",
    "crew_name": "Morning Crew",
    "date": "2024-01-16",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "is_available": false,
    "conflicts": [
      {
        "event_id": "event-1",
        "title": "Office Cleanout",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "overlap_minutes": 480
      }
    ],
    "available_slots": [
      {
        "start_time": "17:00:00",
        "end_time": "21:00:00",
        "duration_minutes": 240
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 16. Get Working Hours

**GET** `/calendar/working-hours`

Get working hours configuration for the calendar system.

#### Example Response
```json
{
  "success": true,
  "message": "Working hours retrieved successfully",
  "data": {
    "working_hours": {
      "monday": {
        "start": "08:00:00",
        "end": "18:00:00",
        "is_working_day": true
      },
      "tuesday": {
        "start": "08:00:00",
        "end": "18:00:00",
        "is_working_day": true
      },
      "saturday": {
        "start": "09:00:00",
        "end": "16:00:00",
        "is_working_day": true
      },
      "sunday": {
        "start": null,
        "end": null,
        "is_working_day": false
      }
    },
    "timezone": "America/New_York",
    "business_hours": {
      "start": "08:00:00",
      "end": "18:00:00"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Calendar Holidays Endpoints

### 17. Get Calendar Holidays

**GET** `/calendar/holidays`

Get all holidays and non-working days for the calendar.

#### Query Parameters
- `year` (number): Year to get holidays for (default: current year)
- `include_company_holidays` (boolean): Include company-specific holidays (default: true)

#### Example Response
```json
{
  "success": true,
  "message": "Calendar holidays retrieved successfully",
  "data": {
    "year": 2024,
    "holidays": [
      {
        "id": "holiday-1",
        "name": "New Year's Day",
        "date": "2024-01-01",
        "type": "federal",
        "is_working_day": false
      },
      {
        "id": "holiday-2",
        "name": "Company Picnic",
        "date": "2024-07-15",
        "type": "company",
        "is_working_day": false
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 18. Add Company Holiday

**POST** `/calendar/holidays`

Add a company-specific holiday or non-working day.

#### Request Body
```json
{
  "name": "Team Building Day",
  "date": "2024-03-20",
  "description": "Annual team building and training day",
  "is_working_day": false
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Company holiday added successfully",
  "data": {
    "holiday_id": "holiday-3",
    "name": "Team Building Day",
    "date": "2024-03-20"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Calendar Reports Endpoints

### 19. Get Calendar Summary Report

**GET** `/calendar/reports/summary`

Get a summary report of calendar events for a specific period.

#### Query Parameters
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `crew_id` (string): Filter by crew
- `event_type` (string): Filter by event type
- `customer_id` (string): Filter by customer

#### Example Response
```json
{
  "success": true,
  "message": "Calendar summary report generated successfully",
  "data": {
    "report_period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "summary": {
      "total_events": 45,
      "total_hours": 180,
      "jobs": 35,
      "meetings": 8,
      "maintenance": 2
    },
    "events_by_crew": {
      "crew-1": 20,
      "crew-2": 15,
      "crew-3": 10
    },
    "events_by_category": {
      "Office Cleanout": 15,
      "Residential Pickup": 20,
      "Maintenance": 2,
      "Meetings": 8
    },
    "busiest_days": [
      {
        "date": "2024-01-16",
        "event_count": 5,
        "total_hours": 20
      }
    ]
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
- `EVENT_NOT_FOUND` - Event with specified ID not found
- `INVALID_DATE_RANGE` - Invalid date range for event
- `CREW_NOT_AVAILABLE` - Specified crew is not available at requested time
- `DUPLICATE_EVENT` - Event already exists for this time slot
- `INVALID_RECURRING_PATTERN` - Invalid recurring pattern configuration
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Calendar view endpoints**: 200 requests per minute per IP
- **Availability checking**: 50 requests per minute per IP

## Calendar Features

### **Event Management:**
- Full CRUD operations for calendar events
- Support for all-day and time-specific events
- Event categorization and color coding
- Location and description support

### **Recurring Events:**
- Daily, weekly, monthly, and yearly patterns
- Custom interval support
- Exception date handling
- Pattern modification and updates

### **Scheduling & Availability:**
- Crew availability checking
- Conflict detection and resolution
- Working hours configuration
- Holiday and non-working day management

### **Calendar Views:**
- Day, week, month, and agenda views
- Date-based filtering and navigation
- Event summary and statistics
- Responsive calendar layouts

### **Notifications & Reminders:**
- Email and SMS reminders
- Configurable reminder timing
- Multiple reminder types per event
- Reminder delivery tracking

### **Integration Features:**
- Customer and crew assignment
- Job status synchronization
- External calendar export
- Webhook support for real-time updates

## Webhook Support

Configure webhooks to receive real-time updates:
- Event creation and updates
- Attendee responses
- Reminder triggers
- Availability changes

Webhook endpoint: `POST /webhooks/calendar`

## Testing

### Test Environment
- **Base URL**: `http://localhost:3001/api/v1`
- **Test Database**: Separate test database with sample data
- **Authentication**: Use test JWT tokens

### Sample Test Data
```bash
# Create test calendar event
curl -X POST http://localhost:3001/api/v1/calendar/events \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d @test_calendar_event.json

# Get calendar week view
curl -X GET "http://localhost:3001/api/v1/calendar/view?view=week&date=2024-01-15" \
  -H "Authorization: Bearer test_token"
```

This API documentation provides a comprehensive foundation for implementing the Calendar tab functionality with Node.js, covering all event management, scheduling, recurring patterns, availability checking, and reporting capabilities needed for a robust calendar system.
