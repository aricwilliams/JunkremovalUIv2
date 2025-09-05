import React, { useState } from 'react';
import {
  Calculator,
  Plus,
  Minus,
  Mail,
  Phone,
  Download,
  Calendar,
  Users,
  FileText,
  Edit,
  Trash2,
  Eye,
  Package,
  X,
  MapPin,
  User,
  Info,
  AlertTriangle,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { ClientRequest, Estimate, PricingItem, Customer } from '../../types';
import { EstimateRequest } from '../../services/estimatesService';
import { useApp } from '../../contexts/AppContext';

const EstimatesDashboard: React.FC = () => {
  const { customers, estimates, refreshEstimates } = useApp();
  const [activeTab, setActiveTab] = useState<'requests' | 'estimates' | 'pricing'>('estimates');
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateRequest | null>(null);
  const [showCreateEstimate, setShowCreateEstimate] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showEstimateDetails, setShowEstimateDetails] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);

  // Filter estimates based on quote amount
  const requests = estimates.filter(estimate => !estimate.quote_amount || estimate.quote_amount === 0);
  const quotedEstimates = estimates.filter(estimate => estimate.quote_amount && estimate.quote_amount > 0);
  
  // Debug logging
  console.log('🔍 Estimates Debug:', {
    totalEstimates: estimates.length,
    requests: requests.length,
    quotedEstimates: quotedEstimates.length,
    allEstimates: estimates,
    filteredQuotedEstimates: quotedEstimates
  });

  // New request form data
  const [requestFormData, setRequestFormData] = useState({
    isNewCustomer: true,
    selectedCustomerId: '',
    fullName: '',
    phone: '',
    email: '',
    serviceAddress: '',
    gateCode: '',
    apartmentNumber: '',
    preferredDate: '',
    preferredTime: '',
    locationOnProperty: '',
    approximateVolume: '',
    accessConsiderations: '',
    photos: [] as File[],
    videos: [] as File[],
    materialTypes: [] as string[],
    approximateItemCount: '',
    filledWithWater: false,
    filledWithOil: false,
    hazardousMaterial: false,
    hazardousDescription: '',
    itemsInBags: false,
    bagContents: '',
    oversizedItems: false,
    oversizedDescription: '',
    hasMold: false,
    hasPests: false,
    hasSharpObjects: false,
    heavyLiftingRequired: false,
    disassemblyRequired: false,
    disassemblyDescription: '',
    additionalNotes: '',
    requestDonationPickup: false,
    requestDemolition: false,
    demolitionDescription: '',
    howDidYouHear: '',
    priority: 'standard' as 'standard' | 'urgent',
    textOptIn: false,
    understandPricing: false
  });



  // Mock pricing items
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([
    {
      id: 'price-1',
      name: 'General Waste',
      category: 'Waste',
      basePrice: 150,
      pricePerUnit: 25,
      estimatedTime: 2,
      difficulty: 'easy',
      description: 'General household and office waste',
      volume: { weight: 800, yardage: 12 }
    },
    {
      id: 'price-2',
      name: 'Furniture',
      category: 'Furniture',
      basePrice: 75,
      pricePerUnit: 50,
      estimatedTime: 1.5,
      difficulty: 'medium',
      description: 'Furniture removal and disposal',
      volume: { weight: 200, yardage: 4 }
    },
    {
      id: 'price-3',
      name: 'Appliances',
      category: 'Appliances',
      basePrice: 100,
      pricePerUnit: 75,
      estimatedTime: 2,
      difficulty: 'hard',
      description: 'Large appliance removal',
      volume: { weight: 300, yardage: 6 }
    },
    {
      id: 'price-4',
      name: 'Construction Debris',
      category: 'Construction',
      basePrice: 200,
      pricePerUnit: 100,
      estimatedTime: 3,
      difficulty: 'hard',
      description: 'Construction and renovation debris',
      volume: { weight: 1000, yardage: 15 }
    }
  ]);


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstimateStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const handleCreateEstimate = (request: EstimateRequest) => {
    setSelectedRequest(request as any); // Convert EstimateRequest to ClientRequest for compatibility
    setShowCreateEstimate(true);
  };


  const handleViewEstimate = (estimate: EstimateRequest) => {
    setSelectedEstimate(estimate);
    setShowEstimateDetails(true);
  };

  // New request form handlers
  const handleCustomerSelection = (isNewCustomer: boolean, customerId?: string) => {
    if (isNewCustomer) {
      setRequestFormData({
        ...requestFormData,
        isNewCustomer: true,
        selectedCustomerId: '',
        fullName: '',
        phone: '',
        email: '',
        serviceAddress: ''
      });
    } else {
      const selectedCustomer = customers.find(c => c.id.toString() === customerId);
      setRequestFormData({
        ...requestFormData,
        isNewCustomer: false,
        selectedCustomerId: customerId || '',
        fullName: selectedCustomer?.name || '',
        phone: selectedCustomer?.phone || '',
        email: selectedCustomer?.email || '',
        serviceAddress: selectedCustomer?.address || ''
      });
    }
  };


  const handleMaterialTypeToggle = (materialType: string) => {
    setRequestFormData({
      ...requestFormData,
      materialTypes: requestFormData.materialTypes.includes(materialType)
        ? requestFormData.materialTypes.filter(type => type !== materialType)
        : [...requestFormData.materialTypes, materialType]
    });
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form based on customer type
    if (!requestFormData.isNewCustomer && !requestFormData.selectedCustomerId) {
      alert('Please select an existing customer');
      return;
    }

    if (requestFormData.isNewCustomer && (!requestFormData.fullName || !requestFormData.phone || !requestFormData.email || !requestFormData.serviceAddress)) {
      alert('Please fill in all required fields for new customer');
      return;
    }

    // Create a new request with the form data (for future database integration)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newRequest: ClientRequest = {
      id: `req-${Date.now()}`,
      customerId: requestFormData.isNewCustomer ? `new-${Date.now()}` : requestFormData.selectedCustomerId,
      customerName: requestFormData.isNewCustomer ? requestFormData.fullName : customers.find(c => c.id.toString() === requestFormData.selectedCustomerId)?.name || 'Unknown Customer',
      type: 'pickup',
      priority: requestFormData.priority,
      status: 'pending',
      subject: `Junk Removal Request - ${requestFormData.isNewCustomer ? requestFormData.fullName : customers.find(c => c.id.toString() === requestFormData.selectedCustomerId)?.name || 'Unknown Customer'}`,
      description: `Request from ${requestFormData.isNewCustomer ? requestFormData.fullName : customers.find(c => c.id.toString() === requestFormData.selectedCustomerId)?.name || 'Unknown Customer'} for junk removal service.`,
      requestedDate: new Date(),
      preferredDate: requestFormData.preferredDate ? new Date(requestFormData.preferredDate) : new Date(),
      preferredTime: requestFormData.preferredTime || 'Flexible',
      location: {
        address: requestFormData.serviceAddress,
        city: 'Wilmington',
        state: 'NC',
        zipCode: '28401'
      },
      volume: {
        weight: 0,
        yardage: 0
      },
      attachments: [...requestFormData.photos.map(f => f.name), ...requestFormData.videos.map(f => f.name)],
      notes: requestFormData.additionalNotes,
      created: new Date(),
      updated: new Date(),
      fullName: requestFormData.fullName,
      phone: requestFormData.phone,
      email: requestFormData.email,
      serviceAddress: requestFormData.serviceAddress,
      gateCode: requestFormData.gateCode,
      apartmentNumber: requestFormData.apartmentNumber,
      locationOnProperty: requestFormData.locationOnProperty,
      approximateVolume: requestFormData.approximateVolume,
      accessConsiderations: requestFormData.accessConsiderations,
      materialTypes: requestFormData.materialTypes,
      approximateItemCount: requestFormData.approximateItemCount,
      filledWithWater: requestFormData.filledWithWater,
      filledWithOil: requestFormData.filledWithOil,
      hazardousMaterial: requestFormData.hazardousMaterial,
      hazardousDescription: requestFormData.hazardousDescription,
      itemsInBags: requestFormData.itemsInBags,
      bagContents: requestFormData.bagContents,
      oversizedItems: requestFormData.oversizedItems,
      oversizedDescription: requestFormData.oversizedDescription,
      hasMold: requestFormData.hasMold,
      hasPests: requestFormData.hasPests,
      hasSharpObjects: requestFormData.hasSharpObjects,
      heavyLiftingRequired: requestFormData.heavyLiftingRequired,
      disassemblyRequired: requestFormData.disassemblyRequired,
      disassemblyDescription: requestFormData.disassemblyDescription,
      additionalNotes: requestFormData.additionalNotes,
      requestDonationPickup: requestFormData.requestDonationPickup,
      requestDemolition: requestFormData.requestDemolition,
      demolitionDescription: requestFormData.demolitionDescription,
      howDidYouHear: requestFormData.howDidYouHear,
      textOptIn: requestFormData.textOptIn,
      canCreateEstimate: true,
      estimateStatus: 'pending'
    };

    // Note: In a real app, this would create the request in the database
    // and the estimates would be refreshed from the API
    console.log('New request created:', newRequest);
    
    // Reset form
    setRequestFormData({
      isNewCustomer: true,
      selectedCustomerId: '',
      fullName: '',
      phone: '',
      email: '',
      serviceAddress: '',
      gateCode: '',
      apartmentNumber: '',
      preferredDate: '',
      preferredTime: '',
      locationOnProperty: '',
      approximateVolume: '',
      accessConsiderations: '',
      photos: [],
      videos: [],
      materialTypes: [],
      approximateItemCount: '',
      filledWithWater: false,
      filledWithOil: false,
      hazardousMaterial: false,
      hazardousDescription: '',
      itemsInBags: false,
      bagContents: '',
      oversizedItems: false,
      oversizedDescription: '',
      hasMold: false,
      hasPests: false,
      hasSharpObjects: false,
      heavyLiftingRequired: false,
      disassemblyRequired: false,
      disassemblyDescription: '',
      additionalNotes: '',
      requestDonationPickup: false,
      requestDemolition: false,
      demolitionDescription: '',
      howDidYouHear: '',
      priority: 'standard',
      textOptIn: false,
      understandPricing: false
    });

    setShowNewRequest(false);
    alert('Request submitted successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estimates & Client Requests</h1>
          <p className="text-gray-600">Manage client portal requests and create estimates</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowNewRequest(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Request</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {[
              { id: 'requests', label: 'Pending Requests', icon: FileText, badge: requests.length },
              { id: 'estimates', label: 'Quoted Estimates', icon: Calculator, badge: quotedEstimates.length },
             // { id: 'pricing', label: 'Pricing Items', icon: DollarSign, badge: pricingItems.length }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Client Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pending Client Requests</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={refreshEstimates}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    title="Refresh Requests"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-500">All requests have been quoted or there are no requests yet.</p>
                  </div>
                ) : (
                  requests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Request #{request.id}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstimateStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.request_priority)}`}>
                            {request.request_priority.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{request.is_new_client ? request.full_name : request.existing_customer_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{request.is_new_client ? request.phone_number : request.existing_customer_phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{request.is_new_client ? request.email_address : request.existing_customer_email || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.service_address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{request.approximate_volume}</span>
                          </div>
                        </div>

                        {request.additional_notes && (
                          <p className="text-sm text-gray-600 mb-2">{request.additional_notes}</p>
                        )}

                        {request.material_types && request.material_types.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {request.material_types.map((type, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleViewEstimate(request)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                          <button
                            onClick={() => handleCreateEstimate(request)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            <Calculator className="w-4 h-4" />
                          <span>Create Quote</span>
                          </button>
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          )}

          {/* Estimates Tab */}
          {activeTab === 'estimates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Estimates</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={refreshEstimates}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    title="Refresh Estimates"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {quotedEstimates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quoted estimates found</h3>
                    <p className="text-gray-500">Create quotes for pending requests to see them here.</p>
                  </div>
                ) : (
                  quotedEstimates.map((estimate) => (
                    <div key={estimate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Estimate #{estimate.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstimateStatusColor(estimate.status)}`}>
                            {estimate.status.toUpperCase()}
                          </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(estimate.request_priority)}`}>
                              {estimate.request_priority.toUpperCase()}
                            </span>
                        </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <div className="font-medium text-gray-900">Customer Information</div>
                              <div>Name: {estimate.is_new_client ? estimate.full_name : estimate.existing_customer_name || 'N/A'}</div>
                              <div>Phone: {estimate.is_new_client ? estimate.phone_number : estimate.existing_customer_phone || 'N/A'}</div>
                              <div>Email: {estimate.is_new_client ? estimate.email_address : estimate.existing_customer_email || 'N/A'}</div>
                        </div>
                            <div>
                              <div className="font-medium text-gray-900">Service Details</div>
                              <div>Address: {estimate.service_address}</div>
                              <div>Location: {estimate.location_on_property}</div>
                              <div>Volume: {estimate.approximate_volume}</div>
                              <div>Materials: {estimate.material_types.join(', ')}</div>
                            </div>
                          </div>
                          {estimate.quote_amount && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <div className="text-sm font-medium text-green-800">
                                Quote Amount: ${estimate.quote_amount.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {estimate.additional_notes && (
                            <p className="mt-2 text-sm text-gray-600">Notes: {estimate.additional_notes}</p>
                          )}
                          <div className="mt-2 text-xs text-gray-500">
                            Created: {new Date(estimate.created_at).toLocaleDateString()} at {new Date(estimate.created_at).toLocaleTimeString()}
                      </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleViewEstimate(estimate)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Download PDF"
                          >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Pricing Items Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pricing Items</h2>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pricingItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-lg font-bold text-green-600">${item.basePrice}</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Category: {item.category}</div>
                      <div>Per Unit: ${item.pricePerUnit}</div>
                      <div>Time: {item.estimatedTime} hrs</div>
                      <div>Difficulty: {item.difficulty}</div>
                      <div>Volume: {item.volume.weight} lbs, {item.volume.yardage} yds³</div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    <div className="flex space-x-2 mt-3">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onCreateEstimate={() => {
            setShowCreateEstimate(true);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Create Estimate Modal */}
      {showCreateEstimate && selectedRequest && (
        <CreateEstimateModal
          request={selectedRequest}
          pricingItems={pricingItems}
          onClose={() => {
            setShowCreateEstimate(false);
            setSelectedRequest(null);
          }}
          onSave={(_estimate) => {
            setShowCreateEstimate(false);
            setSelectedRequest(null);
            // Note: In a real app, this would update the estimate in the database
            // and the estimates would be refreshed from the API
          }}
        />
      )}

      {/* New Request Modal */}
      {showNewRequest && (
        <NewRequestModal
          onClose={() => setShowNewRequest(false)}
          onSubmit={handleSubmitRequest}
          formData={requestFormData}
          setFormData={setRequestFormData}
          handleMaterialTypeToggle={handleMaterialTypeToggle}
          customers={customers}
          handleCustomerSelection={handleCustomerSelection}
        />
      )}

      {/* Add Pricing Item Modal */}
      {showPricingModal && (
        <AddPricingItemModal
          onClose={() => setShowPricingModal(false)}
          onSave={(item) => {
            setPricingItems(prev => [...prev, { ...item, id: `price-${Date.now()}` }]);
            setShowPricingModal(false);
          }}
        />
      )}

      {/* Estimate Details Modal */}
      {showEstimateDetails && selectedEstimate && (
        <EstimateDetailsModal
          estimate={selectedEstimate}
          onClose={() => {
            setShowEstimateDetails(false);
            setSelectedEstimate(null);
          }}
        />
      )}
    </div>
  );
};

// Request Details Modal Component
interface RequestDetailsModalProps {
  request: ClientRequest;
  onClose: () => void;
  onCreateEstimate: () => void;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ request, onClose, onCreateEstimate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{request.subject}</h2>
            <p className="text-sm text-gray-600 mt-1">Client Request Details</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-sm text-gray-900">{request.fullName || request.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900">{request.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{request.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Address</label>
                <p className="text-sm text-gray-900">{request.serviceAddress || request.location.address}</p>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{request.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location on Property</label>
                <p className="text-sm text-gray-900">{request.locationOnProperty || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Approximate Volume</label>
                <p className="text-sm text-gray-900">{request.approximateVolume || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Material Types</label>
                <div className="flex flex-wrap gap-1">
                  {request.materialTypes?.map((type, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {type}
                    </span>
                  )) || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Special Conditions */}
          {(request.hazardousMaterial || request.hasMold || request.hasPests || request.heavyLiftingRequired) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Special Conditions</h3>
              <div className="space-y-2">
                {request.hazardousMaterial && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-900">Hazardous materials: {request.hazardousDescription}</span>
                  </div>
                )}
                {request.hasMold && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-900">Mold present</span>
                  </div>
                )}
                {request.hasPests && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-900">Pests present</span>
                  </div>
                )}
                {request.heavyLiftingRequired && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-900">Heavy lifting required</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
              <p className="text-sm text-gray-900">{request.notes}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            {request.canCreateEstimate && request.estimateStatus === 'pending' && (
              <button
                onClick={onCreateEstimate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Create Estimate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Estimate Modal Component
interface CreateEstimateModalProps {
  request: ClientRequest;
  pricingItems: PricingItem[];
  onClose: () => void;
  onSave: (estimate: Estimate) => void;
}

const CreateEstimateModal: React.FC<CreateEstimateModalProps> = ({ request, pricingItems, onClose, onSave }) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [laborHours, setLaborHours] = useState(2);
  const [laborRate] = useState(50);
  const [additionalFees, setAdditionalFees] = useState({
    disposal: 0,
    travel: 0,
    difficulty: 0
  });
  const [notes, setNotes] = useState('');

  const handleItemQuantityChange = (itemId: string, change: number) => {
    setSelectedItems(prev => {
      const newQuantity = Math.max(0, (prev[itemId] || 0) + change);
      if (newQuantity === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const calculateItemTotal = (itemId: string) => {
    const quantity = selectedItems[itemId] || 0;
    const item = pricingItems.find(p => p.id === itemId);
    return quantity * (item?.basePrice || 0);
  };

  const calculateItemsSubtotal = () => {
    return Object.keys(selectedItems).reduce((total, itemId) => {
      return total + calculateItemTotal(itemId);
    }, 0);
  };

  const calculateLaborCost = () => {
    return laborRate * laborHours;
  };

  const calculateAdditionalFees = () => {
    return Object.values(additionalFees).reduce((total, fee) => total + fee, 0);
  };

  const calculateTotal = () => {
    return calculateItemsSubtotal() + calculateLaborCost() + calculateAdditionalFees();
  };

  const handleSaveEstimate = () => {
    const estimateItems = Object.keys(selectedItems).map(itemId => {
      const item = pricingItems.find(p => p.id === itemId);
      const quantity = selectedItems[itemId];
      return {
        id: itemId,
        name: item?.name || '',
        category: item?.category || '',
        quantity,
        basePrice: item?.basePrice || 0,
        total: quantity * (item?.basePrice || 0),
        difficulty: item?.difficulty || 'medium',
        estimatedTime: item?.estimatedTime || 1,
        volume: item?.volume || { weight: 0, yardage: 0 }
      };
    });

    const newEstimate: Estimate = {
      id: `est-${Date.now()}`,
      customerId: request.customerId,
      customerName: request.fullName || request.customerName,
      customerEmail: request.email || '',
      customerPhone: request.phone || '',
      address: request.serviceAddress || request.location.address,
      city: request.location.city,
      state: request.location.state,
      zipCode: request.location.zipCode,
      items: estimateItems,
      laborHours,
      laborRate,
      additionalFees,
      subtotal: calculateItemsSubtotal(),
      total: calculateTotal(),
      status: 'draft',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: notes || `Estimate created from client request: ${request.subject}`,
      created: new Date(),
      updated: new Date(),
      volume: {
        weight: estimateItems.reduce((sum, item) => sum + (item.volume.weight * item.quantity), 0),
        yardage: estimateItems.reduce((sum, item) => sum + (item.volume.yardage * item.quantity), 0)
      }
    };

    onSave(newEstimate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Estimate from Request</h2>
            <p className="text-sm text-gray-600 mt-1">{request.subject}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{request.fullName || request.customerName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{request.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{request.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">{request.serviceAddress || request.location.address}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">City:</span>
                  <p className="text-gray-900">{request.location.city}, {request.location.state} {request.location.zipCode}</p>
                </div>
              </div>
            </div>

            {/* Items Selection */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items to Remove</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pricingItems.map(item => {
                  const quantity = selectedItems[item.id] || 0;
                  const total = calculateItemTotal(item.id);

                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">${item.basePrice}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleItemQuantityChange(item.id, -1)}
                            disabled={quantity === 0}
                            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>

                          <span className="w-8 text-center font-medium">{quantity}</span>

                          <button
                            onClick={() => handleItemQuantityChange(item.id, 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        {quantity > 0 && (
                          <span className="font-semibold text-gray-900">${total}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Labor and Additional Fees */}
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Labor Hours</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={laborHours}
                      onChange={(e) => setLaborHours(Number(e.target.value))}
                      min="0.5"
                      step="0.5"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">hours @ ${laborRate}/hr</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Fees</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Disposal Fee</span>
                      <input
                        type="number"
                        value={additionalFees.disposal}
                        onChange={(e) => setAdditionalFees(prev => ({ ...prev, disposal: Number(e.target.value) }))}
                        min="0"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Travel Fee</span>
                      <input
                        type="number"
                        value={additionalFees.travel}
                        onChange={(e) => setAdditionalFees(prev => ({ ...prev, travel: Number(e.target.value) }))}
                        min="0"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Difficulty Fee</span>
                      <input
                        type="number"
                        value={additionalFees.difficulty}
                        onChange={(e) => setAdditionalFees(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
                        min="0"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimate Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimate Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Subtotal</span>
                  <span className="font-medium">${calculateItemsSubtotal()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Labor ({laborHours}h @ ${laborRate}/hr)</span>
                  <span className="font-medium">${calculateLaborCost()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Fees</span>
                  <span className="font-medium">${calculateAdditionalFees()}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes for the estimate..."
                />
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSaveEstimate}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Save Estimate</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">
                  * Estimate valid for 30 days. Final price may vary based on actual conditions and accessibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Pricing Item Modal Component
interface AddPricingItemModalProps {
  onClose: () => void;
  onSave: (item: Omit<PricingItem, 'id'>) => void;
}

const AddPricingItemModal: React.FC<AddPricingItemModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: 0,
    pricePerUnit: 0,
    estimatedTime: 1,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    description: '',
    volume: {
      weight: 0,
      yardage: 0
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Pricing Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Furniture, Appliances, Construction Debris"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Furniture, Waste, Construction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Unit</label>
              <input
                type="number"
                min="0"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (hours)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the item and any special considerations..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Weight (lbs)</label>
              <input
                type="number"
                min="0"
                value={formData.volume.weight}
                onChange={(e) => setFormData({
                  ...formData,
                  volume: { ...formData.volume, weight: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Volume (yds³)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.volume.yardage}
                onChange={(e) => setFormData({
                  ...formData,
                  volume: { ...formData.volume, yardage: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// New Request Modal Component
interface NewRequestModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  handleMaterialTypeToggle: (materialType: string) => void;
  customers: Customer[];
  handleCustomerSelection: (isNewCustomer: boolean, customerId?: string) => void;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({
  onClose,
  onSubmit,
  formData,
  setFormData,
  handleMaterialTypeToggle,
  customers,
  handleCustomerSelection
}) => {
  const materialTypeOptions = [
    'Wood', 'Metal', 'Electronics', 'Furniture', 'Appliances',
    'Yard Debris', 'Construction Waste', 'Clothing', 'Books', 'Mixed'
  ];

  const volumeOptions = [
    'Small Load (1-2 items)', 'Half Truck', 'Full Truck', 'Multiple Trucks', 'Unsure'
  ];

  const locationOptions = [
    'Curbside', 'Inside House', 'Garage', 'Upstairs', 'Backyard', 'Basement', 'Attic', 'Mixed'
  ];

  const howDidYouHearOptions = [
    'Google Search', 'Facebook', 'Referral', 'Repeat Customer', 'Yelp', 'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Junk Removal Request</h2>
            <p className="text-sm text-gray-600 mt-1">Tell us about your junk removal project for a custom quote</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-8">
          {/* Customer Selection */}
              <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isNewCustomer}
                    onChange={() => {
                      if (!formData.isNewCustomer) {
                        handleCustomerSelection(true);
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">New Customer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!formData.isNewCustomer}
                    onChange={() => {
                      if (formData.isNewCustomer) {
                        handleCustomerSelection(false);
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Existing Customer</span>
                </label>
              </div>

              {!formData.isNewCustomer && (
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing Customer</label>
                  <select
                    value={formData.selectedCustomerId}
                    onChange={(e) => handleCustomerSelection(false, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!formData.isNewCustomer}
                  >
                    <option value="">Choose a customer...</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id.toString()}>
                        {customer.name} - {customer.email}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Customer contact information and address will be automatically filled from our records. These fields are read-only when existing customer is selected.
                  </p>
                  {formData.selectedCustomerId && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-700 flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        <strong>{customers.find(c => c.id.toString() === formData.selectedCustomerId)?.name}</strong> selected. Customer information populated (read-only).
                      </p>
              </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Basic Contact Info */}
              <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Basic Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                  {!formData.isNewCustomer && formData.selectedCustomerId && (
                    <span className="ml-1 text-xs text-blue-600">(from customer record)</span>
                  )}
                </label>
                <input
                  type="text"
                  required={formData.isNewCustomer || !formData.selectedCustomerId}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.isNewCustomer && formData.selectedCustomerId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!formData.isNewCustomer && formData.selectedCustomerId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                  {!formData.isNewCustomer && formData.selectedCustomerId && (
                    <span className="ml-1 text-xs text-blue-600">(from customer record)</span>
                  )}
                </label>
                <input
                  type="tel"
                  required={formData.isNewCustomer || !formData.selectedCustomerId}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.isNewCustomer && formData.selectedCustomerId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!formData.isNewCustomer && formData.selectedCustomerId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                  {!formData.isNewCustomer && formData.selectedCustomerId && (
                    <span className="ml-1 text-xs text-blue-600">(from customer record)</span>
                  )}
                </label>
                <input
                  type="email"
                  required={formData.isNewCustomer || !formData.selectedCustomerId}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.isNewCustomer && formData.selectedCustomerId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!formData.isNewCustomer && formData.selectedCustomerId}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.textOptIn}
                  onChange={(e) => setFormData({ ...formData, textOptIn: e.target.checked })}
                  className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!formData.isNewCustomer && formData.selectedCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!formData.isNewCustomer && formData.selectedCustomerId}
                />
                <span className={`ml-2 text-sm ${!formData.isNewCustomer && formData.selectedCustomerId ? 'text-gray-500' : 'text-gray-700'}`}>OK to text me updates</span>
              </div>
            </div>
          </div>

          {/* Service Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Service Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Address *
                  {!formData.isNewCustomer && formData.selectedCustomerId && (
                    <span className="ml-1 text-xs text-blue-600">(from customer record)</span>
                  )}
                </label>
                <input
                  type="text"
                  required={formData.isNewCustomer || !formData.selectedCustomerId}
                  value={formData.serviceAddress}
                  onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.isNewCustomer && formData.selectedCustomerId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Street address where junk removal will occur"
                  disabled={!formData.isNewCustomer && formData.selectedCustomerId}
                />
              </div>
                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gate Code (if applicable)</label>
                <input
                  type="text"
                  value={formData.gateCode}
                  onChange={(e) => setFormData({ ...formData, gateCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Gate code for access"
                />
                    </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Unit Number</label>
                <input
                  type="text"
                  value={formData.apartmentNumber}
                  onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Apartment or unit number"
                />
                    </div>
                  </div>
                </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Project Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Final scheduling confirmed after quote approval</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  <option value="morning">Morning (8 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 8 PM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location on Property *</label>
                <select
                  required={true}
                  value={formData.locationOnProperty}
                  onChange={(e) => setFormData({ ...formData, locationOnProperty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select location</option>
                  {locationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Volume</label>
                <select
                  value={formData.approximateVolume}
                  onChange={(e) => setFormData({ ...formData, approximateVolume: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select volume</option>
                  {volumeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Considerations</label>
                <textarea
                  value={formData.accessConsiderations}
                  onChange={(e) => setFormData({ ...formData, accessConsiderations: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Stairs, elevator, narrow hallways, locked areas, etc."
                />
              </div>
            </div>
          </div>

          {/* Material Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Material Types
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {materialTypeOptions.map(materialType => (
                <label key={materialType} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.materialTypes.includes(materialType)}
                    onChange={() => handleMaterialTypeToggle(materialType)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{materialType}</span>
                </label>
              ))}
              </div>
                </div>

          {/* Additional Notes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Anything else we should know about your project?"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear about us?</label>
                  <select
                    value={formData.howDidYouHear}
                    onChange={(e) => setFormData({ ...formData, howDidYouHear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select option</option>
                    {howDidYouHearOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'standard' | 'urgent' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="standard">Standard Request</option>
                    <option value="urgent">Urgent/Same Day</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Final Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div>
                <h4 className="font-medium text-blue-900">Important Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This is a request for a quote, not an instant booking. We'll review your request and send you a custom quote within 24 hours.
                  Final scheduling will be confirmed after quote approval.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              required
              checked={formData.understandPricing}
              onChange={(e) => setFormData({ ...formData, understandPricing: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              I understand that final pricing will be provided after review of my request *
            </span>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Request for Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Estimate Details Modal Component
interface EstimateDetailsModalProps {
  estimate: EstimateRequest;
  onClose: () => void;
}

const EstimateDetailsModal: React.FC<EstimateDetailsModalProps> = ({ estimate, onClose }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Estimate Details - #{estimate.id}</h2>
            <p className="text-sm text-gray-600 mt-1">Complete estimate request information</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Estimate Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Estimate Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-blue-700">Status</span>
                <p className="text-lg font-semibold text-blue-900 capitalize">{estimate.status}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Priority</span>
                <p className="text-lg font-semibold text-blue-900 capitalize">{estimate.request_priority}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Quote Amount</span>
                <p className="text-lg font-semibold text-blue-900">
                  {estimate.quote_amount ? `$${estimate.quote_amount.toLocaleString()}` : 'Not quoted yet'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Created</span>
                <p className="text-lg font-semibold text-blue-900">{new Date(estimate.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Customer Type:</span>
                  <p className="text-sm text-gray-900">{estimate.is_new_client ? 'New Customer' : 'Existing Customer'}</p>
                </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Full Name:</span>
                  <p className="text-sm text-gray-900">{estimate.is_new_client ? estimate.full_name : estimate.existing_customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <p className="text-sm text-gray-900">{estimate.is_new_client ? estimate.phone_number : estimate.existing_customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-sm text-gray-900">{estimate.is_new_client ? estimate.email_address : estimate.existing_customer_email || 'N/A'}</p>
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">OK to Text:</span>
                  <p className="text-sm text-gray-900">{estimate.ok_to_text ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">How did you hear about us:</span>
                  <p className="text-sm text-gray-900">{estimate.how_did_you_hear || 'N/A'}</p>
                  </div>
                  </div>
                </div>
              </div>

          {/* Service Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <span className="text-sm font-medium text-gray-700">Service Address:</span>
                  <p className="text-sm text-gray-900">{estimate.service_address}</p>
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">Gate Code:</span>
                  <p className="text-sm text-gray-900">{estimate.gate_code || 'No gate code'}</p>
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">Apartment/Unit:</span>
                  <p className="text-sm text-gray-900">{estimate.apartment_unit || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Location on Property:</span>
                  <p className="text-sm text-gray-900">{estimate.location_on_property}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Approximate Volume:</span>
                  <p className="text-sm text-gray-900">{estimate.approximate_volume}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Approximate Item Count:</span>
                  <p className="text-sm text-gray-900">{estimate.approximate_item_count || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Access Considerations:</span>
                  <p className="text-sm text-gray-900">{estimate.access_considerations || 'None specified'}</p>
                  </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Preferred Date:</span>
                  <p className="text-sm text-gray-900">{estimate.preferred_date ? new Date(estimate.preferred_date).toLocaleDateString() : 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Preferred Time:</span>
                  <p className="text-sm text-gray-900">{estimate.preferred_time || 'Not specified'}</p>
                </div>
              </div>
                </div>
              </div>

              {/* Material Types */}
          {estimate.material_types && estimate.material_types.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Types</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                  {estimate.material_types.map((type: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {type}
                      </span>
                    ))}
                </div>
                  </div>
                </div>
              )}

          {/* Item Conditions & Special Considerations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Conditions & Special Considerations</h3>
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Items filled with water:</span>
                  <p className="text-sm text-gray-900">{estimate.items_filled_water ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Items filled with oil/fuel:</span>
                  <p className="text-sm text-gray-900">{estimate.items_filled_oil_fuel ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Hazardous materials:</span>
                  <p className="text-sm text-gray-900">{estimate.hazardous_materials ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Items tied in bags:</span>
                  <p className="text-sm text-gray-900">{estimate.items_tied_bags ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Oversized items:</span>
                  <p className="text-sm text-gray-900">{estimate.oversized_items ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mold present:</span>
                  <p className="text-sm text-gray-900">{estimate.mold_present ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Pests present:</span>
                  <p className="text-sm text-gray-900">{estimate.pests_present ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">Sharp objects:</span>
                  <p className="text-sm text-gray-900">{estimate.sharp_objects ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Heavy lifting required:</span>
                  <p className="text-sm text-gray-900">{estimate.heavy_lifting_required ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Disassembly required:</span>
                  <p className="text-sm text-gray-900">{estimate.disassembly_required ? 'Yes' : 'No'}</p>
                </div>
                  </div>
                </div>
              </div>

              {/* Additional Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Services Requested</h3>
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Donation pickup:</span>
                  <p className="text-sm text-gray-900">{estimate.request_donation_pickup ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Demolition add-on:</span>
                  <p className="text-sm text-gray-900">{estimate.request_demolition_addon ? 'Yes' : 'No'}</p>
                  </div>
              </div>
            </div>
          </div>

          {/* Quote Information */}
          {estimate.quote_amount && (
                  <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Information</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-green-700">Quote Amount:</span>
                    <p className="text-2xl font-bold text-green-900">${estimate.quote_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Quote Notes:</span>
                    <p className="text-sm text-green-900">{estimate.quote_notes || 'No additional notes'}</p>
                  </div>
                </div>
              </div>
                </div>
              )}

          {/* Additional Notes */}
          {estimate.additional_notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">{estimate.additional_notes}</p>
              </div>
                </div>
              )}

              {/* Photos & Media */}
          {(estimate.photos && estimate.photos.length > 0) || (estimate.videos && estimate.videos.length > 0) ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos & Media</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {estimate.photos && estimate.photos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Photos ({estimate.photos.length})</h4>
                    <div className="text-xs text-gray-600">
                      {estimate.photos.map((photo: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FileText className="w-3 h-3" />
                          <span>{photo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                {estimate.videos && estimate.videos.length > 0 && (
            <div>
                    <h4 className="font-medium text-gray-900 mb-2">Videos ({estimate.videos.length})</h4>
                    <div className="text-xs text-gray-600">
                      {estimate.videos.map((video: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <FileText className="w-3 h-3" />
                          <span>{video}</span>
                        </div>
                      ))}
              </div>
            </div>
          )}
              </div>
            </div>
          ) : null}


          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Download Estimate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimatesDashboard;