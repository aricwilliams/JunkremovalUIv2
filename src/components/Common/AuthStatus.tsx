import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const token = localStorage.getItem('authToken');

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Checking auth...</span>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <XCircle className="w-4 h-4" />
        <span>Not authenticated</span>
      </div>
    );
  }

  // Check if token is expired
  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const isExpired = tokenData.exp * 1000 < Date.now();
    
    if (isExpired) {
      return (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>Token expired</span>
        </div>
      );
    }
  } catch (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <XCircle className="w-4 h-4" />
        <span>Invalid token</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600">
      <CheckCircle className="w-4 h-4" />
      <span>Authenticated as {user?.business_name || user?.name || 'User'}</span>
    </div>
  );
};

export default AuthStatus;
