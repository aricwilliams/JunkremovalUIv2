import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace('/api/v1/auth', '');

// Password reset interfaces
export interface PasswordResetRequest {
  username: string;
  new_password: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  timestamp?: string;
}

export interface PasswordResetError {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp?: string;
}

class PasswordResetService {
  /**
   * Reset user password
   */
  async resetPassword(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/reset-password`, request, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Password reset successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Password reset failed:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        throw new Error(errorData.message || 'Password reset failed');
      } else {
        // Network error
        throw new Error('Network error occurred. Please check your connection and try again.');
      }
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (password.length > 128) {
        errors.push('Password must be no more than 128 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate username/email format
   */
  validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!username) {
      errors.push('Username or email is required');
    } else {
      // Check if it's an email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if it's a valid username (alphanumeric, underscore, hyphen, 3-30 chars)
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      
      if (!emailRegex.test(username) && !usernameRegex.test(username)) {
        errors.push('Please enter a valid email address or username');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const passwordResetService = new PasswordResetService();
