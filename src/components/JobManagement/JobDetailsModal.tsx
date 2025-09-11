import React, { useState } from 'react';
import { Job } from '../../types';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Camera,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import JobPhotoUpload from '../Jobs/JobPhotoUpload';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
  onUpdateJob: (id: string, updates: Partial<Job>) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onUpdateJob }) => {
  const [status, setStatus] = useState(job.status);
  const [actualTotal, setActualTotal] = useState(job.actualTotal || job.totalEstimate);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as any);
    onUpdateJob(job.id, { status: newStatus as any });
  };

  const handleSaveChanges = () => {
    onUpdateJob(job.id, {
      status,
      actualTotal: actualTotal
    });
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{job.customerName}</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{job.customerPhone}</p>
                  <p className="text-sm text-gray-500">Phone</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{job.customerEmail}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{job.address}</p>
                  <p className="text-sm text-gray-500">{job.city}, {job.state} {job.zipCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(job.scheduledDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Scheduled Date</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{job.timeSlot}</p>
                  <p className="text-sm text-gray-500">Time Slot</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">${job.totalEstimate}</p>
                  <p className="text-sm text-gray-500">Estimated Total</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>


          {/* Status Update */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {['scheduled', 'in-progress', 'completed', 'cancelled'].map(statusOption => (
                <button
                  key={statusOption}
                  onClick={() => handleStatusChange(statusOption)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === statusOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {statusOption}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Total */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Actual Total</h3>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={actualTotal}
                onChange={(e) => setActualTotal(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter actual total"
              />
            </div>
          </div>


          {/* Photos */}
          <div>
            <JobPhotoUpload 
              jobId={job.id} 
              onPhotosUpdated={(photos) => {
                // Update job with new photos if needed
                console.log('Photos updated:', photos);
              }}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;