import React, { useState } from 'react';
import { Job } from '../../types';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  MapPin,
  Phone,
  Mail,
  Send,
  AlertCircle,
  Truck,
  Star
} from 'lucide-react';

interface JobProgressTrackerProps {
  job: Job;
  onStatusUpdate: (jobId: string, newStatus: string) => void;
}

const JobProgressTracker: React.FC<JobProgressTrackerProps> = ({ job, onStatusUpdate }) => {
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const statusSteps = [
    { key: 'scheduled', label: 'Scheduled', icon: Clock, color: 'text-blue-600' },
    { key: 'in-progress', label: 'In Progress', icon: Play, color: 'text-yellow-600' },
    { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600' }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === job.status);

  const handleStatusUpdate = (newStatus: string) => {
    onStatusUpdate(job.id, newStatus);
  };

  const sendNotification = async (type: 'on-way' | 'started' | 'completed') => {
    setIsSendingNotification(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const messages = {
      'on-way': `Hi ${job.customerName}! Your junk removal team is on the way to ${job.address}. We'll be there in about 15 minutes.`,
      'started': `Hi ${job.customerName}! We've started your junk removal job at ${job.address}. We'll keep you updated on our progress.`,
      'completed': `Hi ${job.customerName}! Your junk removal job at ${job.address} is complete! We'll send you an invoice shortly. Thank you for choosing us!`
    };

    console.log('Sending notification:', messages[type]);
    setNotificationSent(true);
    setIsSendingNotification(false);
    
    // Reset notification sent state after 3 seconds
    setTimeout(() => setNotificationSent(false), 3000);
  };

  const handleCall = () => {
    window.open(`tel:${job.customerPhone}`, '_self');
  };

  const handleEmail = () => {
    window.open(`mailto:${job.customerEmail}`, '_self');
  };

  const handleGoogleMaps = () => {
    const address = `${job.address}, ${job.city}, ${job.state}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.customerName}</h3>
          <p className="text-sm text-gray-600">{job.address}, {job.city}, {job.state}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">${job.totalEstimate}</p>
          <p className="text-sm text-gray-600">{job.estimatedHours}h estimated</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {index < statusSteps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isActive ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Job Actions</h4>
          
          {job.status === 'scheduled' && (
            <button
              onClick={() => handleStatusUpdate('in-progress')}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Start Job</span>
            </button>
          )}

          {job.status === 'in-progress' && (
            <div className="space-y-2">
              <button
                onClick={() => handleStatusUpdate('completed')}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Job</span>
              </button>
            </div>
          )}

          {job.status === 'completed' && (
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Send Invoice</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                <Star className="w-4 h-4" />
                <span>Request Review</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Customer Communication</h4>
          
          {job.status === 'scheduled' && (
            <button
              onClick={() => sendNotification('on-way')}
              disabled={isSendingNotification}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Truck className="w-4 h-4" />
              <span>{isSendingNotification ? 'Sending...' : 'On My Way'}</span>
            </button>
          )}

          {job.status === 'in-progress' && (
            <button
              onClick={() => sendNotification('started')}
              disabled={isSendingNotification}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isSendingNotification ? 'Sending...' : 'Job Started'}</span>
            </button>
          )}

          {job.status === 'completed' && (
            <button
              onClick={() => sendNotification('completed')}
              disabled={isSendingNotification}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSendingNotification ? 'Sending...' : 'Job Complete'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGoogleMaps}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>Directions</span>
          </button>
          
          <button
            onClick={handleCall}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </button>
          
          <button
            onClick={handleEmail}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Notification Status */}
      {notificationSent && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">Notification sent successfully!</span>
          </div>
        </div>
      )}

      {/* Job Details */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Job Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Scheduled Date:</p>
            <p className="font-medium">{new Date(job.scheduledDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Time Slot:</p>
            <p className="font-medium">{job.timeSlot}</p>
          </div>
          <div>
            <p className="text-gray-600">Items:</p>
            <p className="font-medium">{job.items.length} items</p>
          </div>
          <div>
            <p className="text-gray-600">Status:</p>
            <p className="font-medium capitalize">{job.status.replace('-', ' ')}</p>
          </div>
        </div>
        
        {job.notes && (
          <div className="mt-3">
            <p className="text-gray-600 text-sm">Notes:</p>
            <p className="text-sm">{job.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobProgressTracker;
