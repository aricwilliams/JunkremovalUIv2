import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, MapPin, Phone, Mail, Calendar, Clock, Package, DollarSign, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { estimatesService, EstimateRequest } from '../../services/estimatesService';

interface CustomerReviewPageProps {
  estimateId: string;
}

const CustomerReviewPage: React.FC<CustomerReviewPageProps> = ({ estimateId }) => {
  const [estimate, setEstimate] = useState<EstimateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true);
        const response = await estimatesService.getEstimate(parseInt(estimateId));
        console.log('CustomerReviewPage - API Response:', response);
        console.log('CustomerReviewPage - Estimate Data:', response.data.estimate);
        setEstimate(response.data.estimate);
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
      
      // Update the estimate status using the unauthenticated endpoint
      await estimatesService.updateEstimateStatusUnauthenticated(parseInt(estimateId), decision);
      
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
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-white mr-2" />
              <div className="text-4xl font-bold text-white">
                ${estimate.quote_amount ? estimate.quote_amount.toLocaleString() : '0'}
              </div>
            </div>
            {estimate.quote_notes && (
              <p className="text-green-100 text-sm max-w-md mx-auto">{estimate.quote_notes}</p>
            )}
          </div>

          {/* Comprehensive Estimate Information */}
          <div className="p-6 space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900 ml-2">{estimate.full_name || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="text-gray-900 ml-2">{estimate.phone_number || 'N/A'}</span>
                </div>
                <div className="flex items-center md:col-span-2">
                  <Mail className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="text-gray-900 ml-2">{estimate.email_address || 'N/A'}</span>
                </div>
                {estimate.ok_to_text && (
                  <div className="flex items-center md:col-span-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-green-700 text-sm">OK to text this number</span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Service Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Service Address:</span>
                    <p className="text-gray-900 mt-1">{estimate.service_address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Package className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Location on Property:</span>
                    <p className="text-gray-900 mt-1">{estimate.location_on_property || 'N/A'}</p>
                  </div>
                </div>
                {estimate.gate_code && (
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="font-medium text-gray-700">Gate Code:</span>
                    <span className="text-gray-900 ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">{estimate.gate_code}</span>
                  </div>
                )}
                {estimate.apartment_unit && (
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="font-medium text-gray-700">Apartment/Unit:</span>
                    <span className="text-gray-900 ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">{estimate.apartment_unit}</span>
                  </div>
                )}
                {estimate.access_considerations && (
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-700">Access Considerations:</span>
                      <p className="text-gray-900 mt-1">{estimate.access_considerations}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduling */}
            {(estimate.preferred_date || estimate.preferred_time) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Preferred Scheduling
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {estimate.preferred_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="text-gray-900 ml-2">{new Date(estimate.preferred_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {estimate.preferred_time && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-700">Time:</span>
                      <span className="text-gray-900 ml-2">{estimate.preferred_time}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Materials & Volume */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-orange-600" />
                Materials & Volume
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <Package className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Approximate Volume:</span>
                    <p className="text-gray-900 mt-1">{estimate.approximate_volume || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Package className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Material Types:</span>
                    <p className="text-gray-900 mt-1">
                      {estimate.material_types ? 
                        (Array.isArray(estimate.material_types) ? 
                          estimate.material_types.join(', ') : 
                          String(estimate.material_types)
                        ) : 'N/A'
                      }
                    </p>
                  </div>
                </div>
                {estimate.approximate_item_count && (
                  <div className="flex items-center">
                    <Package className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">Item Count:</span>
                    <span className="text-gray-900 ml-2">{estimate.approximate_item_count}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Special Considerations */}
            {(estimate.items_filled_water || estimate.items_filled_oil_fuel || estimate.hazardous_materials || 
              estimate.items_tied_bags || estimate.oversized_items || estimate.mold_present || 
              estimate.pests_present || estimate.sharp_objects || estimate.heavy_lifting_required || 
              estimate.disassembly_required) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Special Considerations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {estimate.items_filled_water && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-700">Items filled with water</span>
                    </div>
                  )}
                  {estimate.items_filled_oil_fuel && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-700">Items filled with oil/fuel</span>
                    </div>
                  )}
                  {estimate.hazardous_materials && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-700">Hazardous materials present</span>
                    </div>
                  )}
                  {estimate.items_tied_bags && (
                    <div className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-green-700">Items in tied bags</span>
                    </div>
                  )}
                  {estimate.oversized_items && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-orange-700">Oversized items</span>
                    </div>
                  )}
                  {estimate.mold_present && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-700">Mold present</span>
                    </div>
                  )}
                  {estimate.pests_present && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-700">Pests present</span>
                    </div>
                  )}
                  {estimate.sharp_objects && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-700">Sharp objects</span>
                    </div>
                  )}
                  {estimate.heavy_lifting_required && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-orange-700">Heavy lifting required</span>
                    </div>
                  )}
                  {estimate.disassembly_required && (
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-orange-700">Disassembly required</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Services */}
            {(estimate.request_donation_pickup || estimate.request_demolition_addon) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
                  Additional Services
                </h3>
                <div className="space-y-2 text-sm">
                  {estimate.request_donation_pickup && (
                    <div className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-green-700">Donation pickup requested</span>
                    </div>
                  )}
                  {estimate.request_demolition_addon && (
                    <div className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-green-700">Demolition add-on requested</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {estimate.additional_notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  Additional Notes
                </h3>
                <p className="text-gray-900 text-sm leading-relaxed">{estimate.additional_notes}</p>
              </div>
            )}

            {/* How Did You Hear */}
            {estimate.how_did_you_hear && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-600" />
                  Referral Source
                </h3>
                <p className="text-gray-900 text-sm">{estimate.how_did_you_hear}</p>
              </div>
            )}

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
