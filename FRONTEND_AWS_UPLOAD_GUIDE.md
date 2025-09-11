# Frontend AWS S3 Upload System - Implementation Guide

This guide documents the complete frontend implementation for uploading images and videos to AWS S3, including all the React components and services you can use in your application.

## Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Core Services](#core-services)
4. [React Components](#react-components)
5. [Integration Examples](#integration-examples)
6. [API Integration](#api-integration)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Overview

The frontend AWS upload system provides a complete solution for handling file uploads to AWS S3 with the following features:

- **Drag & Drop Upload**: Intuitive file selection with drag and drop support
- **Progress Tracking**: Real-time upload progress with visual indicators
- **File Validation**: Client-side validation for file types and sizes
- **Media Gallery**: Display and manage uploaded images and videos
- **Thumbnail Generation**: Automatic thumbnail creation for videos
- **Signed URLs**: Secure access to private files
- **Batch Operations**: Upload and download multiple files
- **Error Handling**: Comprehensive error management and user feedback

## Installation & Setup

### 1. Required Dependencies

The system uses these existing dependencies (already in your project):
- React 18+
- TypeScript
- Axios for HTTP requests
- Lucide React for icons
- Tailwind CSS for styling

### 2. Environment Configuration

Add these environment variables to your `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Optional: For direct S3 uploads (if implemented)
VITE_AWS_REGION=us-east-1
VITE_AWS_S3_BUCKET=your-bucket-name
```

## Core Services

### AWS Upload Service (`src/services/awsUploadService.ts`)

The main service that handles all AWS S3 upload operations:

```typescript
import { awsUploadService } from '../services/awsUploadService';

// Upload a single file
const response = await awsUploadService.uploadFile(file, {
  title: 'My Upload',
  description: 'File description',
  isPublic: false,
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
});

// Upload multiple files
const responses = await awsUploadService.uploadMultipleFiles(files, options);

// Get signed URL for private files
const signedUrl = await awsUploadService.getSignedUrl(filePath, 3600);

// Validate file before upload
const validation = awsUploadService.validateFile(file, 50); // 50MB limit
```

#### Key Methods:

- `uploadFile(file, options)` - Upload single file
- `uploadMultipleFiles(files, options)` - Upload multiple files
- `uploadJobPhoto(jobId, file, photoType, caption)` - Upload job photos
- `uploadLogo(file)` - Upload business logo
- `getSignedUrl(filePath, expiresIn)` - Get signed URL for private access
- `getUserMedia(page, limit, fileType)` - Get user's uploaded media
- `getJobPhotos(jobId)` - Get job photos
- `deleteMedia(mediaId)` - Delete media file
- `validateFile(file, maxSizeMB)` - Validate file before upload

## React Components

### 1. FileUpload Component (`src/components/Common/FileUpload.tsx`)

A comprehensive file upload component with drag & drop support:

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
    isPublic: false
  }}
  showPreview={true}
  disabled={false}
/>
```

#### Props:

- `onUploadComplete` - Callback when upload completes
- `onUploadError` - Callback when upload fails
- `accept` - File types to accept (default: "image/*,video/*")
- `maxSizeMB` - Maximum file size in MB (default: 50)
- `multiple` - Allow multiple file selection (default: false)
- `uploadOptions` - Upload configuration options
- `showPreview` - Show file previews (default: true)
- `disabled` - Disable upload functionality (default: false)

### 2. MediaGallery Component (`src/components/Common/MediaGallery.tsx`)

Display and manage uploaded media files:

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

#### Props:

- `mediaItems` - Array of media items to display
- `onDelete` - Callback when media is deleted
- `onToggleVisibility` - Callback when visibility is toggled
- `showActions` - Show action buttons (default: true)
- `gridCols` - Number of grid columns (2-6, default: 4)

### 3. JobPhotoUpload Component (`src/components/Jobs/JobPhotoUpload.tsx`)

Specialized component for uploading job photos (before/after):

```tsx
import JobPhotoUpload from '../components/Jobs/JobPhotoUpload';

<JobPhotoUpload
  jobId={job.id}
  onPhotosUpdated={(photos) => {
    console.log('Photos updated:', photos);
  }}
/>
```

#### Props:

- `jobId` - ID of the job to upload photos for
- `onPhotosUpdated` - Callback when photos are updated

## Integration Examples

### 1. Basic File Upload

```tsx
import React, { useState } from 'react';
import FileUpload from '../components/Common/FileUpload';
import { awsUploadService } from '../services/awsUploadService';

const BasicUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (response) => {
    setUploadedFiles(prev => [...prev, response.data]);
  };

  const handleUploadError = (error) => {
    console.error('Upload failed:', error);
  };

  return (
    <div>
      <h2>Upload Files</h2>
      <FileUpload
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        accept="image/*,video/*"
        maxSizeMB={50}
        multiple={true}
      />
      
      {uploadedFiles.length > 0 && (
        <div>
          <h3>Uploaded Files:</h3>
          {uploadedFiles.map(file => (
            <div key={file.id}>
              <p>{file.file_url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 2. Media Gallery with Management

```tsx
import React, { useState, useEffect } from 'react';
import MediaGallery from '../components/Common/MediaGallery';
import { awsUploadService, MediaItem } from '../services/awsUploadService';

const MediaManager: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await awsUploadService.getUserMedia(1, 50);
      setMediaItems(response.media);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await awsUploadService.deleteMedia(mediaId);
      setMediaItems(prev => prev.filter(item => item.id !== mediaId));
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  return (
    <div>
      <h2>Media Gallery</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <MediaGallery
          mediaItems={mediaItems}
          onDelete={handleDelete}
          showActions={true}
          gridCols={4}
        />
      )}
    </div>
  );
};
```

### 3. Job Photo Management

```tsx
import React from 'react';
import JobPhotoUpload from '../components/Jobs/JobPhotoUpload';

const JobDetails: React.FC = ({ job }) => {
  const handlePhotosUpdated = (photos) => {
    console.log('Job photos updated:', photos);
    // Update job state or trigger refresh
  };

  return (
    <div>
      <h2>Job Details</h2>
      <div>
        <h3>Job Photos</h3>
        <JobPhotoUpload
          jobId={job.id}
          onPhotosUpdated={handlePhotosUpdated}
        />
      </div>
    </div>
  );
};
```

### 4. Business Logo Upload

```tsx
import React, { useState } from 'react';
import { awsUploadService } from '../services/awsUploadService';

const LogoUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const response = await awsUploadService.uploadLogo(file);
      console.log('Logo uploaded:', response);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3>Business Logo</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};
```

## API Integration

### Required API Endpoints

Your backend API should implement these endpoints:

#### 1. File Upload Endpoints

```javascript
// Single file upload
POST /api/v1/upload/file
Content-Type: multipart/form-data
Authorization: Bearer <token>

// Job photo upload
POST /api/v1/jobs/:jobId/photos
Content-Type: multipart/form-data
Authorization: Bearer <token>

// Logo upload
POST /api/v1/auth/upload-logo
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

#### 2. Media Management Endpoints

```javascript
// Get user media
GET /api/v1/media/user?page=1&limit=20&file_type=image
Authorization: Bearer <token>

// Get job photos
GET /api/v1/jobs/:jobId/photos
Authorization: Bearer <token>

// Get signed URL
GET /api/v1/media/signed-url?file_path=path&expires_in=3600
Authorization: Bearer <token>

// Delete media
DELETE /api/v1/media/:mediaId
Authorization: Bearer <token>
```

### Response Formats

#### Upload Response:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "media_123",
    "file_path": "uploads/file_123.jpg",
    "file_url": "https://bucket.s3.amazonaws.com/uploads/file_123.jpg",
    "file_size": 1024000,
    "file_type": "image",
    "thumbnail_url": "https://bucket.s3.amazonaws.com/thumbnails/file_123_thumb.jpg",
    "duration": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Media List Response:
```json
{
  "media": [
    {
      "id": "media_123",
      "file_path": "uploads/file_123.jpg",
      "file_url": "https://bucket.s3.amazonaws.com/uploads/file_123.jpg",
      "file_size": 1024000,
      "file_type": "image",
      "thumbnail_url": "https://bucket.s3.amazonaws.com/thumbnails/file_123_thumb.jpg",
      "caption": "My photo",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "has_more": false
  }
}
```

## Error Handling

### Common Error Scenarios

1. **File Validation Errors**:
   - Invalid file type
   - File too large
   - No file selected

2. **Upload Errors**:
   - Network connectivity issues
   - AWS S3 service errors
   - Authentication failures

3. **API Errors**:
   - Server errors (500)
   - Authentication errors (401)
   - Validation errors (400)

### Error Handling Example

```tsx
const handleUpload = async (file: File) => {
  try {
    // Validate file first
    const validation = awsUploadService.validateFile(file, 50);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload with progress tracking
    const response = await awsUploadService.uploadFile(file, {
      onProgress: (progress) => {
        setUploadProgress(progress.percentage);
      }
    });

    console.log('Upload successful:', response);
  } catch (error: any) {
    // Handle different error types
    if (error.message.includes('network')) {
      setError('Network error. Please check your connection.');
    } else if (error.message.includes('size')) {
      setError('File is too large. Maximum size is 50MB.');
    } else if (error.message.includes('type')) {
      setError('Invalid file type. Please select an image or video.');
    } else {
      setError(error.message || 'Upload failed. Please try again.');
    }
  }
};
```

## Best Practices

### 1. File Validation

Always validate files on the client side before upload:

```tsx
const validateFile = (file: File) => {
  const validation = awsUploadService.validateFile(file, 50);
  if (!validation.valid) {
    setError(validation.error);
    return false;
  }
  return true;
};
```

### 2. Progress Feedback

Provide visual feedback during uploads:

```tsx
const [uploadProgress, setUploadProgress] = useState(0);

<FileUpload
  onUploadComplete={handleComplete}
  onUploadError={handleError}
  uploadOptions={{
    onProgress: (progress) => setUploadProgress(progress.percentage)
  }}
/>

{uploadProgress > 0 && uploadProgress < 100 && (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${uploadProgress}%` }}
    />
  </div>
)}
```

### 3. Error Recovery

Implement retry mechanisms for failed uploads:

```tsx
const [retryCount, setRetryCount] = useState(0);
const MAX_RETRIES = 3;

const handleUploadWithRetry = async (file: File) => {
  try {
    await awsUploadService.uploadFile(file);
    setRetryCount(0); // Reset on success
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => handleUploadWithRetry(file), 1000 * retryCount);
    } else {
      setError('Upload failed after multiple attempts');
    }
  }
};
```

### 4. Memory Management

Clean up object URLs to prevent memory leaks:

```tsx
useEffect(() => {
  return () => {
    // Clean up object URLs when component unmounts
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  };
}, [files]);
```

### 5. Responsive Design

Ensure components work well on all screen sizes:

```tsx
<MediaGallery
  gridCols={window.innerWidth < 768 ? 2 : 4}
  className="p-4 md:p-6"
/>
```

## Complete Example

See `src/components/Examples/AWSUploadExample.tsx` for a complete working example that demonstrates all the features of the AWS upload system.

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

This frontend implementation provides a complete, production-ready solution for AWS S3 file uploads with a modern React interface. All components are fully typed with TypeScript and include comprehensive error handling and user feedback.
