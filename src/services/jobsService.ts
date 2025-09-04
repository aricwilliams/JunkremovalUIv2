import axios from 'axios';
import { Job } from '../types';

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
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_employee_id?: number;
  total_cost?: number;
  completion_date?: string;
  description?: string;
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

class JobsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getJobs(params?: JobsQueryParams): Promise<JobsResponse> {
    try {
      const url = `${API_BASE_URL}/api/v1/jobs`;
      const headers = this.getAuthHeaders();
      
      console.log('🔍 Jobs API Debug Info:');
      console.log('API URL:', url);
      console.log('Headers:', headers);
      console.log('Params:', params);
      
      const response = await axios.get(url, {
        headers,
        params
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
      const response = await axios.put(`${API_BASE_URL}/api/v1/jobs/${id}`, updates, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating job:', error);
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

  async getJobStats(): Promise<{ success: boolean; data: { stats: JobStats } }> {
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
    // Generate mock job items based on job data
    const items = [];
    if (job.description) {
      // Try to extract items from description
      const description = job.description.toLowerCase();
      if (description.includes('couch') || description.includes('sofa')) {
        items.push({
          id: '1',
          name: 'Couch',
          category: 'furniture',
          quantity: 1,
          basePrice: 50,
          difficulty: 'medium',
          estimatedTime: 30
        });
      }
      if (description.includes('mattress')) {
        items.push({
          id: '2',
          name: 'Mattress',
          category: 'furniture',
          quantity: 1,
          basePrice: 35,
          difficulty: 'easy',
          estimatedTime: 15
        });
      }
      if (description.includes('refrigerator') || description.includes('fridge')) {
        items.push({
          id: '3',
          name: 'Refrigerator',
          category: 'appliances',
          quantity: 1,
          basePrice: 75,
          difficulty: 'hard',
          estimatedTime: 45
        });
      }
    }
    
    // If no items found, create a generic item
    if (items.length === 0) {
      items.push({
        id: '1',
        name: 'General Cleanout',
        category: 'misc',
        quantity: 1,
        basePrice: job.total_cost || 100,
        difficulty: 'medium',
        estimatedTime: 60
      });
    }
    
    return items;
  }
}

export const jobsService = new JobsService();
