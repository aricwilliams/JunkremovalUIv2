import axios from 'axios';
import { Job } from '../types';
import { coordinateService } from './coordinateService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Enhanced error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.response) {
    return new ApiError(
      error.response.data?.message || 'Request failed',
      error.response.status,
      error.response.data?.error
    );
  }

  if (error.request) {
    return new ApiError('Network error - please check your connection', 0);
  }

  return new ApiError(error.message || 'An unexpected error occurred', 0);
};

export interface JobsResponse {
  success: boolean;
  data: {
    jobs: Job[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
  timestamp: string;
}

export interface JobResponse {
  success: boolean;
  data: {
    job: Job;
  };
  timestamp: string;
}

export interface UpdateJobRequest {
  customer_id?: number;
  estimate_id?: number;
  assigned_employee_id?: number;
  title?: string;
  description?: string;
  scheduled_date?: string;
  completion_date?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  total_cost?: number;
}

export interface JobsQueryParams {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  customer_id?: number;
  employee_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort_by?: 'scheduled_date' | 'completion_date' | 'created_at' | 'total_cost' | 'status';
  sort_order?: 'asc' | 'desc';
}

export interface JobStats {
  total_jobs: number;
  scheduled_jobs: number;
  in_progress_jobs: number;
  completed_jobs: number;
  cancelled_jobs: number;
  total_revenue: number;
  average_job_value: number;
  jobs_today: number;
  scheduled_today: number;
}

export interface JobItem {
  id: number;
  job_id: number;
  name: string;
  category: string;
  quantity: number;
  base_price: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: number;
  created_at: string;
}

export interface JobNote {
  id: number;
  job_id: number;
  employee_id: number;
  note_type: 'general' | 'customer_communication' | 'internal' | 'issue' | 'resolution';
  content: string;
  is_important: boolean;
  created_at: string;
  employee_first_name?: string;
  employee_last_name?: string;
  employee_name?: string;
}

export interface JobPhoto {
  id: number;
  job_id: number;
  filename: string;
  file_path: string;
  uploaded_at: string;
}

export interface StatusHistoryEntry {
  id: number;
  job_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: number;
  notes: string;
  changed_at: string;
  employee_first_name?: string;
  employee_last_name?: string;
  employee_name?: string;
}

export interface DetailedJobResponse {
  success: boolean;
  data: {
    job: Job & {
      items?: JobItem[];
      photos?: JobPhoto[];
      notes?: JobNote[];
      status_history?: StatusHistoryEntry[];
    };
  };
  timestamp: string;
}

export interface JobStatsResponse {
  success: boolean;
  data: {
    stats: JobStats;
  };
  timestamp: string;
}

export interface StatusHistoryResponse {
  success: boolean;
  data: {
    status_history: StatusHistoryEntry[];
  };
  timestamp: string;
}

export interface JobItemResponse {
  success: boolean;
  data: {
    item: JobItem;
  };
  message: string;
  timestamp: string;
}

export interface JobNoteResponse {
  success: boolean;
  data: {
    note: JobNote;
  };
  message: string;
  timestamp: string;
}

export interface CreateJobItemRequest {
  name: string;
  category: string;
  quantity: number;
  base_price: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimated_time: number;
}

export interface UpdateJobItemRequest {
  name?: string;
  category?: string;
  quantity?: number;
  base_price?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimated_time?: number;
}

export interface CreateJobNoteRequest {
  note_type?: 'general' | 'customer_communication' | 'internal' | 'issue' | 'resolution';
  content: string;
  is_important?: boolean;
}

export interface UpdateJobNoteRequest {
  note_type?: 'general' | 'customer_communication' | 'internal' | 'issue' | 'resolution';
  content?: string;
  is_important?: boolean;
}

class JobsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('❌ No auth token found in localStorage');
      throw new Error('Authentication required. Please log in.');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getJobs(params?: JobsQueryParams): Promise<JobsResponse> {
    try {
      const url = `${API_BASE_URL}/api/v1/jobs`;
      const headers = this.getAuthHeaders();
      
      // Add timestamp to prevent caching
      const cacheBustParams = {
        ...params,
        _t: Date.now()
      };
      
      console.log('🔍 Jobs API Debug Info:');
      console.log('API URL:', url);
      console.log('Headers:', headers);
      console.log('Params:', cacheBustParams);
      
      const response = await axios.get(url, {
        headers,
        params: cacheBustParams
      });
      
      console.log('✅ Jobs API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Jobs API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw handleApiError(error);
    }
  }

  async getJob(id: number): Promise<JobResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/jobs/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job:', error);
      throw handleApiError(error);
    }
  }

  async updateJob(id: number, updates: UpdateJobRequest): Promise<JobResponse> {
    try {
      const url = `${API_BASE_URL}/api/v1/jobs/${id}`;
      const headers = this.getAuthHeaders();
      
      console.log('🔧 Update Job API Debug Info:');
      console.log('API URL:', url);
      console.log('Headers:', headers);
      console.log('Updates:', updates);
      
      const response = await axios.put(url, updates, { headers });
      
      console.log('✅ Update Job API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update Job API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw handleApiError(error);
    }
  }

  async createJob(jobData: Partial<Job>): Promise<JobResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/jobs`, jobData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      throw handleApiError(error);
    }
  }

  async deleteJob(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/jobs/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting job:', error);
      throw handleApiError(error);
    }
  }

  async getJobStats(): Promise<JobStatsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/jobs/stats`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job stats:', error);
      throw handleApiError(error);
    }
  }

  // Get detailed job with items, notes, photos, and status history
  async getDetailedJob(id: number): Promise<DetailedJobResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/jobs/${id}?_t=${Date.now()}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching detailed job:', error);
      throw handleApiError(error);
    }
  }

  // Get job status history
  async getJobStatusHistory(id: number): Promise<StatusHistoryResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/jobs/${id}/status-history`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job status history:', error);
      throw handleApiError(error);
    }
  }

  // Job Items Management
  async addJobItem(jobId: number, itemData: CreateJobItemRequest): Promise<JobItemResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/jobs/${jobId}/items`, itemData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding job item:', error);
      throw handleApiError(error);
    }
  }

  async updateJobItem(jobId: number, itemId: number, itemData: UpdateJobItemRequest): Promise<JobItemResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/jobs/${jobId}/items/${itemId}`, itemData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating job item:', error);
      throw handleApiError(error);
    }
  }

  async deleteJobItem(jobId: number, itemId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/jobs/${jobId}/items/${itemId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting job item:', error);
      throw handleApiError(error);
    }
  }

  // Job Notes Management
  async addJobNote(jobId: number, noteData: CreateJobNoteRequest): Promise<JobNoteResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/jobs/${jobId}/notes`, noteData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding job note:', error);
      throw handleApiError(error);
    }
  }

  async updateJobNote(jobId: number, noteId: number, noteData: UpdateJobNoteRequest): Promise<JobNoteResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/jobs/${jobId}/notes/${noteId}`, noteData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating job note:', error);
      throw handleApiError(error);
    }
  }

  async deleteJobNote(jobId: number, noteId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/jobs/${jobId}/notes/${noteId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting job note:', error);
      throw handleApiError(error);
    }
  }

  // Helper method to transform API job data to match legacy format for backward compatibility
  transformJobForLegacyComponents(job: Job): Job {
    return {
      ...job,
      // Map new fields to legacy fields for backward compatibility
      customerId: job.customer_id.toString(),
      customerName: job.customer?.name || 'Unknown Customer',
      customerPhone: job.customer?.phone || 'N/A',
      customerEmail: job.customer?.email || 'N/A',
      address: job.customer?.address || 'N/A',
      city: job.customer?.city || 'N/A',
      state: job.customer?.state || 'N/A',
      zipCode: job.customer?.zip_code || 'N/A',
      scheduledDate: new Date(job.scheduled_date),
      timeSlot: this.formatTimeSlot(job.scheduled_date),
      estimatedHours: this.calculateEstimatedHours(job),
      items: this.generateJobItems(job),
      totalEstimate: job.total_cost || 0,
      actualTotal: job.total_cost,
      notes: job.description || '',
      beforePhotos: [],
      afterPhotos: [],
      created: new Date(job.created_at),
      updated: new Date(job.updated_at),
      volume: {
        weight: 0,
        yardage: 0
      }
    };
  }

  // Enhanced method to get jobs with coordinates
  async getJobsWithCoordinates(params?: JobsQueryParams): Promise<JobsResponse> {
    try {
      // First get the jobs from the API
      const jobsResponse = await this.getJobs(params);
      
      // Transform jobs and add coordinates
      const jobsWithCoords = await Promise.all(
        jobsResponse.data.jobs.map(async (job) => {
          const transformedJob = this.transformJobForLegacyComponents(job);
          
          // Get coordinates if customer address is available
          if (job.customer?.address && job.customer?.city && job.customer?.state && job.customer?.zip_code) {
            const address = coordinateService.formatAddressForGeocoding(
              job.customer.address,
              job.customer.city,
              job.customer.state,
              job.customer.zip_code
            );
            
            const coordinates = await coordinateService.getLatLng(address);
            if (coordinates) {
              transformedJob.latitude = coordinates.lat;
              transformedJob.longitude = coordinates.lng;
            }
          }
          
          return transformedJob;
        })
      );

      return {
        ...jobsResponse,
        data: {
          ...jobsResponse.data,
          jobs: jobsWithCoords
        }
      };
    } catch (error: any) {
      console.error('Error fetching jobs with coordinates:', error);
      throw handleApiError(error);
    }
  }

  // Method to get coordinates for a specific job
  async getJobCoordinates(job: Job): Promise<{ lat: number; lng: number } | null> {
    if (job.customer?.address && job.customer?.city && job.customer?.state && job.customer?.zip_code) {
      const address = coordinateService.formatAddressForGeocoding(
        job.customer.address,
        job.customer.city,
        job.customer.state,
        job.customer.zip_code
      );
      
      return await coordinateService.getLatLng(address);
    }
    return null;
  }

  private formatTimeSlot(scheduledDate: string): string {
    const date = new Date(scheduledDate);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    // Create a 2-hour time slot
    const endHours = (hours + 2) % 24;
    const endDisplayHours = endHours % 12 || 12;
    const endAmpm = endHours >= 12 ? 'PM' : 'AM';
    
    return `${displayHours}:${displayMinutes} ${ampm} - ${endDisplayHours}:${displayMinutes} ${endAmpm}`;
  }

  private calculateEstimatedHours(job: Job): number {
    // Simple estimation based on total cost
    if (job.total_cost) {
      return Math.max(1, Math.ceil(job.total_cost / 50)); // Assume $50/hour
    }
    return 2; // Default 2 hours
  }

  private generateJobItems(job: Job): any[] {
    // Return empty array - items should come from API
    return [];
  }
}

export const jobsService = new JobsService();
