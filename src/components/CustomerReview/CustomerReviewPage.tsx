import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, DollarSign, MapPin, Phone, Mail, Calendar, Package } from 'lucide-react';
import { estimatesService } from '../../services/estimatesService';

interface CustomerReviewPageProps {
  estimateId: string;
}

interface EstimateData {
  id: string;
  full_name: string;
  phone_number: string;
  email_address: string;
  service_address: string;
  location_on_property: string;
  approximate_volume: string;
  material_types: string[];
  quote_amount: number;
  quote_notes: string;
  preferred_date: string;
  preferred_time: string;
  additional_notes: string;
  created_at: string;
}

const CustomerReviewPage: React.FC<CustomerReviewPageProps> = ({ estimateId }) => {
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true);
        const data = await estimatesService.getEstimate(parseInt(estimateId));
        setEstimate(data);
      } catch (error) {
        console.error('Failed to fetch estimate:', error);
        setError('Failed to load estimate details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [estimateId]);

  const handleDecision = async (decision: 'accepted' | 'declined') => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Update the estimate status
      await estimatesService.updateEstimate(parseInt(estimateId), {
        ...estimate!,
        status: decision
      });
      
      setSuccess(`Thank you! Your estimate has been ${decision}.`);
    } catch (error) {
      console.error('Failed to update estimate status:', error);
      setError('Failed to submit your decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your estimate...</p>
        </div>
      </div>
    );
  }

  if (error && !estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Estimate Not Found</h1>
          <p className="text-gray-600">The estimate you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Junk Removal Estimate</h1>
          <p className="text-gray-600">Please review and respond to your estimate</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Estimate Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Quote Amount - Prominent Display */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              ${estimate.quote_amount ? estimate.quote_amount.toLocaleString() : '0'}
            </div>
            {estimate.quote_notes && (
              <p className="text-green-100 text-sm">{estimate.quote_notes}</p>
            )}
          </div>

          {/* Estimate Information - Simplified */}
          <div className="p-6">
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <span className="text-gray-900 ml-2">{estimate.full_name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Service Address:</span>
                <p className="text-gray-900 mt-1">{estimate.service_address || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="text-gray-900 ml-2">{estimate.location_on_property || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Volume:</span>
                <span className="text-gray-900 ml-2">{estimate.approximate_volume || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Materials:</span>
                <p className="text-gray-900 mt-1">{estimate.material_types ? estimate.material_types.join(', ') : 'N/A'}</p>
              </div>
              {estimate.additional_notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-900 mt-1">{estimate.additional_notes}</p>
                </div>
              )}
            </div>

            {/* Decision Buttons */}
            {!success && estimate.quote_amount && estimate.quote_amount > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleDecision('accepted')}
                    disabled={submitting}
                    className="flex items-center justify-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecision('declined')}
                    disabled={submitting}
                    className="flex items-center justify-center px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Decline
                  </button>
                </div>
                {submitting && (
                  <p className="text-center text-gray-600 mt-4">Processing your decision...</p>
                )}
              </div>
            )}

            {/* No Quote Available Message */}
            {!success && (!estimate.quote_amount || estimate.quote_amount <= 0) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600">This estimate is not ready for review yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Estimate #{estimate.id}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewPage;
