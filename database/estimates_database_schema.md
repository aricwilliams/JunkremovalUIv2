# Estimates Database Schema Documentation

## Overview
This document describes the MySQL database schema for storing estimate request data from the client form. The schema is designed to capture all the information provided in the estimate request form.

## Main Table: `estimates`

### Client Information Fields
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| New Client / Existing Client | `is_new_client` | BOOLEAN | TRUE for new clients, FALSE for existing |
| Existing Client ID | `existing_client_id` | INT | References customers table if existing client |

### Basic Contact Information
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| Full Name * | `full_name` | VARCHAR(255) | Client's full name (required) |
| Phone Number * | `phone_number` | VARCHAR(20) | Client's phone number (required) |
| Email Address * | `email_address` | VARCHAR(255) | Client's email address (required) |
| OK to text me updates | `ok_to_text` | BOOLEAN | Permission to send text updates |

### Service Address
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| Service Address * | `service_address` | TEXT | Street address where junk removal will occur |
| Gate Code (if applicable) | `gate_code` | VARCHAR(100) | Gate code for access |
| Apartment/Unit Number | `apartment_unit` | VARCHAR(50) | Apartment or unit number |

### Project Details
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| Preferred Date | `preferred_date` | DATE | Client's preferred date (mm/dd/yyyy) |
| Preferred Time | `preferred_time` | VARCHAR(50) | Client's preferred time slot |
| Location on Property * | `location_on_property` | VARCHAR(100) | Where on property (garage, basement, etc.) |
| Approximate Volume | `approximate_volume` | VARCHAR(100) | Estimated volume (small, medium, large) |
| Access Considerations | `access_considerations` | TEXT | Stairs, elevator, narrow hallways, etc. |

### Photos & Media Upload
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| Upload Photos | `photos` | JSON | Array of photo file paths/URLs |
| Upload Videos (Optional) | `videos` | JSON | Array of video file paths/URLs |

### Item Type & Condition
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| Material Types | `material_types` | JSON | Array of selected materials (Wood, Metal, Electronics, etc.) |
| Approximate Item Count | `approximate_item_count` | VARCHAR(255) | e.g., "10-15 items, mixed pile" |
| Items filled with water | `items_filled_water` | BOOLEAN | Water-filled items present |
| Items filled with oil/fuel | `items_filled_oil_fuel` | BOOLEAN | Oil/fuel-filled items present |
| Hazardous materials present | `hazardous_materials` | BOOLEAN | Hazardous materials present |
| Items tied in bags | `items_tied_bags` | BOOLEAN | Items are tied in bags |
| Oversized items | `oversized_items` | BOOLEAN | Hot tubs, pianos, etc. present |

### Safety & Hazards
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| Mold present | `mold_present` | BOOLEAN | Mold is present |
| Pests present | `pests_present` | BOOLEAN | Pests are present |
| Sharp objects present | `sharp_objects` | BOOLEAN | Sharp objects present |
| Heavy lifting required (100+ lbs) | `heavy_lifting_required` | BOOLEAN | Heavy lifting required |
| Disassembly required | `disassembly_required` | BOOLEAN | Disassembly required |

### Additional Information & Services
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| Additional Notes | `additional_notes` | TEXT | Anything else about the project |
| Request donation pickup for good items | `request_donation_pickup` | BOOLEAN | Donation pickup requested |
| Request demolition add-on | `request_demolition_addon` | BOOLEAN | Demolition add-on requested |

### Follow-up & Priority
| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| How did you hear about us? | `how_did_you_hear` | VARCHAR(255) | Marketing source |
| Request Priority | `request_priority` | ENUM | 'standard', 'urgent', 'low' |

### System Fields
| Database Column | Type | Description |
|----------------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `status` | ENUM | 'pending', 'reviewed', 'quoted', 'accepted', 'declined', 'expired' |
| `quote_amount` | DECIMAL(10,2) | Final quote amount |
| `quote_notes` | TEXT | Internal notes about the quote |
| `created_at` | TIMESTAMP | When estimate was created |
| `updated_at` | TIMESTAMP | When estimate was last updated |

## Related Tables

### `estimate_media`
Stores individual photo and video files associated with estimates.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `estimate_id` | INT | Foreign key to estimates table |
| `file_type` | ENUM | 'photo' or 'video' |
| `file_path` | VARCHAR(500) | Path to the file |
| `file_name` | VARCHAR(255) | Original filename |
| `file_size` | INT | File size in bytes |
| `uploaded_at` | TIMESTAMP | When file was uploaded |

### `estimate_status_history`
Tracks status changes for estimates.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `estimate_id` | INT | Foreign key to estimates table |
| `old_status` | ENUM | Previous status |
| `new_status` | ENUM | New status |
| `changed_by` | INT | Employee who made the change |
| `notes` | TEXT | Notes about the status change |
| `changed_at` | TIMESTAMP | When status was changed |

## Material Types Options
The `material_types` JSON field can contain any combination of:
- Wood
- Metal
- Electronics
- Furniture
- Appliances
- Yard Debris
- Construction Waste
- Clothing
- Books
- Mixed

## Status Workflow
1. **pending** - Initial status when estimate is submitted
2. **reviewed** - Estimate has been reviewed by staff
3. **quoted** - Quote has been generated and sent to client
4. **accepted** - Client has accepted the quote
5. **declined** - Client has declined the quote
6. **expired** - Quote has expired

## Indexes
- `idx_status` - For filtering by status
- `idx_created_at` - For sorting by creation date
- `idx_email` - For looking up by email
- `idx_phone` - For looking up by phone
- `idx_existing_client` - For existing client lookups

## Sample Data
The schema includes a sample INSERT statement showing how to populate the table with realistic data.

## Usage Notes
- All required fields from the form are marked as NOT NULL
- JSON fields are used for arrays (material_types, photos, videos)
- Boolean fields default to FALSE for safety
- Timestamps are automatically managed
- Foreign key constraints ensure data integrity
