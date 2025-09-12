import axios from 'axios';
import { Announcement, AnnouncementsResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace('/api/v1/auth', '');

class AnnouncementsService {

  /**
   * Get all announcements
   */
  async getAnnouncements(visibleOnly: boolean = false): Promise<AnnouncementsResponse> {
    try {
      const url = visibleOnly 
        ? `${API_BASE_URL}/api/v1/announcements?visible_only=true`
        : `${API_BASE_URL}/api/v1/announcements`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: number): Promise<{ success: boolean; data: { announcement: Announcement } }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }
  }

  /**
   * Create new announcement
   */
  async createAnnouncement(message: string, isVisible: boolean = false): Promise<{ success: boolean; data: { announcement: Announcement } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/announcements`, {
        message,
        is_visible: isVisible
      });
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(id: number, updates: { message?: string; is_visible?: boolean }): Promise<{ success: boolean; data: { announcement: Announcement } }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/announcements/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: number): Promise<{ success: boolean; data: { deleted_announcement: Announcement } }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  /**
   * Toggle announcement visibility
   */
  async toggleVisibility(id: number): Promise<{ success: boolean; data: { announcement: Announcement } }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/v1/announcements/${id}/toggle-visibility`);
      return response.data;
    } catch (error) {
      console.error('Error toggling announcement visibility:', error);
      throw error;
    }
  }
}

export const announcementsService = new AnnouncementsService();
