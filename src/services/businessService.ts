import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface BusinessProfile {
  id: number;
  business_name: string;
  business_phone: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_zip_code: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  username: string;
  user_type: string;
  status: string;
  created_at: string;
  last_login: string;
  license_number: string;
  insurance_number: string;
  service_radius: number;
  number_of_trucks: number;
  years_in_business: number;
}

export interface BusinessUpdateData {
  business_name: string;
  business_phone: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_zip_code: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_phone: string;
  license_number: string;
  insurance_number: string;
  service_radius: number;
  number_of_trucks: number;
  years_in_business: number;
}

export interface BusinessUpdateResponse {
  success: boolean;
  message: string;
  data: {
    business: BusinessProfile;
  };
}

export const businessService = {
  // Update business profile
  async updateProfile(data: BusinessUpdateData): Promise<BusinessUpdateResponse> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`${API_BASE_URL}/api/v1/auth/profile`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update business profile'
      );
    }
  },

  // Get current business profile (if you have a GET endpoint)
  async getProfile(): Promise<BusinessProfile> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.data.business;
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch business profile'
      );
    }
  }
};
