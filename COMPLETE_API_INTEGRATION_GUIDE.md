# Complete API Integration Guide

This guide provides comprehensive documentation for integrating with both the AWS S3 Upload API and the Notifications API in your frontend application.

## Table of Contents

1. [Overview](#overview)
2. [AWS S3 Upload System](#aws-s3-upload-system)
3. [Notifications System](#notifications-system)
4. [Component Integration](#component-integration)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## Overview

Your application now has two main API systems:

1. **AWS S3 Upload System** (`/api/v1/uploads`) - For managing file uploads (images, videos, documents)
2. **Notifications System** (`/api/v1/notifications`) - For managing Google review links

Both systems are fully integrated with React components and TypeScript services.

## AWS S3 Upload System

### Service: `awsUploadService`

Located at `src/services/awsUploadService.ts`, this service provides comprehensive file upload functionality.

#### Key Features:
- Single and multiple file uploads
- Progress tracking
- File validation
- Search and filtering
- Statistics and analytics
- CRUD operations

#### Basic Usage:

```typescript
import { awsUploadService } from '../services/awsUploadService';

// Upload a single file
const response = await awsUploadService.uploadFile(file, {
  title: 'My Upload',
  description: 'File description',
  tags: ['tag1', 'tag2'],
  isPublic: false,
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
});

// Upload multiple files
const result = await awsUploadService.uploadMultipleFiles(files, {
  title: 'Batch Upload',
  tags: ['batch']
});

// Get user's media
const media = await awsUploadService.getUserMedia({
  page: 1,
  limit: 20,
  file_type: 'image',
  sort_field: 'created_at',
  sort_order: 'DESC'
});

// Search uploads
const searchResults = await awsUploadService.searchUploads('logo', {
  file_type: 'image'
});
```

#### Available Methods:

| Method | Description | Parameters |
|--------|-------------|------------|
| `uploadFile(file, options)` | Upload single file | File, UploadOptions |
| `uploadMultipleFiles(files, options)` | Upload multiple files | File[], UploadOptions |
| `uploadJobPhoto(jobId, file, photoType, caption)` | Upload job photo | string, File, 'before'\|'after', string? |
| `uploadLogo(file)` | Upload business logo | File |
| `getUserMedia(options)` | Get user's uploads | GetUploadsOptions |
| `getJobPhotos(jobId)` | Get job photos | string |
| `searchUploads(query, options)` | Search uploads | string, GetUploadsOptions |
| `getUploadById(id)` | Get specific upload | number |
| `updateUpload(id, updates)` | Update upload metadata | number, object |
| `deleteMedia(id)` | Delete upload | number |
| `getUploadStats(startDate?, endDate?)` | Get upload statistics | string?, string? |
| `getRecentUploads(limit)` | Get recent uploads | number |
| `viewUpload(id)` | View upload (increment count) | number |
| `getDownloadUrl(id)` | Get download URL | number |

### Components

#### 1. FileUpload Component

```tsx
import FileUpload from '../components/Common/FileUpload';

<FileUpload
  onUploadComplete={(response) => {
    console.log('Upload completed:', response);
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
  }}
  accept="image/*,video/*"
  maxSizeMB={50}
  multiple={true}
  uploadOptions={{
    title: 'My Upload',
    description: 'File description',
    tags: ['tag1', 'tag2'],
    isPublic: false
  }}
  showPreview={true}
  disabled={false}
/>
```

#### 2. MediaGallery Component

```tsx
import MediaGallery from '../components/Common/MediaGallery';

<MediaGallery
  mediaItems={mediaItems}
  onDelete={(mediaId) => {
    // Handle media deletion
  }}
  onToggleVisibility={(mediaId, isPublic) => {
    // Handle visibility toggle
  }}
  showActions={true}
  gridCols={4}
/>
```

#### 3. JobPhotoUpload Component

```tsx
import JobPhotoUpload from '../components/Jobs/JobPhotoUpload';

<JobPhotoUpload
  jobId={job.id}
  onPhotosUpdated={(photos) => {
    console.log('Photos updated:', photos);
  }}
/>
```

## Notifications System

### Service: `notificationsService`

Located at `src/services/notificationsService.ts`, this service manages Google review links.

#### Key Features:
- Create and manage Google review links
- Link validation
- Statistics tracking
- CRUD operations

#### Basic Usage:

```typescript
import { notificationsService } from '../services/notificationsService';

// Create a notification with Google review link
const notification = await notificationsService.createNotification(
  'https://www.google.com/maps/place/Your+Business/reviews'
);

// Get all notifications
const notifications = await notificationsService.getNotifications({
  limit: 50,
  offset: 0,
  sort: 'created_at',
  order: 'DESC'
});

// Get notification statistics
const stats = await notificationsService.getNotificationStats();

// Update a notification
const updated = await notificationsService.updateNotification(
  notificationId,
  'https://new-google-review-link.com'
);

// Delete a notification
await notificationsService.deleteNotification(notificationId);
```

#### Available Methods:

| Method | Description | Parameters |
|--------|-------------|------------|
| `createNotification(googleReviewLink)` | Create notification | string |
| `getNotifications(options)` | Get all notifications | GetNotificationsOptions |
| `getNotificationById(id)` | Get specific notification | number |
| `updateNotification(id, googleReviewLink?)` | Update notification | number, string? |
| `deleteNotification(id)` | Delete notification | number |
| `getNotificationStats()` | Get statistics | none |
| `validateGoogleReviewLink(url)` | Validate Google URL | string |
| `extractBusinessNameFromLink(url)` | Extract business name | string |
| `generateGoogleReviewLink(name, address)` | Generate review link | string, string |

### Component

#### NotificationsManager Component

```tsx
import NotificationsManager from '../components/Common/NotificationsManager';

<NotificationsManager />
```

## Component Integration

### 1. Settings Page Integration

The Settings page now uses the AWS upload service for logo uploads:

```tsx
// In SettingsView.tsx
const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file using AWS upload service
  const validation = awsUploadService.validateFile(file, 5); // 5MB limit
  if (!validation.valid) {
    setError(validation.error || 'Invalid file');
    return;
  }

  try {
    // Use AWS upload service for logo upload
    const response = await awsUploadService.uploadLogo(file);
    // Handle success...
  } catch (error: any) {
    setError(error.message);
  }
};
```

### 2. Job Management Integration

Job details now include photo upload functionality:

```tsx
// In JobDetailsModal.tsx
<JobPhotoUpload 
  jobId={job.id} 
  onPhotosUpdated={(photos) => {
    // Update job with new photos if needed
    console.log('Photos updated:', photos);
  }}
/>
```

### 3. Complete Example Component

The `AWSUploadExample` component demonstrates all features:

```tsx
import AWSUploadExample from '../components/Examples/AWSUploadExample';

// Use in your app
<AWSUploadExample />
```

## API Endpoints Reference

### Upload Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/uploads` | Upload single file |
| POST | `/api/v1/uploads/multiple` | Upload multiple files |
| GET | `/api/v1/uploads` | Get user's uploads |
| GET | `/api/v1/uploads/public` | Get public uploads |
| GET | `/api/v1/uploads/recent` | Get recent uploads |
| GET | `/api/v1/uploads/stats` | Get upload statistics |
| GET | `/api/v1/uploads/search` | Search uploads |
| GET | `/api/v1/uploads/:id` | Get upload by ID |
| PUT | `/api/v1/uploads/:id` | Update upload |
| DELETE | `/api/v1/uploads/:id` | Delete upload |
| GET | `/api/v1/uploads/:id/view` | View upload |
| GET | `/api/v1/uploads/:id/download` | Get download URL |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/notifications` | Create notification |
| GET | `/api/v1/notifications` | Get all notifications |
| GET | `/api/v1/notifications/stats` | Get notification statistics |
| GET | `/api/v1/notifications/:id` | Get notification by ID |
| PUT | `/api/v1/notifications/:id` | Update notification |
| DELETE | `/api/v1/notifications/:id` | Delete notification |

## Error Handling

### Common Error Scenarios

1. **Authentication Errors (401/403)**
   ```typescript
   try {
     await awsUploadService.uploadFile(file);
   } catch (error: any) {
     if (error.response?.status === 401) {
       // Redirect to login
       window.location.href = '/login';
     }
   }
   ```

2. **File Validation Errors (400)**
   ```typescript
   const validation = awsUploadService.validateFile(file, 50);
   if (!validation.valid) {
     setError(validation.error);
     return;
   }
   ```

3. **Network Errors**
   ```typescript
   try {
     await awsUploadService.uploadFile(file);
   } catch (error: any) {
     if (error.code === 'NETWORK_ERROR') {
       setError('Network error. Please check your connection.');
     }
   }
   ```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "errors": [
    {
      "field": "field_name",
      "message": "Field-specific error message",
      "value": "invalid_value"
    }
  ]
}
```

## Best Practices

### 1. File Upload Best Practices

```typescript
// Always validate files before upload
const validateAndUpload = async (file: File) => {
  const validation = awsUploadService.validateFile(file, 50);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Show progress to user
  const response = await awsUploadService.uploadFile(file, {
    onProgress: (progress) => {
      setUploadProgress(progress.percentage);
    }
  });

  return response;
};
```

### 2. Error Handling Best Practices

```typescript
const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await awsUploadService.uploadFile(file);
    
    // Success handling
    setSuccess('File uploaded successfully!');
    onUploadComplete?.(response);
    
  } catch (error: any) {
    // Error handling
    const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
    setError(errorMessage);
    
    // Log for debugging
    console.error('Upload error:', error);
    
  } finally {
    setLoading(false);
  }
};
```

### 3. Memory Management

```typescript
// Clean up object URLs to prevent memory leaks
useEffect(() => {
  return () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  };
}, [files]);
```

### 4. Performance Optimization

```typescript
// Use pagination for large datasets
const loadMedia = async (page: number = 1) => {
  const response = await awsUploadService.getUserMedia({
    page,
    limit: 20,
    sort_field: 'created_at',
    sort_order: 'DESC'
  });
  
  setMediaItems(response.data);
  setPagination(response.pagination);
};
```

### 5. Security Considerations

```typescript
// Always validate user input
const validateGoogleLink = (url: string) => {
  const validation = notificationsService.validateGoogleReviewLink(url);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  return true;
};

// Sanitize file names
const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};
```

## Environment Configuration

### Required Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Optional: For direct S3 uploads (if implemented)
VITE_AWS_REGION=us-east-1
VITE_AWS_S3_BUCKET=your-bucket-name
```

## Testing

### Unit Testing Example

```typescript
import { awsUploadService } from '../services/awsUploadService';

describe('AWS Upload Service', () => {
  test('should validate file correctly', () => {
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const validation = awsUploadService.validateFile(validFile, 5);
    expect(validation.valid).toBe(true);
  });

  test('should reject invalid file types', () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const validation = awsUploadService.validateFile(invalidFile, 5);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('image or video');
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API server has proper CORS configuration
2. **Authentication Errors**: Check that JWT tokens are properly set in localStorage
3. **File Size Limits**: Verify both client and server file size limits match
4. **AWS Configuration**: Ensure AWS credentials and bucket permissions are correct

### Debug Mode

Enable debug logging by adding this to your service:

```typescript
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

if (DEBUG) {
  console.log('Upload request:', { file, options });
}
```

This comprehensive integration provides a complete file upload and notification management system with modern React components, TypeScript services, and robust error handling. All components are production-ready and include comprehensive documentation and examples.
