import { useState } from 'react';
import { passwordResetService, PasswordResetRequest } from '../services/passwordResetService';

interface UsePasswordResetReturn {
  resetPassword: (request: PasswordResetRequest) => Promise<{ success: boolean; message: string; errors?: any }>;
  loading: boolean;
  error: string | null;
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  validateUsername: (username: string) => { isValid: boolean; errors: string[] };
}

export const usePasswordReset = (): UsePasswordResetReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (request: PasswordResetRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await passwordResetService.resetPassword(request);
      setLoading(false);
      return { success: true, message: response.message };
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  const validatePassword = (password: string) => {
    return passwordResetService.validatePassword(password);
  };

  const validateUsername = (username: string) => {
    return passwordResetService.validateUsername(username);
  };

  return {
    resetPassword,
    loading,
    error,
    validatePassword,
    validateUsername
  };
};
