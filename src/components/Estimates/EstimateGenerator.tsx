import React, { useState } from 'react';
import {
  Calculator,
  Plus,
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
  RefreshCw,
  Send
} from 'lucide-react';
import { Estimate, PricingItem, Customer } from '../../types';
import { EstimateRequest, estimatesService } from '../../services/estimatesService';
import { useApp } from '../../contexts/AppContext';
import { usePDFGenerator } from '../../hooks/usePDFGenerator';

const EstimatesDashboard: React.FC = () => {
  const { customers, estimates, refreshEstimates } = useApp();
  const { generateEstimatePDF, generateSimpleQuotePDF, loading: pdfLoading } = usePDFGenerator();
  const [activeTab, setActiveTab] = useState<'requests' | 'estimates' | 'pricing'>('estimates');
  const [selectedRequest, setSelectedRequest] = useState<EstimateRequest | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateRequest | null>(null);
  const [showCreateEstimate, setShowCreateEstimate] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showEstimateDetails, setShowEstimateDetails] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [showCustomerUrlModal, setShowCustomerUrlModal] = useState(false);
  const [customerReviewUrl, setCustomerReviewUrl] = useState<string>('');

  // Filter estimates based on quote amount
  const requests = estimates.filter(estimate => {
    const amount = parseFloat(String(estimate.quote_amount || '0'));
    return !estimate.quote_amount || amount === 0 || estimate.quote_amount === null;
  });
  const quotedEstimates = estimates.filter(estimate => {
    const amount = parseFloat(String(estimate.quote_amount || '0'));
    return estimate.quote_amount && amount > 0;
  });
  

  // New request form data - matches database schema
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
    itemsInBags: false,
    oversizedItems: false,
    hasMold: false,
    hasPests: false,
    hasSharpObjects: false,
    heavyLiftingRequired: false,
    disassemblyRequired: false,
    additionalNotes: '',
    requestDonationPickup: false,
    requestDemolition: false,
    howDidYouHear: '',
    priority: 'standard' as 'standard' | 'urgent' | 'low',
    textOptIn: false
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


  const getPriorityColor = (priority: string | null | undefined) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstimateStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'need review': return 'bg-orange-100 text-orange-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const handleCalculateQuote = (request: EstimateRequest) => {
    setSelectedRequest(request);
    setQuoteAmount(0);
    setQuoteNotes('');
    setShowQuoteModal(true);
  };


  const handleViewEstimate = (estimate: EstimateRequest) => {
    setSelectedEstimate(estimate);
    setShowEstimateDetails(true);
  };

  const handleDownloadEstimate = async (estimate: EstimateRequest) => {
    console.log('🖱️ Download button clicked for estimate:', estimate.id);
    try {
      console.log('📞 Calling generateEstimatePDF...');
      await generateEstimatePDF(estimate);
      console.log('✅ Download handler completed successfully');
    } catch (error) {
      console.error('❌ Download handler failed:', error);
    }
  };


  const handleDownloadSimpleQuote = async (estimate: EstimateRequest) => {
    try {
      await generateSimpleQuotePDF(estimate);
    } catch (error) {
      console.error('Failed to generate simple quote PDF:', error);
    }
  };

  const handleSendToCustomer = async (estimate: EstimateRequest) => {
    try {
      console.log('Sending estimate to customer for review:', estimate.id);
      
      // Clean up phone number format (remove dashes, spaces, parentheses)
      const cleanPhoneNumber = estimate.phone_number?.replace(/[\s\-\(\)]/g, '') || '';

      // Convert preferred_date from ISO timestamp to YYYY-MM-DD format for MySQL
      const formatDateForMySQL = (dateString: string | undefined): string | undefined => {
        if (!dateString) return undefined;
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
        } catch (error) {
          console.warn('Invalid date format:', dateString);
          return undefined;
        }
      };

      // Update with all required fields (same pattern as other estimate updates)
      await estimatesService.updateEstimate(
        estimate.id,
        {
          // REQUIRED FIELDS - Must include all of these
          full_name: estimate.full_name,
          phone_number: cleanPhoneNumber,
          email_address: estimate.email_address,
          service_address: estimate.service_address,
          location_on_property: estimate.location_on_property,
          approximate_volume: estimate.approximate_volume,
          material_types: estimate.material_types,
          
          // OPTIONAL FIELDS - Include existing values (convert numeric booleans to actual booleans)
          is_new_client: Boolean(estimate.is_new_client),
          existing_client_id: estimate.existing_client_id,
          ok_to_text: Boolean(estimate.ok_to_text),
          gate_code: estimate.gate_code,
          apartment_unit: estimate.apartment_unit,
          preferred_date: estimate.preferred_date ? formatDateForMySQL(estimate.preferred_date) : null,
          preferred_time: estimate.preferred_time,
          access_considerations: estimate.access_considerations,
          photos: estimate.photos,
          videos: estimate.videos,
          approximate_item_count: estimate.approximate_item_count,
          items_filled_water: Boolean(estimate.items_filled_water),
          items_filled_oil_fuel: Boolean(estimate.items_filled_oil_fuel),
          hazardous_materials: Boolean(estimate.hazardous_materials),
          items_tied_bags: Boolean(estimate.items_tied_bags),
          oversized_items: Boolean(estimate.oversized_items),
          mold_present: Boolean(estimate.mold_present),
          pests_present: Boolean(estimate.pests_present),
          sharp_objects: Boolean(estimate.sharp_objects),
          heavy_lifting_required: Boolean(estimate.heavy_lifting_required),
          disassembly_required: Boolean(estimate.disassembly_required),
          additional_notes: estimate.additional_notes,
          request_donation_pickup: Boolean(estimate.request_donation_pickup),
          request_demolition_addon: Boolean(estimate.request_demolition_addon),
          how_did_you_hear: estimate.how_did_you_hear,
          request_priority: estimate.request_priority,
          
          // UPDATE FIELDS - These are what we want to change
          status: 'quoted',
          amount: estimate.quote_amount, // Set amount column to same value as quote_amount
          quote_amount: estimate.quote_amount,
          quote_notes: estimate.quote_notes
        }
      );
      
      console.log('Estimate sent to customer successfully');
      await refreshEstimates();
      
      // Generate customer review URL
      const url = `${window.location.origin}/junkremoval/customer-review/${estimate.id}`;
      setCustomerReviewUrl(url);
      setShowCustomerUrlModal(true);
    } catch (error) {
      console.error('Failed to send estimate to customer:', error);
      alert('Failed to send estimate to customer. Please try again.');
    }
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

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form based on customer type
    if (!requestFormData.isNewCustomer && !requestFormData.selectedCustomerId) {
      alert('Please select an existing customer');
      return;
    }

    if (requestFormData.isNewCustomer && (!requestFormData.fullName || !requestFormData.phone || !requestFormData.email || !requestFormData.serviceAddress || !requestFormData.locationOnProperty || !requestFormData.approximateVolume)) {
      alert('Please fill in all required fields for new customer');
      return;
    }

    try {
      // Clean up phone number format (remove dashes, spaces, parentheses)
      const cleanPhoneNumber = requestFormData.phone?.replace(/[\s\-\(\)]/g, '') || '';

      // Convert preferred_date from ISO timestamp to YYYY-MM-DD format for MySQL
      const formatDateForMySQL = (dateString: string | undefined): string | undefined => {
        if (!dateString) return undefined;
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
        } catch (error) {
          console.warn('Invalid date format:', dateString);
          return undefined;
        }
      };

      // Map form data to API format - matches database schema exactly
      const estimateData = {
        // REQUIRED FIELDS - Must include all of these
        full_name: requestFormData.fullName,
        phone_number: cleanPhoneNumber,
        email_address: requestFormData.email,
        service_address: requestFormData.serviceAddress,
        location_on_property: requestFormData.locationOnProperty,
        approximate_volume: requestFormData.approximateVolume,
        material_types: requestFormData.materialTypes,
        
        // OPTIONAL FIELDS - Include existing values (convert to proper types)
        is_new_client: Boolean(requestFormData.isNewCustomer),
        existing_client_id: requestFormData.isNewCustomer ? null : parseInt(requestFormData.selectedCustomerId),
        ok_to_text: Boolean(requestFormData.textOptIn),
        gate_code: requestFormData.gateCode || null,
        apartment_unit: requestFormData.apartmentNumber || null,
        preferred_date: formatDateForMySQL(requestFormData.preferredDate),
        preferred_time: requestFormData.preferredTime || null,
        access_considerations: requestFormData.accessConsiderations || null,
        photos: requestFormData.photos.length > 0 ? requestFormData.photos.map(f => f.name) : null,
        videos: requestFormData.videos.length > 0 ? requestFormData.videos.map(f => f.name) : null,
        approximate_item_count: requestFormData.approximateItemCount || null,
        items_filled_water: Boolean(requestFormData.filledWithWater),
        items_filled_oil_fuel: Boolean(requestFormData.filledWithOil),
        hazardous_materials: Boolean(requestFormData.hazardousMaterial),
        items_tied_bags: Boolean(requestFormData.itemsInBags),
        oversized_items: Boolean(requestFormData.oversizedItems),
        mold_present: Boolean(requestFormData.hasMold),
        pests_present: Boolean(requestFormData.hasPests),
        sharp_objects: Boolean(requestFormData.hasSharpObjects),
        heavy_lifting_required: Boolean(requestFormData.heavyLiftingRequired),
        disassembly_required: Boolean(requestFormData.disassemblyRequired),
        additional_notes: requestFormData.additionalNotes || null,
        request_donation_pickup: Boolean(requestFormData.requestDonationPickup),
        request_demolition_addon: Boolean(requestFormData.requestDemolition),
        how_did_you_hear: requestFormData.howDidYouHear || '',
        request_priority: requestFormData.priority,
        status: 'need review' as const,
        amount: null,
        quote_amount: null,
        quote_notes: ''
      };

      console.log('Creating new estimate with data:', estimateData);

      // Create the new estimate via API
      await estimatesService.createEstimate(estimateData);

      console.log('New estimate created successfully');
      
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
        itemsInBags: false,
        oversizedItems: false,
        hasMold: false,
        hasPests: false,
        hasSharpObjects: false,
        heavyLiftingRequired: false,
        disassemblyRequired: false,
        additionalNotes: '',
        requestDonationPickup: false,
        requestDemolition: false,
        howDidYouHear: '',
        priority: 'standard',
        textOptIn: false
      });

      setShowNewRequest(false);
      
      // Refresh estimates data
      await refreshEstimates();
      
      alert('Request submitted successfully!');
    } catch (error: any) {
      console.error('Error creating estimate:', error);
      alert(`Failed to create estimate: ${error.message || 'Unknown error'}`);
    }
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
                            {(request.status || 'need review').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.request_priority)}`}>
                            {(request.request_priority || 'standard').toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{request.full_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{request.phone_number}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{request.email_address}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.service_address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{request.approximate_volume}</span>
                          </div>
                        </div>

                        {request.additional_notes && (
                          <p className="text-sm text-gray-600 mb-2">{request.additional_notes}</p>
                        )}

                        {request.material_types && Array.isArray(request.material_types) && request.material_types.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {request.material_types.map((type: any, index: number) => (
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
                            onClick={() => handleCalculateQuote(request)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            <Calculator className="w-4 h-4" />
                          <span>Calculate Quote</span>
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
                            {(estimate.status || 'need review').toUpperCase()}
                          </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(estimate.request_priority)}`}>
                              {(estimate.request_priority || 'standard').toUpperCase()}
                            </span>
                        </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <div className="font-medium text-gray-900">Customer Information</div>
                              <div>Name: {estimate.full_name}</div>
                              <div>Phone: {estimate.phone_number}</div>
                              <div>Email: {estimate.email_address}</div>
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
                                Quote Amount: ${(estimate.quote_amount || 0).toLocaleString()}
                              </div>
                            </div>
                          )}
                          {estimate.additional_notes && (
                            <p className="mt-2 text-sm text-gray-600">Notes: {estimate.additional_notes}</p>
                          )}
                          <div className="mt-2 text-xs text-gray-500">
                            Created: {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'N/A'} at {estimate.created_at ? new Date(estimate.created_at).toLocaleTimeString() : 'N/A'}
                      </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleViewEstimate(estimate)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Edit Details</span>
                        </button>
                        <button
                          onClick={() => handleSendToCustomer(estimate)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send to Customer for Review</span>
                        </button>
                          <div className="relative group">
                            <button 
                              disabled={pdfLoading}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleDownloadEstimate(estimate)}
                                  disabled={pdfLoading}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Full Estimate PDF
                                </button>
                                <button
                                  onClick={() => handleDownloadSimpleQuote(estimate)}
                                  disabled={pdfLoading}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Simple Quote PDF
                                </button>
                              </div>
                            </div>
                          </div>
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
          onDownloadEstimate={handleDownloadEstimate}
          onSaveEstimate={async (updatedEstimate) => {
            try {
              console.log('Saving estimate details for estimate:', updatedEstimate.id);
              
              // Clean up phone number format (remove dashes, spaces, parentheses)
              const cleanPhoneNumber = updatedEstimate.phone_number?.replace(/[\s\-\(\)]/g, '') || '';

              // Convert preferred_date from ISO timestamp to YYYY-MM-DD format for MySQL
              const formatDateForMySQL = (dateString: string | undefined): string | undefined => {
                if (!dateString) return undefined;
                try {
                  const date = new Date(dateString);
                  return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
                } catch (error) {
                  console.warn('Invalid date format:', dateString);
                  return undefined;
                }
              };

              // Update with all required fields (same logic as QuoteAmountModal)
              await estimatesService.updateEstimate(
                updatedEstimate.id,
                {
                  // REQUIRED FIELDS - Must include all of these
                  full_name: updatedEstimate.full_name,
                  phone_number: cleanPhoneNumber,
                  email_address: updatedEstimate.email_address,
                  service_address: updatedEstimate.service_address,
                  location_on_property: updatedEstimate.location_on_property,
                  approximate_volume: updatedEstimate.approximate_volume,
                  material_types: updatedEstimate.material_types,
                  
                  // OPTIONAL FIELDS - Include existing values (convert numeric booleans to actual booleans)
                  is_new_client: Boolean(updatedEstimate.is_new_client),
                  existing_client_id: updatedEstimate.existing_client_id,
                  ok_to_text: Boolean(updatedEstimate.ok_to_text),
                  gate_code: updatedEstimate.gate_code,
                  apartment_unit: updatedEstimate.apartment_unit,
                  preferred_date: updatedEstimate.preferred_date ? formatDateForMySQL(updatedEstimate.preferred_date) : null,
                  preferred_time: updatedEstimate.preferred_time,
                  access_considerations: updatedEstimate.access_considerations,
                  photos: updatedEstimate.photos,
                  videos: updatedEstimate.videos,
                  approximate_item_count: updatedEstimate.approximate_item_count,
                  items_filled_water: Boolean(updatedEstimate.items_filled_water),
                  items_filled_oil_fuel: Boolean(updatedEstimate.items_filled_oil_fuel),
                  hazardous_materials: Boolean(updatedEstimate.hazardous_materials),
                  items_tied_bags: Boolean(updatedEstimate.items_tied_bags),
                  oversized_items: Boolean(updatedEstimate.oversized_items),
                  mold_present: Boolean(updatedEstimate.mold_present),
                  pests_present: Boolean(updatedEstimate.pests_present),
                  sharp_objects: Boolean(updatedEstimate.sharp_objects),
                  heavy_lifting_required: Boolean(updatedEstimate.heavy_lifting_required),
                  disassembly_required: Boolean(updatedEstimate.disassembly_required),
                  additional_notes: updatedEstimate.additional_notes,
                  request_donation_pickup: Boolean(updatedEstimate.request_donation_pickup),
                  request_demolition_addon: Boolean(updatedEstimate.request_demolition_addon),
                  how_did_you_hear: updatedEstimate.how_did_you_hear,
                  request_priority: updatedEstimate.request_priority,
                  status: updatedEstimate.status,
                  quote_amount: updatedEstimate.quote_amount,
                  amount: updatedEstimate.amount,
                  quote_notes: updatedEstimate.quote_notes
                }
              );

              console.log('Estimate details saved successfully');
              await refreshEstimates();
              setSelectedEstimate(updatedEstimate);
            } catch (error) {
              console.error('Failed to save estimate details:', error);
              throw error; // Re-throw to let the modal handle the error display
            }
          }}
          pdfLoading={pdfLoading}
        />
      )}

      {/* Quote Amount Modal */}
      {showQuoteModal && selectedRequest && (
        <QuoteAmountModal
          request={selectedRequest}
          quoteAmount={quoteAmount}
          setQuoteAmount={setQuoteAmount}
          quoteNotes={quoteNotes}
          setQuoteNotes={setQuoteNotes}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedRequest(null);
          }}
          onSave={async (amount, notes) => {
            try {
              console.log('Saving quote amount:', amount, 'for estimate:', selectedRequest?.id);
              
              if (!selectedRequest) {
                throw new Error('No estimate selected');
              }

              // Get the current estimate data first
              const currentEstimate = selectedRequest; // or fetch from API

              // Clean up phone number format (remove dashes, spaces, parentheses)
              const cleanPhoneNumber = currentEstimate.phone_number?.replace(/[\s\-\(\)]/g, '') || '';

              // Convert preferred_date from ISO timestamp to YYYY-MM-DD format for MySQL
              const formatDateForMySQL = (dateString: string | undefined): string | undefined => {
                if (!dateString) return undefined;
                try {
                  const date = new Date(dateString);
                  return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
                } catch (error) {
                  console.warn('Invalid date format:', dateString);
                  return undefined;
                }
              };

              // Update with all required fields
              await estimatesService.updateEstimateQuote(
                selectedRequest.id,
                {
                  // REQUIRED FIELDS - Must include all of these
                  full_name: currentEstimate.full_name,
                  phone_number: cleanPhoneNumber,
                  email_address: currentEstimate.email_address,
                  service_address: currentEstimate.service_address,
                  location_on_property: currentEstimate.location_on_property,
                  approximate_volume: currentEstimate.approximate_volume,
                  material_types: currentEstimate.material_types,
                  
                  // UPDATE FIELDS - These are what you want to change
                  status: 'pending',
                  quote_amount: amount, // Keep as number, not string
                  amount: amount, // Also set the amount field
                  quote_notes: notes,
                  
                  // OPTIONAL FIELDS - Include existing values (convert numeric booleans to actual booleans)
                  is_new_client: Boolean(currentEstimate.is_new_client),
                  existing_client_id: currentEstimate.existing_client_id,
                  ok_to_text: Boolean(currentEstimate.ok_to_text),
                  gate_code: currentEstimate.gate_code,
                  apartment_unit: currentEstimate.apartment_unit,
                  preferred_date: currentEstimate.preferred_date ? formatDateForMySQL(currentEstimate.preferred_date) : null,
                  preferred_time: currentEstimate.preferred_time,
                  access_considerations: currentEstimate.access_considerations,
                  photos: currentEstimate.photos,
                  videos: currentEstimate.videos,
                  approximate_item_count: currentEstimate.approximate_item_count,
                  items_filled_water: Boolean(currentEstimate.items_filled_water),
                  items_filled_oil_fuel: Boolean(currentEstimate.items_filled_oil_fuel),
                  hazardous_materials: Boolean(currentEstimate.hazardous_materials),
                  items_tied_bags: Boolean(currentEstimate.items_tied_bags),
                  oversized_items: Boolean(currentEstimate.oversized_items),
                  mold_present: Boolean(currentEstimate.mold_present),
                  pests_present: Boolean(currentEstimate.pests_present),
                  sharp_objects: Boolean(currentEstimate.sharp_objects),
                  heavy_lifting_required: Boolean(currentEstimate.heavy_lifting_required),
                  disassembly_required: Boolean(currentEstimate.disassembly_required),
                  additional_notes: currentEstimate.additional_notes,
                  request_donation_pickup: Boolean(currentEstimate.request_donation_pickup),
                  request_demolition_addon: Boolean(currentEstimate.request_demolition_addon),
                  how_did_you_hear: currentEstimate.how_did_you_hear,
                  request_priority: currentEstimate.request_priority
                }
              );

              console.log('Quote amount saved successfully');
              
              // Close modal and refresh data
              setShowQuoteModal(false);
              setSelectedRequest(null);
              await refreshEstimates();
              
            } catch (error) {
              console.error('Failed to save quote amount:', error);
              alert('Failed to save quote amount. Please try again.');
            }
          }}
        />
      )}

      {/* Customer Review URL Modal */}
      {showCustomerUrlModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customer Review URL Generated</h2>
                <p className="text-sm text-gray-600 mt-1">Copy this URL to send to your customer</p>
              </div>
              <button 
                onClick={() => setShowCustomerUrlModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Review URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={customerReviewUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customerReviewUrl);
                      alert('URL copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">What happens next?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Customer visits the URL to review their estimate</li>
                      <li>• Customer can accept or decline the estimate</li>
                      <li>• Status will automatically update in your system</li>
                      <li>• Accepted estimates will appear in your Jobs tab</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setShowCustomerUrlModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Request Details Modal Component
interface RequestDetailsModalProps {
  request: EstimateRequest;
  onClose: () => void;
  onCreateEstimate: () => void;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ request, onClose, onCreateEstimate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Request #{request.id}</h2>
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
                <p className="text-sm text-gray-900">{request.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900">{request.phone_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{request.email_address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Address</label>
                <p className="text-sm text-gray-900">{request.service_address}</p>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{request.additional_notes || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location on Property</label>
                <p className="text-sm text-gray-900">{request.location_on_property || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Approximate Volume</label>
                <p className="text-sm text-gray-900">{request.approximate_volume || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Material Types</label>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(request.material_types) && request.material_types.map((type: any, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {type}
                    </span>
                  )) || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Special Conditions */}
          {(request.hazardous_materials || request.mold_present || request.pests_present || request.heavy_lifting_required) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Special Conditions</h3>
              <div className="space-y-2">
                {request.hazardous_materials && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-900">Hazardous materials present</span>
                  </div>
                )}
                {request.mold_present && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-900">Mold present</span>
                  </div>
                )}
                {request.pests_present && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-900">Pests present</span>
                  </div>
                )}
                {request.heavy_lifting_required && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-900">Heavy lifting required</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {request.additional_notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
              <p className="text-sm text-gray-900">{request.additional_notes}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            {request.status === 'need review' && (
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
  request: EstimateRequest;
  pricingItems: PricingItem[];
  onClose: () => void;
  onSave: (estimate: Estimate) => void;
}

const CreateEstimateModal: React.FC<CreateEstimateModalProps> = ({ request, onClose, onSave }) => {
  const [lineItems, setLineItems] = useState<Array<{ id: string; description: string; amount: number }>>([]);
  const [laborHours] = useState(2);
  const [laborRate] = useState(50);
  const [additionalFees, setAdditionalFees] = useState({
    disposal: 0,
    travel: 0,
    difficulty: 0
  });
  const [notes, setNotes] = useState('');

  const addLineItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: '',
      amount: 0
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const updateLineItem = (id: string, field: 'description' | 'amount', value: string | number) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateItemsSubtotal = () => {
    return lineItems.reduce((total, item) => total + item.amount, 0);
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
    const newEstimate: Estimate = {
      id: `est-${Date.now()}`,
      customerId: request.existing_client_id?.toString() || '',
      customerName: request.full_name,
      customerEmail: request.email_address,
      customerPhone: request.phone_number,
      address: request.service_address,
      city: '',
      state: '',
      zipCode: '',
      items: lineItems.map(item => ({
        id: item.id,
        name: item.description,
        category: 'Custom',
        quantity: 1,
        basePrice: item.amount,
        total: item.amount,
        difficulty: 'medium',
        estimatedTime: 1,
        volume: { weight: 0, yardage: 0 }
      })),
      laborHours,
      laborRate,
      additionalFees,
      subtotal: calculateItemsSubtotal(),
      total: calculateTotal(),
      status: 'draft',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: notes || `Estimate created from client request: ${request.id}`,
      created: new Date(),
      updated: new Date(),
      volume: {
        weight: 0,
        yardage: 0
      }
    };

    onSave(newEstimate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Estimate from Request</h2>
            <p className="text-sm text-gray-600 mt-1">Request #{request.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Line Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
              
              {/* Add Line Item Button */}
              <button
                onClick={addLineItem}
                className="w-full mb-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Line Item</span>
              </button>

              {/* Line Items List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lineItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Item description"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => updateLineItem(item.id, 'amount', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Labor Hours */}
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-md font-medium text-gray-900 mb-2">Labor Hours</h4>
                <div className="text-sm text-gray-600">
                  {laborHours} hours @ ${laborRate}/hr
                </div>
              </div>

              {/* Additional Fees */}
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-md font-medium text-gray-900 mb-3">Additional Fees</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Disposal Fee</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={additionalFees.disposal}
                      onChange={(e) => setAdditionalFees(prev => ({ ...prev, disposal: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Travel Fee</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={additionalFees.travel}
                      onChange={(e) => setAdditionalFees(prev => ({ ...prev, travel: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Difficulty Fee</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={additionalFees.difficulty}
                      onChange={(e) => setAdditionalFees(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimate Summary</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Subtotal</span>
                  <span className="font-medium">${calculateItemsSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Labor ({laborHours}h @ ${laborRate}/hr)</span>
                  <span className="font-medium">${calculateLaborCost().toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Fees</span>
                  <span className="font-medium">${calculateAdditionalFees().toFixed(2)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes for the estimate..."
                />
              </div>

              {/* Action Buttons */}
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

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
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
          {/* Required Fields Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Required Fields</h4>
                <p className="text-sm text-blue-700">
                  Fields marked with <span className="text-red-500 font-semibold">*</span> are required for new customers. 
                  For existing customers, only the customer selection is required.
                </p>
              </div>
            </div>
          </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing Customer *</label>
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
              <span className="ml-2 text-sm text-gray-500 font-normal">(Location & Volume required *)</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Volume *</label>
                <select
                  required={true}
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
              <span className="ml-2 text-sm text-gray-500 font-normal">(Optional - helps with pricing)</span>
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
              <span className="ml-2 text-sm text-gray-500 font-normal">(Optional)</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Item Count</label>
                <input
                  type="text"
                  value={formData.approximateItemCount}
                  onChange={(e) => setFormData({ ...formData, approximateItemCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5-10 items, 2 large pieces, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData({ ...formData, photos: files });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Upload photos to help us better understand your project</p>
                {formData.photos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <ul className="text-xs text-gray-500">
                      {formData.photos.map((file: File, index: number) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Videos (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData({ ...formData, videos: files });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Upload videos to help us better understand your project</p>
                {formData.videos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <ul className="text-xs text-gray-500">
                      {formData.videos.map((file: File, index: number) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

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
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'standard' | 'urgent' | 'low' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low Priority</option>
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
  onDownloadEstimate: (estimate: EstimateRequest) => Promise<void>;
  onSaveEstimate: (estimate: EstimateRequest) => Promise<void>;
  pdfLoading: boolean;
}

const EstimateDetailsModal: React.FC<EstimateDetailsModalProps> = ({ 
  estimate, 
  onClose, 
  onDownloadEstimate,
  onSaveEstimate,
  pdfLoading 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEstimate, setEditedEstimate] = useState<EstimateRequest>(estimate);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveEstimate(editedEstimate);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving estimate:', error);
      alert('Failed to save estimate');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedEstimate(estimate);
    setIsEditing(false);
  };

  const updateField = (field: keyof EstimateRequest, value: any) => {
    setEditedEstimate(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Estimate Details - #{estimate.id}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Editing estimate request information' : 'Complete estimate request information'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 inline mr-1" />
                Edit
              </button>
            ) : (
              <>
                <button 
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
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
                <p className="text-lg font-semibold text-blue-900">{estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'N/A'}</p>
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
                  <p className="text-sm text-gray-900">{editedEstimate.is_new_client ? 'New Customer' : 'Existing Customer'}</p>
                </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Full Name:</span>
                    {isEditing && editedEstimate.is_new_client ? (
                      <input
                        type="text"
                        value={editedEstimate.full_name}
                        onChange={(e) => updateField('full_name', e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.full_name}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                    {isEditing && editedEstimate.is_new_client ? (
                      <input
                        type="text"
                        value={editedEstimate.phone_number}
                        onChange={(e) => updateField('phone_number', e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.phone_number}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    {isEditing && editedEstimate.is_new_client ? (
                      <input
                        type="email"
                        value={editedEstimate.email_address}
                        onChange={(e) => updateField('email_address', e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.email_address}</p>
                    )}
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">OK to Text:</span>
                  {isEditing && editedEstimate.is_new_client ? (
                    <select
                      value={editedEstimate.ok_to_text ? 'true' : 'false'}
                      onChange={(e) => updateField('ok_to_text', e.target.value === 'true')}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.ok_to_text ? 'Yes' : 'No'}</p>
                  )}
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">How did you hear about us:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEstimate.how_did_you_hear || ''}
                      onChange={(e) => updateField('how_did_you_hear', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.how_did_you_hear || 'N/A'}</p>
                  )}
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
                  {isEditing ? (
                    <textarea
                      value={editedEstimate.service_address}
                      onChange={(e) => updateField('service_address', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.service_address}</p>
                  )}
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">Gate Code:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEstimate.gate_code || ''}
                      onChange={(e) => updateField('gate_code', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.gate_code || 'No gate code'}</p>
                  )}
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">Apartment/Unit:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEstimate.apartment_unit || ''}
                      onChange={(e) => updateField('apartment_unit', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.apartment_unit || 'N/A'}</p>
                  )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Location on Property:</span>
                  {isEditing ? (
                    <select
                      value={editedEstimate.location_on_property}
                      onChange={(e) => updateField('location_on_property', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Curbside">Curbside</option>
                      <option value="Inside House">Inside House</option>
                      <option value="Garage">Garage</option>
                      <option value="Upstairs">Upstairs</option>
                      <option value="Backyard">Backyard</option>
                      <option value="Basement">Basement</option>
                      <option value="Attic">Attic</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.location_on_property}</p>
                  )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Approximate Volume:</span>
                  {isEditing ? (
                    <select
                      value={editedEstimate.approximate_volume}
                      onChange={(e) => updateField('approximate_volume', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Small Load (1-2 items)">Small Load (1-2 items)</option>
                      <option value="Half Truck">Half Truck</option>
                      <option value="Full Truck">Full Truck</option>
                      <option value="Multiple Trucks">Multiple Trucks</option>
                      <option value="Unsure">Unsure</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.approximate_volume}</p>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Approximate Item Count:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEstimate.approximate_item_count || ''}
                      onChange={(e) => updateField('approximate_item_count', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.approximate_item_count || 'Not specified'}</p>
                  )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Access Considerations:</span>
                  {isEditing ? (
                    <textarea
                      value={editedEstimate.access_considerations || ''}
                      onChange={(e) => updateField('access_considerations', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.access_considerations || 'None specified'}</p>
                  )}
                  </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Preferred Date:</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedEstimate.preferred_date || ''}
                      onChange={(e) => updateField('preferred_date', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.preferred_date ? new Date(editedEstimate.preferred_date).toLocaleDateString() : 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Preferred Time:</span>
                  {isEditing ? (
                    <select
                      value={editedEstimate.preferred_time || ''}
                      onChange={(e) => updateField('preferred_time', e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.preferred_time || 'Not specified'}</p>
                  )}
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
                  {Array.isArray(estimate.material_types) && estimate.material_types.map((type: any, index: number) => (
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
                    {isEditing ? (
                      <select
                        value={editedEstimate.items_filled_water ? 'true' : 'false'}
                        onChange={(e) => updateField('items_filled_water', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.items_filled_water ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Items filled with oil/fuel:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.items_filled_oil_fuel ? 'true' : 'false'}
                        onChange={(e) => updateField('items_filled_oil_fuel', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.items_filled_oil_fuel ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Hazardous materials:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.hazardous_materials ? 'true' : 'false'}
                        onChange={(e) => updateField('hazardous_materials', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.hazardous_materials ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Items tied in bags:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.items_tied_bags ? 'true' : 'false'}
                        onChange={(e) => updateField('items_tied_bags', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.items_tied_bags ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Oversized items:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.oversized_items ? 'true' : 'false'}
                        onChange={(e) => updateField('oversized_items', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.oversized_items ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mold present:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.mold_present ? 'true' : 'false'}
                        onChange={(e) => updateField('mold_present', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.mold_present ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Pests present:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.pests_present ? 'true' : 'false'}
                        onChange={(e) => updateField('pests_present', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.pests_present ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-700">Sharp objects:</span>
                  {isEditing ? (
                    <select
                      value={editedEstimate.sharp_objects ? 'true' : 'false'}
                      onChange={(e) => updateField('sharp_objects', e.target.value === 'true')}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{editedEstimate.sharp_objects ? 'Yes' : 'No'}</p>
                  )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Heavy lifting required:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.heavy_lifting_required ? 'true' : 'false'}
                        onChange={(e) => updateField('heavy_lifting_required', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.heavy_lifting_required ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Disassembly required:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.disassembly_required ? 'true' : 'false'}
                        onChange={(e) => updateField('disassembly_required', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.disassembly_required ? 'Yes' : 'No'}</p>
                    )}
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
                    {isEditing ? (
                      <select
                        value={editedEstimate.request_donation_pickup ? 'true' : 'false'}
                        onChange={(e) => updateField('request_donation_pickup', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.request_donation_pickup ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Demolition add-on:</span>
                    {isEditing ? (
                      <select
                        value={editedEstimate.request_demolition_addon ? 'true' : 'false'}
                        onChange={(e) => updateField('request_demolition_addon', e.target.value === 'true')}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{editedEstimate.request_demolition_addon ? 'Yes' : 'No'}</p>
                    )}
                  </div>
              </div>
            </div>
          </div>

          {/* Quote Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Information</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-green-700">Quote Amount:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editedEstimate.quote_amount || ''}
                      onChange={(e) => {
                        const newAmount = Number(e.target.value);
                        updateField('quote_amount', newAmount);
                        // Update status to 'pending' when quote amount is set
                        if (newAmount > 0) {
                          updateField('status', 'pending');
                        }
                      }}
                      className="w-full px-3 py-2 text-lg font-bold border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter quote amount"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-green-900">
                      {editedEstimate.quote_amount ? `$${editedEstimate.quote_amount.toLocaleString()}` : 'Not quoted yet'}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-green-700">Quote Notes:</span>
                  {isEditing ? (
                    <textarea
                      value={editedEstimate.quote_notes || ''}
                      onChange={(e) => updateField('quote_notes', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter quote notes..."
                    />
                  ) : (
                    <p className="text-sm text-green-900">{editedEstimate.quote_notes || 'No additional notes'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {isEditing ? (
                <textarea
                  value={editedEstimate.additional_notes || ''}
                  onChange={(e) => updateField('additional_notes', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter any additional notes..."
                />
              ) : (
                <p className="text-sm text-gray-900">{editedEstimate.additional_notes || 'No additional notes'}</p>
              )}
            </div>
          </div>

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
            <button 
              onClick={() => onDownloadEstimate(estimate)}
              disabled={pdfLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 inline mr-2" />
              {pdfLoading ? 'Generating...' : 'Download Estimate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quote Amount Modal Component
interface QuoteAmountModalProps {
  request: EstimateRequest;
  quoteAmount: number;
  setQuoteAmount: (amount: number) => void;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  onClose: () => void;
  onSave: (amount: number, notes: string) => Promise<void>;
}

const QuoteAmountModal: React.FC<QuoteAmountModalProps> = ({ 
  request, 
  quoteAmount, 
  setQuoteAmount, 
  quoteNotes,
  setQuoteNotes,
  onClose, 
  onSave 
}) => {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (quoteAmount <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }

    setLoading(true);
    try {
      await onSave(quoteAmount, quoteNotes);
    } catch (error) {
      console.error('Failed to save quote amount:', error);
      alert('Failed to save quote amount. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Calculate Quote</h2>
            <p className="text-sm text-gray-600 mt-1">Request #{request.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Request Details */}
            <div>
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div><strong>Name:</strong> {request.full_name}</div>
                    <div><strong>Phone:</strong> {request.phone_number}</div>
                    <div><strong>Email:</strong> {request.email_address}</div>
                    <div><strong>Address:</strong> {request.service_address}</div>
                    {request.gate_code && (
                      <div><strong>Gate Code:</strong> {request.gate_code}</div>
                    )}
                    {request.apartment_unit && (
                      <div><strong>Unit:</strong> {request.apartment_unit}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div><strong>Volume:</strong> {request.approximate_volume || 'N/A'}</div>
                    <div><strong>Location:</strong> {request.location_on_property || 'N/A'}</div>
                    <div><strong>Materials:</strong> {request.material_types?.join(', ') || 'N/A'}</div>
                    {request.approximate_item_count && (
                      <div><strong>Item Count:</strong> {request.approximate_item_count}</div>
                    )}
                    {request.preferred_date && (
                      <div><strong>Preferred Date:</strong> {new Date(request.preferred_date).toLocaleDateString()}</div>
                    )}
                    {request.preferred_time && (
                      <div><strong>Preferred Time:</strong> {request.preferred_time}</div>
                    )}
                    {request.access_considerations && (
                      <div><strong>Access:</strong> {request.access_considerations}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Conditions */}
              {(request.hazardous_materials || request.mold_present || request.pests_present || request.heavy_lifting_required || request.sharp_objects || request.oversized_items) && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Special Conditions</h3>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      {request.hazardous_materials && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>Hazardous materials present</span>
                        </div>
                      )}
                      {request.mold_present && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span>Mold present</span>
                        </div>
                      )}
                      {request.pests_present && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span>Pests present</span>
                        </div>
                      )}
                      {request.heavy_lifting_required && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span>Heavy lifting required</span>
                        </div>
                      )}
                      {request.sharp_objects && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>Sharp objects present</span>
                        </div>
                      )}
                      {request.oversized_items && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-blue-500" />
                          <span>Oversized items</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {request.additional_notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{request.additional_notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Quote Calculation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quote Calculation</h3>
              
              {/* Quote Amount Input */}
              <div className="mb-6">
                <label htmlFor="quote-amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Amount ($)
                </label>
                <input
                  id="quote-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter quote amount"
                />
              </div>

              {/* Quote Notes */}
              <div className="mb-6">
                <label htmlFor="quote-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Notes (Optional)
                </label>
                <textarea
                  id="quote-notes"
                  rows={4}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about the quote..."
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  disabled={loading || quoteAmount <= 0}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Quote'}
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimatesDashboard;