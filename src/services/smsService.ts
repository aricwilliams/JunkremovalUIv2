import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1/auth', '') || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SMSMessage {
  id: string;
  to_number: string;
  from_number: string;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  direction: 'inbound' | 'outbound';
  date_sent: string;
  price?: string;
  error_code?: string;
  error_message?: string;
}

export interface SMSStats {
  total_messages: number;
  delivered_count: number;
  failed_count: number;
  total_cost: string;
}

export interface SendSMSResponse {
  success: boolean;
  message: string;
  data: {
    messageSid: string;
    to: string;
    from: string;
    body: string;
    status: string;
  };
}

export interface SendBulkSMSResponse {
  success: boolean;
  message: string;
  data: {
    sent_count: number;
    failed_count: number;
    messages: Array<{
      to: string;
      messageSid: string;
      status: string;
    }>;
  };
}

export const smsService = {
  // Send single SMS
  sendSMS: async (to: string, body: string, from?: string): Promise<SendSMSResponse> => {
    const { data } = await apiClient.post('/api/sms/send', {
      to,
      body,
      from
    });
    return data;
  },

  // Send bulk SMS
  sendBulkSMS: async (recipients: string[], body: string, from?: string): Promise<SendBulkSMSResponse> => {
    const { data } = await apiClient.post('/api/sms/send-bulk', {
      recipients,
      body,
      from
    });
    return data;
  },

  // Get SMS logs
  getSMSLogs: async (filters: {
    limit?: number;
    status?: string;
    direction?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{ success: boolean; data: { smsLogs: SMSMessage[] } }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const { data } = await apiClient.get(`/api/sms/logs?${params}`);
    return data;
  },

  // Get SMS statistics
  getSMSStats: async (startDate?: string, endDate?: string): Promise<{ success: boolean; data: SMSStats }> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const { data } = await apiClient.get(`/api/sms/stats?${params}`);
    return data;
  },

  // Get message details
  getMessageDetails: async (messageSid: string): Promise<{ success: boolean; data: SMSMessage }> => {
    const { data } = await apiClient.get(`/api/sms/message/${messageSid}`);
    return data;
  }
};
