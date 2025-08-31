import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
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
  X
} from 'lucide-react';
import { Estimate, PropertyManager, RecurringPickup, Invoice } from '../../types';

const EstimatesDashboard: React.FC = () => {
  const { pricingItems } = useApp();
  const [activeTab, setActiveTab] = useState<'estimates' | 'property-managers' | 'recurring' | 'invoices' | 'generator'>('estimates');
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data - in real app this would come from context/API
  const [estimates, setEstimates] = useState<Estimate[]>([
    {
      id: '1',
      customerId: '1',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '555-0123',
      address: '123 Main St',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28401',
      items: [
        {
          id: '1',
          name: 'Furniture',
          category: 'Furniture',
          quantity: 2,
          basePrice: 50,
          total: 100,
          difficulty: 'medium',
          estimatedTime: 2,
          volume: { weight: 200, yardage: 4 }
        }
      ],
      laborHours: 3,
      laborRate: 50,
      additionalFees: { disposal: 25, travel: 15, difficulty: 0 },
      subtotal: 100,
      total: 290,
      status: 'sent',
      sentDate: new Date('2024-01-15'),
      expiryDate: new Date('2024-02-15'),
      notes: 'Customer requested quick turnaround',
      created: new Date('2024-01-10'),
      updated: new Date('2024-01-15'),
      volume: { weight: 200, yardage: 4 }
    },
    {
      id: '2',
      customerId: '2',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      customerPhone: '555-0456',
      address: '456 Oak Ave',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28403',
      propertyManagerId: '1',
      propertyManagerName: 'ABC Property Management',
      items: [
        {
          id: '2',
          name: 'Appliances',
          category: 'Appliances',
          quantity: 1,
          basePrice: 75,
          total: 75,
          difficulty: 'hard',
          estimatedTime: 1.5,
          volume: { weight: 150, yardage: 3 }
        }
      ],
      laborHours: 2,
      laborRate: 50,
      additionalFees: { disposal: 30, travel: 20, difficulty: 25 },
      subtotal: 75,
      total: 235,
      status: 'draft',
      expiryDate: new Date('2024-02-20'),
      notes: 'Property manager client - net 30 terms',
      created: new Date('2024-01-18'),
      updated: new Date('2024-01-18'),
      volume: { weight: 150, yardage: 3 }
    }
  ]);

  const [propertyManagers, setPropertyManagers] = useState<PropertyManager[]>([
    {
      id: '1',
      name: 'Mike Wilson',
      company: 'ABC Property Management',
      email: 'mike@abcpm.com',
      phone: '555-0789',
      address: '789 Business Blvd',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28401',
      paymentTerms: 'net30',
      taxId: '12-3456789',
      billingEmail: 'billing@abcpm.com',
      notes: 'Preferred vendor - always pays on time',
      created: new Date('2023-06-01'),
      customers: ['2', '3', '4']
    }
  ]);

  const [recurringPickups, setRecurringPickups] = useState<RecurringPickup[]>([
    {
      id: '1',
      customerId: '3',
      customerName: 'Downtown Office Complex',
      address: '321 Commerce St',
      city: 'Wilmington',
      state: 'NC',
      frequency: 'weekly',
      dayOfWeek: 2, // Tuesday
      startDate: new Date('2024-01-01'),
      isActive: true,
      estimatedVolume: { weight: 500, yardage: 8 },
      rate: 150,
      notes: 'Office waste and recycling',
      created: new Date('2024-01-01'),
      nextPickupDate: new Date('2024-01-23')
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      customerId: '2',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      propertyManagerId: '1',
      propertyManagerName: 'ABC Property Management',
      jobId: '1',
      estimateId: '2',
      items: [
        {
          id: '1',
          name: 'Junk Removal Service',
          description: 'Complete junk removal and disposal',
          quantity: 1,
          unitPrice: 235,
          total: 235
        }
      ],
      subtotal: 235,
      tax: 0,
      total: 235,
      status: 'sent',
      dueDate: new Date('2024-02-17'),
      sentDate: new Date('2024-01-18'),
      paymentTerms: 'net30',
      notes: 'Net 30 payment terms',
      created: new Date('2024-01-18'),
      updated: new Date('2024-01-18')
    }
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      totalEstimates: estimates.length,
      sentEstimates: estimates.filter(e => e.status === 'sent').length,
      acceptedEstimates: estimates.filter(e => e.status === 'accepted').length,
      pendingEstimates: estimates.filter(e => e.status === 'draft').length,
      expiredEstimates: estimates.filter(e => e.expiryDate < now).length,
      overdueInvoices: invoices.filter(i => i.dueDate < now && i.status === 'sent').length,
      totalRecurringRevenue: recurringPickups.reduce((sum, p) => sum + p.rate, 0),
      activeRecurringPickups: recurringPickups.filter(p => p.isActive).length
    };
  }, [estimates, invoices, recurringPickups]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Mail className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleSendEstimate = (estimateId: string) => {
    setEstimates(prev => prev.map(e =>
      e.id === estimateId
        ? { ...e, status: 'sent', sentDate: new Date() }
        : e
    ));
  };

  const handleCreateInvoice = (estimateId: string) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (!estimate) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      customerId: estimate.customerId,
      customerName: estimate.customerName,
      customerEmail: estimate.customerEmail,
      propertyManagerId: estimate.propertyManagerId,
      propertyManagerName: estimate.propertyManagerName,
      estimateId: estimate.id,
      items: estimate.items.map(item => ({
        id: item.id,
        name: item.name,
        description: `${item.name} - ${item.category}`,
        quantity: item.quantity,
        unitPrice: item.basePrice,
        total: item.total
      })),
      subtotal: estimate.subtotal,
      tax: 0,
      total: estimate.total,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentTerms: 'net30',
      notes: `Invoice for estimate ${estimate.id}`,
      created: new Date(),
      updated: new Date()
    };

    setInvoices(prev => [...prev, newInvoice]);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Estimates Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage estimates, property managers, and invoicing</p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Estimate</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Estimates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEstimates}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.sentEstimates}</p>
            </div>
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{stats.acceptedEstimates}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recurring Revenue</p>
              <p className="text-2xl font-bold text-purple-600">${stats.totalRecurringRevenue}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {[
              { id: 'estimates', label: 'Estimates', icon: FileText },
              { id: 'property-managers', label: 'Property Managers', icon: Building },
              { id: 'recurring', label: 'Recurring Pickups', icon: RefreshCw },
              { id: 'invoices', label: 'Invoices', icon: DollarSign },
              { id: 'generator', label: 'Create Estimate', icon: Calculator }
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
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Estimates Tab */}
          {activeTab === 'estimates' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">All Estimates</h2>
                <div className="flex space-x-2">
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {estimates.map((estimate) => (
                  <div key={estimate.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{estimate.customerName}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                            {getStatusIcon(estimate.status)}
                            <span className="ml-1 capitalize">{estimate.status}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{estimate.volume.weight} lbs, {estimate.volume.yardage} yds³</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${estimate.total}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Expires {estimate.expiryDate.toLocaleDateString()}</span>
                          </div>
                        </div>

                        {estimate.propertyManagerName && (
                          <div className="mt-2 text-sm text-gray-600">
                            <Building className="w-4 h-4 inline mr-1" />
                            {estimate.propertyManagerName}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        {estimate.status === 'draft' && (
                          <button
                            onClick={() => handleSendEstimate(estimate.id)}
                            className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send</span>
                          </button>
                        )}

                        {estimate.status === 'accepted' && (
                          <button
                            onClick={() => handleCreateInvoice(estimate.id)}
                            className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Create Invoice</span>
                          </button>
                        )}

                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Managers Tab */}
          {activeTab === 'property-managers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Property Managers</h2>
                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Manager</span>
                </button>
              </div>

              <div className="space-y-3">
                {propertyManagers.map((manager) => (
                  <div key={manager.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                        <p className="text-sm text-gray-600">{manager.company}</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div>{manager.email} • {manager.phone}</div>
                          <div>{manager.address}, {manager.city}, {manager.state}</div>
                          <div>Payment Terms: {manager.paymentTerms.toUpperCase()}</div>
                          <div>{manager.customers.length} customers</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Users className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Pickups Tab */}
          {activeTab === 'recurring' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recurring Pickups</h2>
                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Pickup</span>
                </button>
              </div>

              <div className="space-y-3">
                {recurringPickups.map((pickup) => (
                  <div key={pickup.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{pickup.customerName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pickup.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {pickup.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{pickup.address}, {pickup.city}, {pickup.state}</div>
                          <div>{pickup.frequency} • ${pickup.rate}</div>
                          <div>Next: {pickup.nextPickupDate.toLocaleDateString()}</div>
                          <div>{pickup.estimatedVolume.weight} lbs, {pickup.estimatedVolume.yardage} yds³</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
                <div className="flex space-x-2">
                  <span className="text-sm text-red-600 font-medium">
                    {stats.overdueInvoices} overdue
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{invoice.customerName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>${invoice.total} • Due: {invoice.dueDate.toLocaleDateString()}</div>
                          <div>Terms: {invoice.paymentTerms.toUpperCase()}</div>
                          {invoice.propertyManagerName && (
                            <div>{invoice.propertyManagerName}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Send className="w-4 h-4" />
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

          {/* Generator Tab */}
          {activeTab === 'generator' && (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Estimate Generator</h3>
              <p className="text-gray-600 mb-4">Create professional estimates with our easy-to-use generator</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Estimate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estimate Generator Modal */}
      {showCreateForm && (
        <EstimateGeneratorModal
          onClose={() => setShowCreateForm(false)}
          onSave={(estimate) => {
            setEstimates(prev => [...prev, estimate]);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
};

// Estimate Generator Modal Component
interface EstimateGeneratorModalProps {
  onClose: () => void;
  onSave: (estimate: Estimate) => void;
}

const EstimateGeneratorModal: React.FC<EstimateGeneratorModalProps> = ({ onClose, onSave }) => {
  const { pricingItems } = useApp();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'NC',
    zipCode: ''
  });

  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [laborRate, setLaborRate] = useState(50);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [additionalFees, setAdditionalFees] = useState({
    disposal: 0,
    travel: 0,
    difficulty: 0
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    return laborRate * estimatedHours;
  };

  const calculateAdditionalFees = () => {
    return Object.values(additionalFees).reduce((total, fee) => total + fee, 0);
  };

  const calculateTotal = () => {
    return calculateItemsSubtotal() + calculateLaborCost() + calculateAdditionalFees();
  };

  const handleSaveEstimate = () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in customer name and email');
      return;
    }

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
      customerId: `cust-${Date.now()}`,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      address: customerInfo.address,
      city: customerInfo.city,
      state: customerInfo.state,
      zipCode: customerInfo.zipCode,
      items: estimateItems,
      laborHours: estimatedHours,
      laborRate,
      additionalFees,
      subtotal: calculateItemsSubtotal(),
      total: calculateTotal(),
      status: 'draft',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: '',
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Estimate</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleCustomerChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={customerInfo.zipCode}
                      onChange={handleCustomerChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="27601"
                    />
                  </div>
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
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
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
                  <span className="text-gray-600">Labor ({estimatedHours}h @ ${laborRate}/hr)</span>
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

export default EstimatesDashboard;