import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Calculator, Plus, Minus, Mail, Phone, Download } from 'lucide-react';

const EstimateGenerator: React.FC = () => {
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

  const handleSendEstimate = () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in customer name and email');
      return;
    }

    // In a real app, this would send the estimate via email
    alert(`Estimate sent to ${customerInfo.email}`);
  };

  const handleDownloadEstimate = () => {
    // In a real app, this would generate a PDF
    alert('Estimate downloaded');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Estimate Generator</h1>
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-500">Quick & Professional Estimates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items to Remove</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pricingItems.map(item => {
              const quantity = selectedItems[item.id] || 0;
              const total = calculateItemTotal(item.id);
              
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimate Summary</h2>
          
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
              onClick={handleSendEstimate}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Send Estimate</span>
            </button>
            
            <button
              onClick={handleDownloadEstimate}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              * Estimate valid for 30 days. Final price may vary based on actual conditions and accessibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateGenerator;