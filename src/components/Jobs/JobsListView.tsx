import React, { useState, useMemo } from 'react';
import { Job, EstimateRequest } from '../../types';
import JobDetailsModal from './JobDetailsModal';
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  X,
  Eye,
  User,
  Phone,
  Mail,
  Package,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';

interface JobsListViewProps {
  jobs: EstimateRequest[];
  onJobSelect?: (job: EstimateRequest) => void;
  onJobUpdated?: (updatedJob: EstimateRequest) => void;
  onJobDeleted?: (jobId: number) => void;
}

const JobsListView: React.FC<JobsListViewProps> = ({ 
  jobs, 
  onJobSelect, 
  onJobUpdated, 
  onJobDeleted 
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<EstimateRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateRequest | null>(null);

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const customerName = job.full_name || 'Unknown Customer';
      const address = job.service_address || '';
      
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [jobs, statusFilter, searchTerm]);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    if (onJobUpdated) {
      onJobUpdated(updatedJob);
    }
  };

  const handleJobDeleted = (jobId: number) => {
    if (onJobDeleted) {
      onJobDeleted(jobId);
    }
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleViewEstimateDetails = (estimate: EstimateRequest) => {
    setSelectedEstimate(estimate);
    setShowEstimateModal(true);
  };

  const handleCloseEstimateModal = () => {
    setShowEstimateModal(false);
    setSelectedEstimate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'need review':
        return 'bg-orange-100 text-orange-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'need review':
        return <AlertCircle className="w-4 h-4" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4" />;
      case 'quoted':
        return <DollarSign className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'in progress':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      case 'declined':
        return <X className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs by customer name, address, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        >
          <option value="all">All Status</option>
          <option value="accepted">Accepted</option>
          <option value="scheduled">Scheduled</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow">
        {jobs.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No jobs found. Create your first job to get started.</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No jobs found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <div key={job.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 cursor-pointer" onClick={() => handleJobClick(job)}>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {job.full_name || 'Unknown Customer'} - #{job.id}
                      </h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status || 'need review')}`}>
                          {getStatusIcon(job.status || 'need review')}
                          <span className="ml-1 capitalize">{(job.status || 'need review').replace('-', ' ')}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.request_priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <span className="ml-1 capitalize">{job.request_priority || 'standard'}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.is_new_client ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          <span className="ml-1">{job.is_new_client ? 'New Client' : 'Existing Client'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-gray-600 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {job.service_address || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : 'N/A'}</span>
                      </div>

                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{job.preferred_time || 'N/A'}</span>
                      </div>

                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <DollarSign className="w-4 h-4 flex-shrink-0" />
                        <span>${job.quote_amount ? parseFloat(job.quote_amount).toLocaleString() : 'Not quoted'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-gray-600 mt-2 text-center sm:text-left">
                      <div>
                        <span className="font-medium">Volume:</span> {job.approximate_volume || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Items:</span> {job.approximate_item_count || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {job.location_on_property || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Gate Code:</span> {job.gate_code || 'N/A'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600 mt-2 text-center sm:text-left">
                      <div>
                        <span className="font-medium">Materials:</span> {job.material_types?.join(', ') || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {job.phone_number ? (
                          <button
                            onClick={() => handleCall(job.phone_number)}
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer ml-1"
                          >
                            {job.phone_number}
                          </button>
                        ) : (
                          <span className="ml-1">N/A</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {job.email_address || 'N/A'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-gray-600 mt-2 text-center sm:text-left">
                      <div>
                        <span className="font-medium">Created:</span> {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {new Date(job.updated_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Source:</span> {job.how_did_you_hear || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">OK to Text:</span> {job.ok_to_text ? 'Yes' : 'No'}
                      </div>
                    </div>

                    {job.access_considerations && (
                      <div className="mt-2 text-center sm:text-left">
                        <span className="text-sm font-medium text-gray-700">Access:</span>
                        <p className="text-sm text-gray-600">{job.access_considerations}</p>
                      </div>
                    )}

                    {job.additional_notes && (
                      <div className="mt-2 text-center sm:text-left">
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 line-clamp-2">{job.additional_notes}</p>
                      </div>
                    )}

                    {/* Special Considerations */}
                    <div className="mt-2 flex flex-wrap gap-1 justify-center sm:justify-start">
                      {[
                        { key: 'items_filled_water', label: 'Water', icon: '💧' },
                        { key: 'items_filled_oil_fuel', label: 'Oil/Fuel', icon: '⛽' },
                        { key: 'hazardous_materials', label: 'Hazardous', icon: '⚠️' },
                        { key: 'oversized_items', label: 'Oversized', icon: '📦' },
                        { key: 'mold_present', label: 'Mold', icon: '🦠' },
                        { key: 'pests_present', label: 'Pests', icon: '🐛' },
                        { key: 'sharp_objects', label: 'Sharp', icon: '🔪' },
                        { key: 'heavy_lifting_required', label: 'Heavy', icon: '🏋️' },
                        { key: 'disassembly_required', label: 'Disassembly', icon: '🔧' },
                        { key: 'request_donation_pickup', label: 'Donation', icon: '❤️' },
                        { key: 'request_demolition_addon', label: 'Demolition', icon: '🏗️' }
                      ].filter(({ key }) => job[key as keyof EstimateRequest]).map(({ key, label, icon }) => (
                        <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <span className="mr-1">{icon}</span>
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-col-reverse sm:items-end space-y-2 sm:space-y-0">
                    <div className="flex flex-col sm:items-end text-sm text-gray-500 space-y-1 text-center sm:text-right">
                      <div>Estimate ID: <span className="font-medium">#{job.id}</span></div>
                      <div>Status: <span className="font-medium capitalize">{job.status || 'pending'}</span></div>
                      {job.quote_amount && (
                        <div>Quote: <span className="font-medium text-green-600">${parseFloat(job.quote_amount).toLocaleString()}</span></div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center sm:items-stretch">
                      <button
                        onClick={() => handleViewEstimateDetails(job)}
                        className="w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                      {/* <button
                        onClick={() => handleJobClick(job)}
                        className="w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button> */}
                      {onJobSelect && (
                        <button
                          onClick={() => onJobSelect(job)}
                          className="w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Track Progress
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onJobUpdated={handleJobUpdated}
          onJobDeleted={handleJobDeleted}
        />
      )}

      {/* Estimate Details Modal */}
      {showEstimateModal && selectedEstimate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedEstimate.full_name} - #{selectedEstimate.id} - {selectedEstimate.status?.toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedEstimate.service_address} • {selectedEstimate.approximate_volume} • 
                  {selectedEstimate.quote_amount ? ` $${parseFloat(selectedEstimate.quote_amount).toLocaleString()}` : ' Not quoted'}
                </p>
              </div>
              <button
                onClick={handleCloseEstimateModal}
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
                    <div className="text-2xl font-bold text-blue-600">#{selectedEstimate.id}</div>
                    <div className="text-sm text-gray-600">Estimate ID</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold px-3 py-1 rounded-full inline-block ${
                      selectedEstimate.status === 'quoted' ? 'bg-green-100 text-green-800' :
                      selectedEstimate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEstimate.status?.toUpperCase() || 'PENDING'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Status</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold px-3 py-1 rounded-full inline-block ${
                      selectedEstimate.request_priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEstimate.request_priority?.toUpperCase() || 'STANDARD'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedEstimate.quote_amount ? `$${parseFloat(selectedEstimate.quote_amount).toLocaleString()}` : 'Not Quoted'}
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
                        <div className="text-lg font-semibold text-gray-900">{selectedEstimate.full_name || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Phone Number</div>
                        {selectedEstimate.phone_number ? (
                          <button
                            onClick={() => handleCall(selectedEstimate.phone_number)}
                            className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                          >
                            {selectedEstimate.phone_number}
                          </button>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">N/A</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Email Address</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedEstimate.email_address || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Client Type</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedEstimate.is_new_client ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedEstimate.is_new_client ? 'New Client' : 'Existing Client'}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Text Permission</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedEstimate.ok_to_text ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedEstimate.ok_to_text ? 'Yes - OK to Text' : 'No - Do Not Text'}
                      </div>
                    </div>
                    {selectedEstimate.existing_customer_name && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm font-medium text-green-700 mb-1">Existing Customer Details</div>
                        <div className="text-sm text-green-800">
                          <div><strong>Name:</strong> {selectedEstimate.existing_customer_name}</div>
                          <div><strong>Email:</strong> {selectedEstimate.existing_customer_email}</div>
                          <div><strong>Phone:</strong> {selectedEstimate.existing_customer_phone}</div>
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
                      <p className="text-lg font-semibold text-gray-900">{selectedEstimate.service_address || 'N/A'}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Location on Property</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedEstimate.location_on_property || 'N/A'}</div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Gate Code</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedEstimate.gate_code || 'N/A'}</div>
                    </div>
                    
                    {selectedEstimate.apartment_unit && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Apartment Unit</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedEstimate.apartment_unit}</div>
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
                        {selectedEstimate.preferred_date ? new Date(selectedEstimate.preferred_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Preferred Time</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">{selectedEstimate.preferred_time || 'N/A'}</div>
                    </div>
                    
                    {selectedEstimate.access_considerations && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-sm font-medium text-yellow-700 mb-1">Access Considerations</div>
                        <div className="text-sm text-gray-900">{selectedEstimate.access_considerations}</div>
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
                      <div className="text-xl font-bold text-gray-900">{selectedEstimate.approximate_volume || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Approximate Item Count</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedEstimate.approximate_item_count || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-700 mb-2">Material Types</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedEstimate.material_types?.map((material, index) => (
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
                      <div className="text-lg font-semibold text-gray-900">{selectedEstimate.how_did_you_hear || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Request Date</div>
                      <div className="text-lg font-semibold text-gray-900">{new Date(selectedEstimate.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Last Updated</div>
                      <div className="text-lg font-semibold text-gray-900">{new Date(selectedEstimate.updated_at).toLocaleDateString()}</div>
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
                    const isActive = selectedEstimate[key as keyof EstimateRequest];
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
              {selectedEstimate.additional_notes && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                    Additional Notes
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">
                      {selectedEstimate.additional_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Quote Information */}
              {(selectedEstimate.quote_amount || selectedEstimate.quote_notes) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    Quote Information
                  </h3>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedEstimate.quote_amount && (
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-700 mb-2">Quote Amount</div>
                          <div className="text-4xl font-bold text-green-900">
                            ${parseFloat(selectedEstimate.quote_amount).toLocaleString()}
                          </div>
                        </div>
                      )}
                      {selectedEstimate.quote_notes && (
                        <div>
                          <div className="text-sm font-medium text-green-700 mb-2">Quote Notes</div>
                          <div className="bg-white border border-green-200 rounded-lg p-3">
                            <p className="text-gray-800">{selectedEstimate.quote_notes}</p>
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
      )}
    </div>
  );
};

export default JobsListView;
