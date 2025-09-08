import React from 'react';
import { EstimateRequest } from '../../types';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Package,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface JobDetailsModalProps {
  job: EstimateRequest;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated: (updatedJob: EstimateRequest) => void;
  onJobDeleted: (jobId: number) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onJobUpdated,
  onJobDeleted
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {job.full_name} - #{job.id} - {job.status?.toUpperCase()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {job.service_address} • {job.approximate_volume} • 
              {job.quote_amount ? ` $${parseFloat(job.quote_amount).toLocaleString()}` : ' Not quoted'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Estimate Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Estimate Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">#{job.id}</div>
                <div className="text-sm text-gray-600">Estimate ID</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold px-3 py-1 rounded-full inline-block ${
                  job.status === 'quoted' ? 'bg-green-100 text-green-800' :
                  job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {job.status?.toUpperCase() || 'PENDING'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Status</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold px-3 py-1 rounded-full inline-block ${
                  job.request_priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.request_priority?.toUpperCase() || 'STANDARD'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Priority</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {job.quote_amount ? `$${parseFloat(job.quote_amount).toLocaleString()}` : 'Not Quoted'}
                </div>
                <div className="text-sm text-gray-600">Quote Amount</div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Full Name</div>
                    <div className="text-lg font-semibold text-gray-900">{job.full_name || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Phone Number</div>
                    <div className="text-lg font-semibold text-gray-900">{job.phone_number || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Email Address</div>
                    <div className="text-lg font-semibold text-gray-900">{job.email_address || 'N/A'}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Client Type</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    job.is_new_client ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {job.is_new_client ? 'New Client' : 'Existing Client'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Text Permission</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    job.ok_to_text ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {job.ok_to_text ? 'Yes - OK to Text' : 'No - Do Not Text'}
                  </div>
                </div>
                {job.existing_customer_name && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-700 mb-1">Existing Customer Details</div>
                    <div className="text-sm text-green-800">
                      <div><strong>Name:</strong> {job.existing_customer_name}</div>
                      <div><strong>Email:</strong> {job.existing_customer_email}</div>
                      <div><strong>Phone:</strong> {job.existing_customer_phone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 text-green-600 mr-2" />
              Service Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Service Address</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{job.service_address || 'N/A'}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Location on Property</div>
                  <div className="text-lg font-semibold text-gray-900">{job.location_on_property || 'N/A'}</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Gate Code</div>
                  <div className="text-lg font-semibold text-gray-900">{job.gate_code || 'N/A'}</div>
                </div>
                
                {job.apartment_unit && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">Apartment Unit</div>
                    <div className="text-lg font-semibold text-gray-900">{job.apartment_unit}</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Preferred Date</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Preferred Time</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{job.preferred_time || 'N/A'}</div>
                </div>
                
                {job.access_considerations && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-700 mb-1">Access Considerations</div>
                    <div className="text-sm text-gray-900">{job.access_considerations}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items and Materials */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 text-orange-600 mr-2" />
              Items and Materials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm font-medium text-orange-700 mb-1">Approximate Volume</div>
                  <div className="text-xl font-bold text-gray-900">{job.approximate_volume || 'N/A'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Approximate Item Count</div>
                  <div className="text-lg font-semibold text-gray-900">{job.approximate_item_count || 'N/A'}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-700 mb-2">Material Types</div>
                  <div className="flex flex-wrap gap-2">
                    {job.material_types?.map((material, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {material}
                      </span>
                    )) || <span className="text-gray-500">N/A</span>}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm font-medium text-purple-700 mb-1">How did you hear about us</div>
                  <div className="text-lg font-semibold text-gray-900">{job.how_did_you_hear || 'N/A'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Request Date</div>
                  <div className="text-lg font-semibold text-gray-900">{new Date(job.created_at).toLocaleDateString()}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Last Updated</div>
                  <div className="text-lg font-semibold text-gray-900">{new Date(job.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Considerations */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              Special Considerations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'items_filled_water', label: 'Items Filled with Water', icon: '💧', color: 'blue' },
                { key: 'items_filled_oil_fuel', label: 'Items Filled with Oil/Fuel', icon: '⛽', color: 'orange' },
                { key: 'hazardous_materials', label: 'Hazardous Materials', icon: '⚠️', color: 'red' },
                { key: 'items_tied_bags', label: 'Items Tied in Bags', icon: '🎒', color: 'gray' },
                { key: 'oversized_items', label: 'Oversized Items', icon: '📦', color: 'purple' },
                { key: 'mold_present', label: 'Mold Present', icon: '🦠', color: 'green' },
                { key: 'pests_present', label: 'Pests Present', icon: '🐛', color: 'yellow' },
                { key: 'sharp_objects', label: 'Sharp Objects', icon: '🔪', color: 'red' },
                { key: 'heavy_lifting_required', label: 'Heavy Lifting Required', icon: '🏋️', color: 'blue' },
                { key: 'disassembly_required', label: 'Disassembly Required', icon: '🔧', color: 'gray' },
                { key: 'request_donation_pickup', label: 'Request Donation Pickup', icon: '❤️', color: 'pink' },
                { key: 'request_demolition_addon', label: 'Request Demolition Addon', icon: '🏗️', color: 'orange' }
              ].map(({ key, label, icon, color }) => {
                const isActive = job[key as keyof EstimateRequest];
                return (
                  <div key={key} className={`p-3 rounded-lg border-2 transition-all ${
                    isActive 
                      ? `bg-${color}-50 border-${color}-200` 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          isActive ? `text-${color}-700` : 'text-gray-500'
                        }`}>
                          {label}
                        </div>
                        <div className={`text-xs ${
                          isActive ? `text-${color}-600` : 'text-gray-400'
                        }`}>
                          {isActive ? 'Yes' : 'No'}
                        </div>
                      </div>
                      {isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          {job.additional_notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                Additional Notes
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">
                  {job.additional_notes}
                </p>
              </div>
            </div>
          )}

          {/* Quote Information */}
          {(job.quote_amount || job.quote_notes) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                Quote Information
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {job.quote_amount && (
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-700 mb-2">Quote Amount</div>
                      <div className="text-4xl font-bold text-green-900">
                        ${parseFloat(job.quote_amount).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {job.quote_notes && (
                    <div>
                      <div className="text-sm font-medium text-green-700 mb-2">Quote Notes</div>
                      <div className="bg-white border border-green-200 rounded-lg p-3">
                        <p className="text-gray-800">{job.quote_notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;