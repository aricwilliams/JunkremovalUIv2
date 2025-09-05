import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Customer interfaces
export interface Customer {
  id: number;
  business_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  customer_type: 'residential' | 'commercial' | 'industrial' | 'government';
  status: 'new' | 'quoted' | 'scheduled' | 'completed' | 'inactive' | 'blacklisted';
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  customer_type?: 'residential' | 'commercial' | 'industrial' | 'government';
  status?: 'new' | 'quoted' | 'scheduled' | 'completed' | 'inactive' | 'blacklisted';
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  customer_type?: 'residential' | 'commercial' | 'industrial' | 'government';
  status?: 'new' | 'quoted' | 'scheduled' | 'completed' | 'inactive' | 'blacklisted';
}

export interface CustomersResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
  timestamp: string;
}

export interface SingleCustomerResponse {
  success: boolean;
  data: {
    customer: Customer;
  };
  timestamp: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  data: {
    customer: Customer;
  };
  message: string;
  timestamp: string;
}

export interface UpdateCustomerResponse {
  success: boolean;
  data: {
    customer: Customer;
  };
  message: string;
  timestamp: string;
}

export interface DeleteCustomerResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface CustomerFilters {
  status?: string;
  customer_type?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

class CustomersService {
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

  public async getCustomers(filters: CustomerFilters = {}): Promise<CustomersResponse> {
    try {
      const headers = this.getAuthHeaders();
      const params = {
        ...filters,
        _t: Date.now() // Cache busting
      };
      
      console.log('🔍 Fetching customers with filters:', filters);
      const response = await axios.get(`${API_BASE_URL}/api/v1/customers`, {
        headers,
        params
      });
      
      console.log('✅ Customers fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      throw error;
    }
  }

  public async getCustomer(id: number): Promise<SingleCustomerResponse> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/v1/customers/${id}?_t=${Date.now()}`, {
        headers
      });
      
      console.log('✅ Customer fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching customer with ID ${id}:`, error);
      throw error;
    }
  }

  public async createCustomer(customerData: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    try {
      const headers = this.getAuthHeaders();
      
      console.log('📝 Creating customer with data:', customerData);
      const response = await axios.post(`${API_BASE_URL}/api/v1/customers`, customerData, {
        headers
      });
      
      console.log('✅ Customer created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      throw error;
    }
  }

  public async updateCustomer(id: number, updateData: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    try {
      const headers = this.getAuthHeaders();
      
      console.log(`📝 Updating customer ${id} with data:`, updateData);
      const response = await axios.put(`${API_BASE_URL}/api/v1/customers/${id}`, updateData, {
        headers
      });
      
      console.log('✅ Customer updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating customer ${id}:`, error);
      throw error;
    }
  }

  public async deleteCustomer(id: number): Promise<DeleteCustomerResponse> {
    try {
      const headers = this.getAuthHeaders();
      
      console.log(`🗑️ Deleting customer ${id}`);
      const response = await axios.delete(`${API_BASE_URL}/api/v1/customers/${id}`, {
        headers
      });
      
      console.log('✅ Customer deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting customer ${id}:`, error);
      throw error;
    }
  }
}

export const customersService = new CustomersService();
