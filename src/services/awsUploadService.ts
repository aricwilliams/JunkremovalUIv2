import axios from 'axios';

// Types based on your API documentation
export interface MediaItem {
  id: number;
  business_id: number;
  original_name: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'video';
  duration: number;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  tags?: string[];
  is_public: boolean;
  metadata?: {
    width?: number;
    height?: number;
    resolution?: string;
    fps?: number;
    uploaded_by?: string;
    upload_type?: string;
    [key: string]: any;
  };
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    file_url: string;
    business?: any;
    logoUrl?: string;
  };
}

export interface GetUploadsResponse {
  success: boolean;
  data: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface UploadOptions {
  page?: number;
  limit?: number;
  tags?: string[];
  file_type?: 'image' | 'video';
  is_public?: boolean;
  search?: string;
  sort_by?: 'created_at' | 'file_size' | 'view_count' | 'download_count';
  sort_order?: 'asc' | 'desc';
}

// Get auth headers for API calls
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Upload a single file
export const uploadFile = async (
  file: File, 
  metadata?: any, 
  tags?: string[]
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    if (tags) {
      formData.append('tags', JSON.stringify(tags));
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to upload file'
    );
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (
  files: File[], 
  metadata?: any, 
  tags?: string[]
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    if (tags) {
      formData.append('tags', JSON.stringify(tags));
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads/multiple`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error uploading files:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to upload files'
    );
  }
};

// Upload logo specifically
export const uploadLogo = async (file: File): Promise<UploadResponse> => {
  return uploadFile(file, { upload_type: 'logo' }, ['logo']);
};

// Get user's media uploads
export const getUserMedia = async (options: UploadOptions = {}): Promise<GetUploadsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.tags) params.append('tags', options.tags.join(','));
    if (options.file_type) params.append('file_type', options.file_type);
    if (options.is_public !== undefined) params.append('is_public', options.is_public.toString());
    if (options.search) params.append('search', options.search);
    if (options.sort_by) params.append('sort_by', options.sort_by);
    if (options.sort_order) params.append('sort_order', options.sort_order);

    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads?${params.toString()}`,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching user media:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch user media'
    );
  }
};

// Delete media
export const deleteMedia = async (mediaId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads/${mediaId}`,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error deleting media:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to delete media'
    );
  }
};

// Get signed URL for viewing/downloading
export const getSignedUrl = async (mediaId: number): Promise<string> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads/${mediaId}/view`,
      { headers: getAuthHeaders() }
    );

    return response.data.signed_url || response.data.file_url;
  } catch (error: any) {
    console.error('Error getting signed URL:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to get signed URL'
    );
  }
};

// Get download URL
export const getDownloadUrl = async (mediaId: number): Promise<string> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads/${mediaId}/download`,
      { headers: getAuthHeaders() }
    );

    return response.data.download_url || response.data.file_url;
  } catch (error: any) {
    console.error('Error getting download URL:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to get download URL'
    );
  }
};

// Update media metadata
export const updateUpload = async (
  mediaId: number, 
  updates: { title?: string; description?: string; tags?: string[]; is_public?: boolean }
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads/${mediaId}`,
      updates,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error updating upload:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to update upload'
    );
  }
};

// Validate file before upload
export const validateFile = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, AVI, MOV, WMV, FLV)' };
  }

  return { valid: true };
};

// Default export for convenience
const awsUploadService = {
  uploadFile,
  uploadMultipleFiles,
  uploadLogo,
  getUserMedia,
  deleteMedia,
  getSignedUrl,
  getDownloadUrl,
  updateUpload,
  validateFile
};

export default awsUploadService;