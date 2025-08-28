import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  DollarSign,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const OnlineBookingForm: React.FC = () => {
  const { pricingItems, addJob } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    scheduledDate: '',
    timeSlot: '',
    notes: ''
  });
  const [selectedItems, setSelectedItems] = useState<Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    basePrice: number;
    totalPrice: number;
  }>>([]);

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM'
  ];

  const totalEstimate = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (pricingItem: any) => {
    const existingItem = selectedItems.find(item => item.id === pricingItem.id);
    
    if (existingItem) {
      setSelectedItems(prev => prev.map(item => 
        item.id === pricingItem.id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.basePrice }
          : item
      ));
    } else {
      setSelectedItems(prev => [...prev, {
        id: pricingItem.id,
        name: pricingItem.name,
        category: pricingItem.category,
        quantity: 1,
        basePrice: pricingItem.basePrice,
        totalPrice: pricingItem.basePrice
      }]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setSelectedItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.basePrice }
          : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmit = () => {
    const newJob = {
      customerId: Date.now().toString(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      scheduledDate: new Date(formData.scheduledDate),
      timeSlot: formData.timeSlot,
      estimatedHours: Math.ceil(selectedItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0)),
      items: selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        basePrice: item.basePrice,
        difficulty: 'medium' as const,
        estimatedTime: item.quantity * 30
      })),
      status: 'scheduled' as const,
      totalEstimate,
      notes: formData.notes,
      beforePhotos: [],
      afterPhotos: []
    };

    addJob(newJob);
    setStep(4); // Success step
  };

  const isFormValid = () => {
    return formData.customerName && 
           formData.customerEmail && 
           formData.customerPhone && 
           formData.address && 
           formData.city && 
           formData.state && 
           formData.scheduledDate && 
           formData.timeSlot &&
           selectedItems.length > 0;
  };

  const groupedPricingItems = pricingItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, typeof pricingItems>);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Online Booking</h1>
          <p className="text-gray-600">Book your junk removal service online</p>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[
              { number: 1, label: 'Customer Info', active: step >= 1 },
              { number: 2, label: 'Select Services', active: step >= 2 },
              { number: 3, label: 'Schedule & Review', active: step >= 3 },
              { number: 4, label: 'Confirmation', active: step === 4 }
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  stepItem.active 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {stepItem.active ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepItem.number}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  stepItem.active ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {stepItem.label}
                </span>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    stepItem.active ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.address}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Next: Select Services
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Select Services</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Categories */}
                <div className="space-y-4">
                  {Object.entries(groupedPricingItems).map(([category, items]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3 capitalize">{category}</h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                              <p className="text-sm text-gray-500">${item.basePrice} per item</p>
                            </div>
                            <button
                              onClick={() => addItem(item)}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Items */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Selected Items</h3>
                  
                  {selectedItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No items selected</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">${item.basePrice} each</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium text-gray-900">${item.totalPrice}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">Total Estimate:</span>
                          <span className="text-xl font-bold text-gray-900">${totalEstimate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedItems.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Next: Schedule & Review
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Schedule & Review</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Preferred Time *
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any special instructions or details about your junk removal needs..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Booking Summary</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Customer:</p>
                      <p className="font-medium">{formData.customerName}</p>
                      <p className="text-sm text-gray-600">{formData.customerEmail}</p>
                      <p className="text-sm text-gray-600">{formData.customerPhone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Address:</p>
                      <p className="font-medium">{formData.address}</p>
                      <p className="text-sm text-gray-600">{formData.city}, {formData.state}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Services:</p>
                      {selectedItems.map((item) => (
                        <p key={item.id} className="text-sm">
                          {item.name} x{item.quantity} - ${item.totalPrice}
                        </p>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Total Estimate:</span>
                        <span className="text-xl font-bold text-gray-900">${totalEstimate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for booking with us. We'll contact you shortly to confirm your appointment.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-600">Booking Reference: #{Date.now().toString().slice(-6)}</p>
                <p className="text-sm text-gray-600">Total Estimate: ${totalEstimate}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineBookingForm;
