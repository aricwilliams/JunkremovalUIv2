const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface PublicEstimateRequest {
  full_name: string;
  phone_number: string;
  email_address: string;
  service_address: string;
  location_on_property?: string;
  approximate_volume?: string;
  material_types?: string[];
  photos?: string[];
  videos?: string[];
  gate_code?: string;
  apartment_unit?: string;
  preferred_date?: string;
  preferred_time?: string;
  access_considerations?: string;
  approximate_item_count?: string;
  items_filled_water?: boolean;
  hazardous_materials?: boolean;
  mold_present?: boolean;
  additional_notes?: string;
  request_donation_pickup?: boolean;
  request_demolition_addon?: boolean;
  how_did_you_hear?: string;
  request_priority?: string;
  ok_to_text?: boolean;
  items_filled_oil_fuel?: boolean;
  items_tied_bags?: boolean;
  oversized_items?: boolean;
  pests_present?: boolean;
  sharp_objects?: boolean;
  heavy_lifting_required?: boolean;
  disassembly_required?: boolean;
}

export interface PublicEstimateResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    full_name: string;
    email_address: string;
    phone_number: string;
    service_address: string;
    status: string;
    created_at: string;
  };
}

class PublicEstimatesService {
  async createEstimate(estimateData: PublicEstimateRequest): Promise<PublicEstimateResponse> {
    try {
      console.log('Submitting public estimate request:', estimateData);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/public/estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Public estimate created successfully:', result);
      
      return result;
    } catch (error: any) {
      console.error('Error creating public estimate:', error);
      throw new Error(error.message || 'Failed to submit estimate request');
    }
  }
}

export const publicEstimatesService = new PublicEstimatesService();
