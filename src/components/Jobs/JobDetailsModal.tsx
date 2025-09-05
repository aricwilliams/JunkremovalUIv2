import React, { useState, useEffect } from 'react';
import { Job } from '../../types';
import { jobsService } from '../../services/jobsService';
import {
  X,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface JobDetailsModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated: (updatedJob: Job) => void;
  onJobDeleted: (jobId: number) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onJobUpdated,
  onJobDeleted
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: job.title || '',
    description: job.description || '',
    status: job.status || 'scheduled',
    total_cost: job.total_cost || 0,
    scheduled_date: job.scheduled_date ? new Date(job.scheduled_date).toISOString().slice(0, 16) : '',
    assigned_employee_id: job.assigned_employee_id || undefined
  });

  // Reset form when job changes
  useEffect(() => {
    setFormData({
      title: job.title || '',
      description: job.description || '',
      status: job.status || 'scheduled',
      total_cost: job.total_cost || 0,
      scheduled_date: job.scheduled_date ? new Date(job.scheduled_date).toISOString().slice(0, 16) : '',
      assigned_employee_id: job.assigned_employee_id || undefined
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  }, [job]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_cost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedJob = await jobsService.updateJob(job.id, formData);
      onJobUpdated(updatedJob.data.job);
      setIsEditing(false);
      setSuccess('Job updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await jobsService.deleteJob(job.id);
      onJobDeleted(job.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAddress = () => {
    if (job.customer) {
      return `${job.customer.address}, ${job.customer.city}, ${job.customer.state} ${job.customer.zip_code}`;
    }
    return 'Address not available';
  };

  const formatEmployeeName = () => {
    if (job.employee) {
      return `${job.employee.first_name} ${job.employee.last_name}`;
    }
    return 'Not assigned';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Job' : 'Job Details'}
          </h2>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-100 text-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{job.customer?.name || 'Unknown Customer'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{job.customer?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{job.customer?.email || 'N/A'}</span>
              </div>
              <div className="flex items-start space-x-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="break-words">{formatAddress()}</span>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Job Information</h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{job.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{job.description || 'No description provided'}</p>
              )}
            </div>

            {/* Status and Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Cost
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="total_cost"
                    value={formData.total_cost}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">${job.total_cost?.toLocaleString() || '0'}</p>
                )}
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date & Time
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-900">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(job.scheduled_date).toLocaleDateString()}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{new Date(job.scheduled_date).toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {/* Assigned Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Employee
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="assigned_employee_id"
                  value={formData.assigned_employee_id || ''}
                  onChange={handleInputChange}
                  placeholder="Employee ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{formatEmployeeName()}</p>
              )}
            </div>

            {/* Estimate Information */}
            {job.estimate && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Related Estimate</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Title:</strong> {job.estimate.title}</p>
                  <p><strong>Amount:</strong> ${job.estimate.amount}</p>
                  <p><strong>Status:</strong> {job.estimate.status}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
