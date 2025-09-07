import React, { useState } from 'react';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { useToast } from '../../contexts/ToastContext';

/**
 * Demo component to test password reset functionality
 * This can be used for testing or as a standalone password reset page
 */
const PasswordResetDemo: React.FC = () => {
  const { resetPassword, loading, error } = usePasswordReset();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    newPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await resetPassword({
        username: formData.username,
        new_password: formData.newPassword
      });
      
      if (result.success) {
        showSuccess('Password Reset', result.message);
        setFormData({ username: '', newPassword: '' });
      } else {
        showError('Password Reset Failed', result.message);
      }
    } catch (err: any) {
      showError('Password Reset Failed', err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Password Reset Demo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username or Email
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter username or email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new password"
            required
            minLength={8}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PasswordResetDemo;
