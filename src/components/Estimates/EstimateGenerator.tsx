import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Plus,
  Minus,
  Mail,
  Phone,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Send,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  TrendingUp,
  Package,
  X,
  MapPin,
  User,
  Info,
  AlertTriangle,
  Star
} from 'lucide-react';
import { ClientRequest, Estimate, EstimateItem, PricingItem, Customer } from '../../types';

const EstimatesDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'estimates' | 'pricing'>('requests');
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showCreateEstimate, setShowCreateEstimate] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showEstimateDetails, setShowEstimateDetails] = useState(false);

  // Mock data for client requests (from portal)
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([
    {
      id: 'req-1',
      customerId: 'cust-1',
      customerName: 'Downtown Office Complex',
      type: 'pickup',
      priority: 'medium',
      status: 'pending',
      subject: 'Weekly Office Waste Pickup',
      description: 'Regular weekly pickup of office waste and recycling from all floors',
      requestedDate: new Date('2024-01-15'),
      preferredDate: new Date('2024-01-16'),
      preferredTime: '09:00 AM',
      location: {
        address: '321 Commerce St',
        city: 'Wilmington',
        state: 'NC',
        zipCode: '28401'
      },
      volume: {
        weight: 800,
        yardage: 12
      },
      attachments: [],
      notes: 'Please access through loading dock on the east side',
      created: new Date('2024-01-15'),
      updated: new Date('2024-01-16'),
      fullName: 'John Smith',
      phone: '555-0100',
      email: 'admin@downtownoffice.com',
      serviceAddress: '321 Commerce St',
      locationOnProperty: 'Loading Dock',
      approximateVolume: 'Half Truck',
      materialTypes: ['Paper', 'Cardboard', 'General Waste'],
      canCreateEstimate: true,
      estimateStatus: 'pending'
    },
    {
      id: 'req-2',
      customerId: 'cust-2',
      customerName: 'Riverside Apartments',
      type: 'service',
      priority: 'high',
      status: 'pending',
      subject: 'Emergency Cleanup - Conference Room Renovation',
      description: 'Need immediate cleanup of construction debris from conference room renovation project',
      requestedDate: new Date('2024-01-20'),
      preferredDate: new Date('2024-01-21'),
      preferredTime: 'ASAP',
      location: {
        address: '456 River Rd',
        city: 'Wilmington',
        state: 'NC',
        zipCode: '28403'
      },
      volume: {
        weight: 1200,
        yardage: 18
      },
      attachments: [],
      notes: 'Construction materials include drywall, wood, and metal scraps',
      created: new Date('2024-01-20'),
      updated: new Date('2024-01-20'),
      fullName: 'Sarah Johnson',
      phone: '555-0200',
      email: 'manager@riversideapts.com',
      serviceAddress: '456 River Rd',
      locationOnProperty: 'Conference Room',
      approximateVolume: 'Full Truck',
      materialTypes: ['Construction Waste', 'Drywall', 'Wood', 'Metal'],
      hazardousMaterial: true,
      hazardousDescription: 'Some materials may contain asbestos',
      canCreateEstimate: true,
      estimateStatus: 'pending'
    }
  ]);

  // Mock data for existing estimates
  const [estimates, setEstimates] = useState<Estimate[]>([
    {
      id: 'est-1',
      customerId: 'cust-1',
      customerName: 'Downtown Office Complex',
      customerEmail: 'admin@downtownoffice.com',
      customerPhone: '555-0100',
      address: '321 Commerce St',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28401',
      items: [
        {
          id: 'item-1',
          name: 'Office Waste',
          category: 'General Waste',
          quantity: 1,
          basePrice: 150,
          total: 150,
          difficulty: 'easy',
          estimatedTime: 2,
          volume: { weight: 800, yardage: 12 }
        }
      ],
      laborHours: 3,
      laborRate: 50,
      additionalFees: { disposal: 25, travel: 15, difficulty: 0 },
      subtotal: 150,
      total: 250,
      status: 'sent',
      sentDate: new Date('2024-01-15'),
      expiryDate: new Date('2024-02-15'),
      notes: 'Weekly office waste pickup service',
      created: new Date('2024-01-15'),
      updated: new Date('2024-01-15'),
      volume: { weight: 800, yardage: 12 }
    }
  ]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateEstimate = (request: ClientRequest) => {
    setSelectedRequest(request);
    setShowCreateEstimate(true);
  };

  const handleViewRequest = (request: ClientRequest) => {
    setSelectedRequest(request);
  };

  const handleViewEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setShowEstimateDetails(true);
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
            onClick={() => setShowPricingModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pricing Item</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {[
              { id: 'requests', label: 'Client Requests', icon: FileText, badge: clientRequests.filter(r => r.status === 'pending').length },
              { id: 'estimates', label: 'Estimates', icon: Calculator, badge: estimates.length },
              { id: 'pricing', label: 'Pricing Items', icon: DollarSign, badge: pricingItems.length }
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
                {clientRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{request.subject}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstimateStatusColor(request.estimateStatus)}`}>
                            {request.estimateStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{request.fullName || request.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{request.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{request.email || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.serviceAddress || request.location.address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Requested: {request.requestedDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{request.approximateVolume || 'Volume TBD'}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>

                        {request.materialTypes && request.materialTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {request.materialTypes.map((type, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        )}

                        {request.notes && (
                          <p className="text-sm text-gray-600">Notes: {request.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        {request.canCreateEstimate && request.estimateStatus === 'pending' && (
                          <button
                            onClick={() => handleCreateEstimate(request)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            <Calculator className="w-4 h-4" />
                            <span>Create Estimate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimates Tab */}
          {activeTab === 'estimates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Estimates</h2>
                <div className="flex space-x-2">
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
                {estimates.map((estimate) => (
                  <div key={estimate.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Estimate #{estimate.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstimateStatusColor(estimate.status)}`}>
                            {estimate.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Customer: {estimate.customerName}</div>
                          <div>Address: {estimate.address}, {estimate.city}, {estimate.state}</div>
                          <div>Total: ${estimate.total}</div>
                          <div>Labor Hours: {estimate.laborHours} @ ${estimate.laborRate}/hr</div>
                          <div>Volume: {estimate.volume.weight} lbs, {estimate.volume.yardage} yds³</div>
                        </div>
                        {estimate.notes && (
                          <p className="mt-2 text-sm text-gray-600">Notes: {estimate.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEstimate(estimate)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
          onSave={(estimate) => {
            setEstimates(prev => [...prev, estimate]);
            setShowCreateEstimate(false);
            setSelectedRequest(null);
            // Update request status
            setClientRequests(prev => prev.map(req =>
              req.id === selectedRequest.id
                ? { ...req, estimateStatus: 'created', estimateId: estimate.id }
                : req
            ));
          }}
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
          clientRequests={clientRequests}
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
  const [laborRate, setLaborRate] = useState(50);
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

// Estimate Details Modal Component
interface EstimateDetailsModalProps {
  estimate: Estimate;
  clientRequests: ClientRequest[];
  onClose: () => void;
}

const EstimateDetailsModal: React.FC<EstimateDetailsModalProps> = ({ estimate, clientRequests, onClose }) => {
  // Find the original client request for this estimate
  const originalRequest = clientRequests.find((req: ClientRequest) => req.estimateId === estimate.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Estimate Details - #{estimate.id}</h2>
            <p className="text-sm text-gray-600 mt-1">Complete estimate information and original client request</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Estimate Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Estimate Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-blue-700">Total Amount</span>
                <p className="text-2xl font-bold text-blue-900">${estimate.total}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Status</span>
                <p className="text-lg font-semibold text-blue-900 capitalize">{estimate.status}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Expires</span>
                <p className="text-lg font-semibold text-blue-900">{estimate.expiryDate.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Estimate Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimate Items</h3>
            <div className="space-y-3">
              {estimate.items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Category: {item.category}</p>
                      <p className="text-sm text-gray-600">Difficulty: {item.difficulty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">${item.total}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.basePrice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Labor & Fees */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Labor & Additional Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Labor</h4>
                <p className="text-sm text-gray-600">{estimate.laborHours} hours × ${estimate.laborRate}/hr = ${estimate.laborHours * estimate.laborRate}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Additional Fees</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Disposal: ${estimate.additionalFees.disposal}</div>
                  <div>Travel: ${estimate.additionalFees.travel}</div>
                  <div>Difficulty: ${estimate.additionalFees.difficulty}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Original Client Request Details */}
          {originalRequest && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Client Request Details</h3>

              {/* Client Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Client Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Full Name:</span>
                    <p className="text-sm text-gray-900">{originalRequest.fullName || originalRequest.customerName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                    <p className="text-sm text-gray-900">{originalRequest.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <p className="text-sm text-gray-900">{originalRequest.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Service Address:</span>
                    <p className="text-sm text-gray-900">{originalRequest.serviceAddress || originalRequest.location.address}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Gate Code:</span>
                    <p className="text-sm text-gray-900">{originalRequest.gateCode || 'No gate code'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Apartment/Unit:</span>
                    <p className="text-sm text-gray-900">{originalRequest.apartmentNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Description:</span>
                    <p className="text-sm text-gray-900">{originalRequest.description}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Preferred Date:</span>
                    <p className="text-sm text-gray-900">{originalRequest.preferredDate ? originalRequest.preferredDate.toLocaleDateString() : 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Preferred Time:</span>
                    <p className="text-sm text-gray-900">{originalRequest.preferredTime || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Location on Property:</span>
                    <p className="text-sm text-gray-900">{originalRequest.locationOnProperty || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Approximate Volume:</span>
                    <p className="text-sm text-gray-900">{originalRequest.approximateVolume || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Access Considerations:</span>
                    <p className="text-sm text-gray-900">{originalRequest.accessConsiderations || 'None specified'}</p>
                  </div>
                </div>
              </div>

              {/* Material Types */}
              {originalRequest.materialTypes && originalRequest.materialTypes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Material Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {originalRequest.materialTypes.map((type: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Conditions */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Item Conditions & Special Considerations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Approximate Item Count:</span>
                    <p className="text-sm text-gray-900">{originalRequest.approximateItemCount || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Items filled with water:</span>
                    <p className="text-sm text-gray-900">{originalRequest.filledWithWater ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Items filled with oil/fuel:</span>
                    <p className="text-sm text-gray-900">{originalRequest.filledWithOil ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Hazardous materials:</span>
                    <p className="text-sm text-gray-900">{originalRequest.hazardousMaterial ? `Yes - ${originalRequest.hazardousDescription || 'Description not provided'}` : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Items tied in bags:</span>
                    <p className="text-sm text-gray-900">{originalRequest.itemsInBags ? `Yes - ${originalRequest.bagContents || 'Contents not specified'}` : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Oversized items:</span>
                    <p className="text-sm text-gray-900">{originalRequest.oversizedItems ? `Yes - ${originalRequest.oversizedDescription || 'Description not specified'}` : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Safety & Hazards */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Safety & Hazards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mold present:</span>
                    <p className="text-sm text-gray-900">{originalRequest.hasMold ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Pests present:</span>
                    <p className="text-sm text-gray-900">{originalRequest.hasPests ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Sharp objects present:</span>
                    <p className="text-sm text-gray-900">{originalRequest.hasSharpObjects ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Heavy lifting required:</span>
                    <p className="text-sm text-gray-900">{originalRequest.heavyLiftingRequired ? 'Yes (100+ lbs)' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Disassembly required:</span>
                    <p className="text-sm text-gray-900">{originalRequest.disassemblyRequired ? `Yes - ${originalRequest.disassemblyDescription || 'Description not specified'}` : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Additional Services Requested</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Donation pickup:</span>
                    <p className="text-sm text-gray-900">{originalRequest.requestDonationPickup ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Demolition add-on:</span>
                    <p className="text-sm text-gray-900">{originalRequest.requestDemolition ? `Yes - ${originalRequest.demolitionDescription || 'Description not specified'}` : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Text updates OK:</span>
                    <p className="text-sm text-gray-900">{originalRequest.textOptIn ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Priority:</span>
                    <p className="text-sm text-gray-900 capitalize">{originalRequest.priority}</p>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {originalRequest.additionalNotes && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Additional Notes</h4>
                  <p className="text-sm text-gray-900">{originalRequest.additionalNotes}</p>
                </div>
              )}

              {/* How did you hear about us */}
              {originalRequest.howDidYouHear && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">How did you hear about us?</h4>
                  <p className="text-sm text-gray-900">{originalRequest.howDidYouHear}</p>
                </div>
              )}

              {/* Photos & Media */}
              {originalRequest.attachments && originalRequest.attachments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Photos & Media</h4>
                  <p className="text-sm text-gray-900">{originalRequest.attachments.length} file(s) attached</p>
                  <div className="mt-2 text-xs text-gray-600">
                    {originalRequest.attachments.map((attachment: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FileText className="w-3 h-3" />
                        <span>{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estimate Notes */}
          {estimate.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimate Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">{estimate.notes}</p>
              </div>
            </div>
          )}

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