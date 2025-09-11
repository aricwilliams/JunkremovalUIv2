import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface Notification {
  id: number;
  business_id: number;
  google_review_link: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total_notifications: number;
  notifications_with_links: number;
  notifications_without_links: number;
  first_notification_date: string;
  last_notification_date: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
  sort?: 'id' | 'created_at' | 'updated_at';
  order?: 'ASC' | 'DESC';
}

class NotificationsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a new notification with Google review link
   */
  async createNotification(googleReviewLink: string): Promise<{ notification: Notification }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/notifications`,
        {
          google_review_link: googleReviewLink
        },
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error creating notification:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create notification'
      );
    }
  }

  /**
   * Get all notifications for the authenticated business
   */
  async getNotifications(
    options: GetNotificationsOptions = {}
  ): Promise<{ notifications: Notification[]; pagination: PaginationInfo }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          params: {
            limit: options.limit || 50,
            offset: options.offset || 0,
            sort: options.sort || 'created_at',
            order: options.order || 'DESC'
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch notifications'
      );
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{ stats: NotificationStats }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/notifications/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching notification stats:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch notification statistics'
      );
    }
  }

  /**
   * Get a specific notification by ID
   */
  async getNotificationById(id: number): Promise<{ notification: Notification }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/notifications/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching notification by ID:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch notification'
      );
    }
  }

  /**
   * Update a notification's Google review link
   */
  async updateNotification(
    id: number,
    googleReviewLink?: string
  ): Promise<{ notification: Notification }> {
    try {
      const updateData: any = {};
      if (googleReviewLink !== undefined) {
        updateData.google_review_link = googleReviewLink;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/notifications/${id}`,
        updateData,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error updating notification:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update notification'
      );
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: number): Promise<{ deletedId: number }> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/notifications/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete notification'
      );
    }
  }

  /**
   * Validate Google review link
   */
  validateGoogleReviewLink(url: string): { valid: boolean; error?: string } {
    try {
      // Check if it's a valid URL
      const urlObj = new URL(url);
      
      // Check if it's HTTP or HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          valid: false,
          error: 'URL must use HTTP or HTTPS protocol'
        };
      }

      // Check if it contains google.com
      if (!urlObj.hostname.includes('google.com')) {
        return {
          valid: false,
          error: 'URL must be a Google URL'
        };
      }

      // Check length
      if (url.length > 500) {
        return {
          valid: false,
          error: 'URL must be less than 500 characters'
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Extract business name from Google review link (if possible)
   */
  extractBusinessNameFromLink(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Look for place name in the path
      const placeIndex = pathParts.findIndex(part => part === 'place');
      if (placeIndex !== -1 && pathParts[placeIndex + 1]) {
        return decodeURIComponent(pathParts[placeIndex + 1]).replace(/\+/g, ' ');
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate a shareable Google review link
   */
  generateGoogleReviewLink(businessName: string, businessAddress: string): string {
    const encodedName = encodeURIComponent(businessName);
    const encodedAddress = encodeURIComponent(businessAddress);
    
    return `https://www.google.com/maps/search/${encodedName}+${encodedAddress}/@0,0,0z/data=!3m1!4b1!4m5!2m4!1s${encodedName}!3s${encodedAddress}`;
  }
}

export const notificationsService = new NotificationsService();
