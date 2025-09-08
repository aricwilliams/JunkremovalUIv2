import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Estimate interfaces based on the API documentation
export interface EstimateRequest {
  id: number;
  is_new_client: boolean;
  existing_client_id?: number;
  full_name: string;
  phone_number: string;
  email_address: string;
  ok_to_text: boolean;
  service_address: string;
  gate_code?: string;
  apartment_unit?: string;
  preferred_date?: string;
  preferred_time?: string;
  location_on_property: string;
  approximate_volume: string;
  access_considerations?: string;
  photos?: string[];
  videos?: string[];
  material_types: string[];
  approximate_item_count?: string;
  items_filled_water: boolean;
  items_filled_oil_fuel: boolean;
  hazardous_materials: boolean;
  items_tied_bags: boolean;
  oversized_items: boolean;
  mold_present: boolean;
  pests_present: boolean;
  sharp_objects: boolean;
  heavy_lifting_required: boolean;
  disassembly_required: boolean;
  additional_notes?: string;
  request_donation_pickup: boolean;
  request_demolition_addon: boolean;
  how_did_you_hear?: string;
  request_priority: 'low' | 'standard' | 'high' | 'urgent';
  status: 'pending' | 'quoted' | 'scheduled' | 'completed' | 'cancelled';
  quote_amount?: number;
  quote_notes?: string;
  created_at: string;
  updated_at: string;
  existing_customer_name?: string;
  existing_customer_email?: string;
  existing_customer_phone?: string;
  existing_customer_address?: string;
  existing_customer_city?: string;
  existing_customer_state?: string;
  existing_customer_zip_code?: string;
}

export interface EstimatesResponse {
  success: boolean;
  data: {
    estimates: EstimateRequest[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
  timestamp: string;
}

export interface SingleEstimateResponse {
  success: boolean;
  data: {
    estimate: EstimateRequest;
  };
  timestamp: string;
}

export interface CreateEstimateRequest {
  is_new_client?: boolean;
  existing_client_id?: number;
  full_name: string;
  phone_number: string;
  email_address: string;
  ok_to_text?: boolean;
  service_address: string;
  gate_code?: string;
  apartment_unit?: string;
  preferred_date?: string;
  preferred_time?: string;
  location_on_property: string;
  approximate_volume: string;
  access_considerations?: string;
  photos?: string[];
  videos?: string[];
  material_types: string[];
  approximate_item_count?: string;
  items_filled_water?: boolean;
  items_filled_oil_fuel?: boolean;
  hazardous_materials?: boolean;
  items_tied_bags?: boolean;
  oversized_items?: boolean;
  mold_present?: boolean;
  pests_present?: boolean;
  sharp_objects?: boolean;
  heavy_lifting_required?: boolean;
  disassembly_required?: boolean;
  additional_notes?: string;
  request_donation_pickup?: boolean;
  request_demolition_addon?: boolean;
  how_did_you_hear?: string;
  request_priority?: 'low' | 'standard' | 'high' | 'urgent';
  status?: 'pending' | 'quoted' | 'scheduled' | 'completed' | 'cancelled';
  quote_amount?: number;
  quote_notes?: string;
}

export interface UpdateEstimateRequest {
  is_new_client?: boolean;
  existing_client_id?: number;
  full_name?: string;
  phone_number?: string;
  email_address?: string;
  ok_to_text?: boolean;
  service_address?: string;
  gate_code?: string;
  apartment_unit?: string;
  preferred_date?: string;
  preferred_time?: string;
  location_on_property?: string;
  approximate_volume?: string;
  access_considerations?: string;
  photos?: string[];
  videos?: string[];
  material_types?: string[];
  approximate_item_count?: string;
  items_filled_water?: boolean;
  items_filled_oil_fuel?: boolean;
  hazardous_materials?: boolean;
  items_tied_bags?: boolean;
  oversized_items?: boolean;
  mold_present?: boolean;
  pests_present?: boolean;
  sharp_objects?: boolean;
  heavy_lifting_required?: boolean;
  disassembly_required?: boolean;
  additional_notes?: string;
  request_donation_pickup?: boolean;
  request_demolition_addon?: boolean;
  how_did_you_hear?: string;
  request_priority?: 'low' | 'standard' | 'high' | 'urgent';
  status?: 'pending' | 'quoted' | 'scheduled' | 'completed' | 'cancelled';
  quote_amount?: number;
  quote_notes?: string;
}

export interface CreateEstimateResponse {
  success: boolean;
  data: {
    estimate: EstimateRequest;
  };
  message: string;
  timestamp: string;
}

export interface UpdateEstimateResponse {
  success: boolean;
  data: {
    estimate: EstimateRequest;
  };
  message: string;
  timestamp: string;
}

export interface DeleteEstimateResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

class EstimatesService {
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

  /**
   * Get all estimates with optional filtering
   */
  async getEstimates(params: {
    status?: string;
    request_priority?: string;
    is_new_client?: boolean;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<EstimatesResponse> {
    try {
      const headers = this.getAuthHeaders();
      const cacheBustParams = {
        ...params,
        _t: Date.now()
      };
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/estimates`, {
        headers,
        params: cacheBustParams
      });

      console.log('✅ Estimates fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching estimates:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch estimates');
    }
  }

  /**
   * Get a single estimate by ID
   */
  async getEstimate(id: number): Promise<SingleEstimateResponse> {
    try {
      const headers = this.getAuthHeaders();
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/estimates/${id}?_t=${Date.now()}`, {
        headers
      });

      console.log('✅ Estimate fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching estimate:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 404) {
        throw new Error('Estimate not found');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch estimate');
    }
  }

  /**
   * Create a new estimate
   */
  async createEstimate(estimateData: CreateEstimateRequest): Promise<CreateEstimateResponse> {
    try {
      const headers = this.getAuthHeaders();
      
      const response = await axios.post(`${API_BASE_URL}/api/v1/estimates`, estimateData, {
        headers
      });

      console.log('✅ Estimate created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating estimate:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Validation failed';
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          const errorDetails = errors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
          throw new Error(`${errorMessage} - ${errorDetails}`);
        }
        throw new Error(errorMessage);
      }
      throw new Error(error.response?.data?.message || 'Failed to create estimate');
    }
  }

  /**
   * Update an existing estimate
   */
  async updateEstimate(id: number, updateData: UpdateEstimateRequest): Promise<UpdateEstimateResponse> {
    try {
      const headers = this.getAuthHeaders();
      
      const response = await axios.put(`${API_BASE_URL}/api/v1/estimates/${id}`, updateData, {
        headers
      });

      console.log('✅ Estimate updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating estimate:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 404) {
        throw new Error('Estimate not found');
      }
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Validation failed';
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          const errorDetails = errors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
          throw new Error(`${errorMessage} - ${errorDetails}`);
        }
        throw new Error(errorMessage);
      }
      throw new Error(error.response?.data?.message || 'Failed to update estimate');
    }
  }

  /**
   * Delete an estimate
   */
  async deleteEstimate(id: number): Promise<DeleteEstimateResponse> {
    try {
      const headers = this.getAuthHeaders();
      
      const response = await axios.delete(`${API_BASE_URL}/api/v1/estimates/${id}`, {
        headers
      });

      console.log('✅ Estimate deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting estimate:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 404) {
        throw new Error('Estimate not found');
      }
      if (error.response?.status === 409) {
        throw new Error('Cannot delete estimate with associated jobs');
      }
      throw new Error(error.response?.data?.message || 'Failed to delete estimate');
    }
  }

  /**
   * Update estimate status and quote amount (convenience method)
   */
  async updateEstimateQuote(id: number, updateData: UpdateEstimateRequest): Promise<UpdateEstimateResponse> {
    return this.updateEstimate(id, updateData);
  }

  /**
   * Update estimate status only (convenience method)
   */
  async updateEstimateStatus(id: number, status: 'pending' | 'quoted' | 'scheduled' | 'completed' | 'cancelled'): Promise<UpdateEstimateResponse> {
    return this.updateEstimate(id, { status });
  }
}

export const estimatesService = new EstimatesService();
