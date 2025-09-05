import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface UpdateStatusProps {
  status: 'idle' | 'updating' | 'success' | 'error';
  message?: string;
}

const UpdateStatus: React.FC<UpdateStatusProps> = ({ status, message }) => {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'updating':
        return {
          icon: <Loader className="w-4 h-4 animate-spin" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          message: message || 'Updating...'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          message: message || 'Updated successfully!'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          message: message || 'Update failed'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg border ${config.bgColor} ${config.textColor} ${config.borderColor} shadow-lg transition-all duration-300`}>
      {config.icon}
      <span className="text-sm font-medium">{config.message}</span>
    </div>
  );
};

export default UpdateStatus;
