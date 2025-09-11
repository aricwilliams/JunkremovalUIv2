import React, { useState } from 'react';
import { EstimateRequest } from '../../types';
import { notificationsService } from '../../services/notificationsService';
import {
  Play,
  CheckCircle,
  Clock,
  MessageSquare,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Truck,
  Star,
  DollarSign,
  Calendar
} from 'lucide-react';

interface JobProgressTrackerProps {
  job: EstimateRequest;
  onStatusUpdate: (jobId: string, newStatus: string) => void;
}

const JobProgressTracker: React.FC<JobProgressTrackerProps> = ({ job, onStatusUpdate }) => {
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  
  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // Junk removal email templates
  const emailTemplates = [
    {
      id: 1,
      name: "On My Way",
      subject: "We're on our way! - Junk Removal Service",
      body: `Hi ${job.full_name}!

We're on our way to your location at ${job.service_address} for your junk removal service. We'll be there in about 15 minutes.

If you have any questions or need to reach us, please don't hesitate to call.

Thank you for choosing our junk removal service!

Best regards,
Your Junk Removal Team`
    },
    {
      id: 2,
      name: "Job Started",
      subject: "We've started your junk removal job",
      body: `Hi ${job.full_name}!

We've arrived and started your junk removal job at ${job.service_address}. We'll keep you updated on our progress and let you know when we're finished.

If you have any questions or need to reach us, please don't hesitate to call.

Thank you for choosing our junk removal service!

Best regards,
Your Junk Removal Team`
    },
    {
      id: 3,
      name: "Job Completed",
      subject: "Your junk removal job is complete!",
      body: `Hi ${job.full_name}!

Great news! Your junk removal job at ${job.service_address} is now complete. We've removed all the items as discussed and cleaned up the area.

We'll send you an invoice shortly. Thank you for choosing our junk removal service!

If you have any questions or need additional services, please don't hesitate to reach out.

Best regards,
Your Junk Removal Team`
    },
    {
      id: 4,
      name: "Review Request",
      subject: "How was your junk removal experience?",
      body: `Hi ${job.full_name}!

Thank you for choosing our junk removal service! We hope you were satisfied with the work we completed at ${job.service_address}.

We'd love to hear about your experience! If you have a moment, please consider leaving us a review. Your feedback helps us improve our service and helps other customers find us.

[REVIEW_LINK_PLACEHOLDER]

Thank you again for your business!

Best regards,
Your Junk Removal Team`
    },
    {
      id: 5,
      name: "Follow-up Check",
      subject: "How are you doing after your junk removal?",
      body: `Hi ${job.full_name}!

We wanted to follow up and see how you're doing after our junk removal service at ${job.service_address}. We hope everything met your expectations!

If you have any additional items you need removed or if you know anyone else who might need junk removal services, please don't hesitate to reach out. We'd be happy to help!

Thank you for choosing our junk removal service!

Best regards,
Your Junk Removal Team`
    },
    {
      id: 6,
      name: "Custom Message",
      subject: "",
      body: ""
    }
  ];

  const statusSteps = [
    { key: 'need review', label: 'Need Review', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { key: 'reviewed', label: 'Reviewed', icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { key: 'quoted', label: 'Quoted', icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { key: 'scheduled', label: 'Scheduled', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { key: 'in progress', label: 'In Progress', icon: Play, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { key: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === job.status);

  const handleStatusUpdate = (newStatus: string) => {
    onStatusUpdate(job.id.toString(), newStatus);
  };

  const sendNotification = async (type: 'on-way' | 'started' | 'completed') => {
    setIsSendingNotification(true);

    const messages = {
      'on-way': `Hi ${job.full_name}! Your junk removal team is on the way to ${job.service_address}. We'll be there in about 15 minutes.`,
      'started': `Hi ${job.full_name}! We've started your junk removal job at ${job.service_address}. We'll keep you updated on our progress.`,
      'completed': `Hi ${job.full_name}! Your junk removal job at ${job.service_address} is complete! We'll send you an invoice shortly. Thank you for choosing us!`
    };

    if (type === 'on-way' && job.phone_number) {
      // Open phone messaging app with pre-filled message
      const message = messages[type];
      console.log('Sending "On My Way" to:', job.phone_number, 'for customer:', job.full_name);
      const smsUrl = `sms:${job.phone_number}?&body=${encodeURIComponent(message)}`;
      window.location.href = smsUrl;
      
      setNotificationSent(true);
      setIsSendingNotification(false);
      
      // Reset notification sent state after 3 seconds
      setTimeout(() => setNotificationSent(false), 3000);
      return;
    }

    // For other notification types, simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Sending notification:', messages[type]);
    setNotificationSent(true);
    setIsSendingNotification(false);

    // Reset notification sent state after 3 seconds
    setTimeout(() => setNotificationSent(false), 3000);
  };

  const handleCall = () => {
    if (job.phone_number) {
      window.open(`tel:${job.phone_number}`, '_self');
    }
  };

  const handleRequestReview = async () => {
    try {
      // Get the Google review link from notifications
      const response = await notificationsService.getNotifications({ limit: 1 });
      
      if (response.notifications.length > 0 && response.notifications[0].google_review_link) {
        const reviewLink = response.notifications[0].google_review_link;
        const message = `Hi ${job.full_name}! Thank you for choosing us for your junk removal service. We'd love to hear about your experience! Please take a moment to leave us a review: ${reviewLink}`;
        
        if (job.phone_number) {
          console.log('Sending review request to:', job.phone_number, 'for customer:', job.full_name);
          const smsUrl = `sms:${job.phone_number}?&body=${encodeURIComponent(message)}`;
          window.location.href = smsUrl;
        }
      } else {
        // No review link found
        const message = `Hi ${job.full_name}! Thank you for choosing us for your junk removal service. We'd love to hear about your experience! Please take a moment to leave us a review. (Note: Review link needs to be added to settings)`;
        
        if (job.phone_number) {
          const smsUrl = `sms:${job.phone_number}?&body=${encodeURIComponent(message)}`;
          window.location.href = smsUrl;
        }
      }
    } catch (error) {
      console.error('Error getting review link:', error);
      // Fallback message without review link
      const message = `Hi ${job.full_name}! Thank you for choosing us for your junk removal service. We'd love to hear about your experience! Please take a moment to leave us a review. (Note: Review link needs to be added to settings)`;
      
      if (job.phone_number) {
        const smsUrl = `sms:${job.phone_number}?&body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;
      }
    }
  };


  const handleEmailCompose = () => {
    if (job.email_address) {
      const subject = emailSubject ? `&su=${encodeURIComponent(emailSubject)}` : '';
      const body = emailBody ? `&body=${encodeURIComponent(emailBody)}` : '';
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(job.email_address)}${subject}${body}`;
      window.open(url, '_blank');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
      setSelectedTemplate(null);
    }
  };

  const handleTemplateSelect = async (templateId: number) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setEmailSubject(template.subject);
      
      let body = template.body;
      
      // Handle review link placeholder
      if (templateId === 4 && body.includes('[REVIEW_LINK_PLACEHOLDER]')) {
        try {
          const response = await notificationsService.getNotifications({ limit: 1 });
          if (response.notifications.length > 0 && response.notifications[0].google_review_link) {
            body = body.replace('[REVIEW_LINK_PLACEHOLDER]', response.notifications[0].google_review_link);
          } else {
            body = body.replace('[REVIEW_LINK_PLACEHOLDER]', 'Please visit our Google page to leave a review.');
          }
        } catch (error) {
          body = body.replace('[REVIEW_LINK_PLACEHOLDER]', 'Please visit our Google page to leave a review.');
        }
      }
      
      setEmailBody(body);
    }
  };

  const handleGoogleMaps = () => {
    if (job.service_address) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.service_address)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      {/* Header with Customer Info and Estimate */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{job.full_name}</h3>
          <p className="text-sm text-gray-600 break-words">{job.service_address}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xl sm:text-2xl font-bold text-gray-900">${job.quote_amount ? parseFloat(job.quote_amount.toString()).toLocaleString() : 'Not quoted'}</p>
          <p className="text-sm text-gray-600">{job.approximate_volume}</p>
        </div>
      </div>

      {/* Improved Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full border-2 transition-all duration-300 ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white shadow-lg'
                    : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                </div>

                <span className={`mt-1 sm:mt-2 font-medium text-center transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                  <span className="hidden sm:inline text-xs">{step.label}</span>
                  <span className="sm:hidden text-xs leading-tight">{step.label.split(' ')[0]}</span>
                </span>

                {/* Progress indicator */}
                {index < statusSteps.length - 1 && (
                  <div className="hidden sm:block w-full h-1 mt-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isActive ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      style={{ width: isActive ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile progress bar */}
        <div className="sm:hidden mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons - Clean 3-column layout */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Job Status Actions */}
          {job.status === 'accepted' && (
            <button
              onClick={() => handleStatusUpdate('scheduled')}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Job</span>
            </button>
          )}

          {job.status === 'scheduled' && (
            <button
              onClick={() => handleStatusUpdate('in progress')}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Start Job</span>
            </button>
          )}

          {job.status === 'in progress' && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Job</span>
            </button>
          )}

          {job.status === 'completed' && (
            <button className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm">
              <MessageSquare className="w-4 h-4" />
              <span>Send Invoice</span>
            </button>
          )}

          {/* Customer Notifications */}
          {job.status === 'scheduled' && (
            <button
              onClick={() => sendNotification('on-way')}
              disabled={isSendingNotification}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>{isSendingNotification ? 'Opening...' : 'Text: On My Way'}</span>
            </button>
          )}

          {job.status === 'in progress' && (
            <button
              onClick={() => sendNotification('started')}
              disabled={isSendingNotification}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>{isSendingNotification ? 'Sending...' : 'Job Started'}</span>
            </button>
          )}

          {job.status === 'completed' && (
            <button
              onClick={() => sendNotification('completed')}
              disabled={isSendingNotification}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSendingNotification ? 'Sending...' : 'Job Complete'}</span>
            </button>
          )}

          {/* Additional Actions */}
          {job.status === 'completed' && (
            <button 
              onClick={handleRequestReview}
              className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Star className="w-4 h-4" />
              <span>Text: Request Review</span>
            </button>
          )}

          {/* Fill empty slots for consistent layout */}
          {job.status === 'scheduled' && (
            <div className="hidden sm:block" />
          )}
          {job.status === 'in progress' && (
            <div className="hidden sm:block" />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3 text-sm">Quick Actions</h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleGoogleMaps}
            className="flex flex-col items-center space-y-2 px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <MapPin className="w-6 h-6" />
            <span>Directions</span>
          </button>

          <button
            onClick={handleCall}
            className="flex flex-col items-center space-y-2 px-4 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Phone className="w-6 h-6" />
            <span>Call</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="flex flex-col items-center space-y-2 px-4 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Mail className="w-6 h-6" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Notification Status */}
      {notificationSent && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">Notification sent successfully!</span>
          </div>
        </div>
      )}

      {/* Job Details */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3 text-sm">Job Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Preferred Date:</p>
            <p className="font-medium">{job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-600">Preferred Time:</p>
            <p className="font-medium">{job.preferred_time || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-600">Volume:</p>
            <p className="font-medium">{job.approximate_volume || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-600">Status:</p>
            <p className="font-medium capitalize">{job.status?.replace('-', ' ') || 'Unknown'}</p>
          </div>
        </div>

        {job.additional_notes && (
          <div className="mt-3">
            <p className="text-gray-600 text-sm">Notes:</p>
            <p className="text-sm break-words">{job.additional_notes}</p>
          </div>
        )}
      </div>

      {/* Email Composition Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Compose Email - {job.full_name}</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                <select
                  value={selectedTemplate || ''}
                  onChange={(e) => handleTemplateSelect(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a template...</option>
                  {emailTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email subject..."
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email message..."
                />
              </div>

              {/* Recipient Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>To:</strong> {job.email_address}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailCompose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open in Gmail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobProgressTracker;
