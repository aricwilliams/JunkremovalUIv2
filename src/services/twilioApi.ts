import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1/auth', '') || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const twilioApi = {
  // === AUTH ===
  getAccessToken: async (identity?: string) => {
    const effectiveIdentity = identity ?? `user_${Date.now()}`;
    const { data } = await apiClient.post('/api/twilio/access-token', {
      identity: effectiveIdentity
    });
    return data as { success: boolean; token: string; identity: string };
  },

  // === PHONE NUMBERS ===
  getMyNumbers: async () => (await apiClient.get('/api/twilio/my-numbers')).data,
  
  getAvailableNumbers: async (params: { 
    areaCode?: string; 
    country?: string; 
    limit?: number 
  }) => (await apiClient.get('/api/twilio/available-numbers', { params })).data,
  
  buyNumber: async (data: { 
    phoneNumber: string; 
    country?: string; 
    areaCode?: string; 
    websiteId?: string 
  }) => (await apiClient.post('/api/twilio/buy-number', data)).data,
  
  releasePhoneNumber: async (id: string) =>
    (await apiClient.delete(`/api/twilio/my-numbers/${id}`)).data,

  // === CALL LOGS ===
  getCallLogs: async (params: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    phoneNumberId?: string 
  } = {}) => (await apiClient.get('/api/twilio/call-logs', { params })).data,
  
  getCallLog: async (callSid: string) =>
    (await apiClient.get(`/api/twilio/call-logs/${callSid}`)).data,

  // === RECORDINGS ===
  getRecordings: async (params: { 
    page?: number; 
    limit?: number; 
    callSid?: string; 
    phoneNumberId?: string 
  } = {}) => (await apiClient.get('/api/twilio/recordings', { params })).data,
  
  deleteRecording: async (recordingSid: string) =>
    (await apiClient.delete(`/api/twilio/recordings/${recordingSid}`)).data,

  // === CALL FORWARDING ===
  getCallForwardings: async () => (await apiClient.get('/api/call-forwarding')).data,
  
  createCallForwarding: async (data: {
    phone_number_id: number;
    forward_to_number: string;
    forwarding_type: 'always' | 'busy' | 'no_answer' | 'unavailable';
    ring_timeout?: number;
    is_active?: boolean;
  }) => (await apiClient.post('/api/call-forwarding', data)).data,
  
  updateCallForwarding: async (id: string, updates: {
    forward_to_number?: string;
    forwarding_type?: 'always' | 'busy' | 'no_answer' | 'unavailable';
    ring_timeout?: number;
    is_active?: boolean;
  }) => (await apiClient.put(`/api/call-forwarding/${id}`, updates)).data,
  
  deleteCallForwarding: async (id: string) =>
    (await apiClient.delete(`/api/call-forwarding/${id}`)).data,
};
