import React, { useState } from 'react';
import { MapPin, Calendar, Package, FileText, AlertTriangle, CheckCircle2, X, Info, UserPlus } from 'lucide-react';
import { publicEstimatesService, PublicEstimateRequest } from '../../services/publicEstimatesService';

interface CustomerFormPageProps {
  formId: string;
}

const CustomerFormPage: React.FC<CustomerFormPageProps> = ({ formId }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceAddress: '',
    locationOnProperty: '',
    approximateVolume: '',
    materialTypes: [] as string[],
    textOptIn: false,
    gateCode: '',
    apartmentNumber: '',
    preferredDate: '',
    preferredTime: '',
    accessConsiderations: '',
    approximateItemCount: '',
    photos: [] as File[],
    videos: [] as File[],
    additionalNotes: '',
    howDidYouHear: '',
    priority: 'standard' as 'standard' | 'urgent' | 'low'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleMaterialTypeToggle = (materialType: string) => {
    setFormData(prev => ({
      ...prev,
      materialTypes: prev.materialTypes.includes(materialType)
        ? prev.materialTypes.filter(type => type !== materialType)
        : [...prev.materialTypes, materialType]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.email || !formData.serviceAddress || !formData.locationOnProperty || !formData.approximateVolume) {
      setError('Please fill in all required fields (Name, Phone, Email, Service Address, Location on Property, Approximate Volume)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create the estimate request in the exact format expected by the API
      const estimateRequest: PublicEstimateRequest = {
        full_name: formData.fullName,
        phone_number: formData.phone,
        email_address: formData.email,
        service_address: formData.serviceAddress,
        location_on_property: formData.locationOnProperty,
        approximate_volume: formData.approximateVolume,
        material_types: formData.materialTypes,
        photos: formData.photos.map(file => URL.createObjectURL(file)), // Convert files to URLs for now
        videos: formData.videos.map(file => URL.createObjectURL(file)), // Convert files to URLs for now
        gate_code: formData.gateCode || undefined,
        apartment_unit: formData.apartmentNumber || undefined,
        preferred_date: formData.preferredDate || undefined,
        preferred_time: formData.preferredTime || undefined,
        access_considerations: formData.accessConsiderations || undefined,
        approximate_item_count: formData.approximateItemCount || undefined,
        additional_notes: formData.additionalNotes || undefined,
        how_did_you_hear: formData.howDidYouHear || undefined,
        request_priority: formData.priority,
        ok_to_text: formData.textOptIn,
        items_filled_water: false,
        hazardous_materials: false,
        mold_present: false,
        request_donation_pickup: false,
        request_demolition_addon: false,
        items_filled_oil_fuel: false,
        items_tied_bags: false,
        oversized_items: false,
        pests_present: false,
        sharp_objects: false,
        heavy_lifting_required: false,
        disassembly_required: false
      };

      await publicEstimatesService.createEstimate(estimateRequest);
      
      setSuccess('Thank you! Your junk removal request has been submitted successfully. We will review your request and provide you with a quote within 24 hours.');
      
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        serviceAddress: '',
        locationOnProperty: '',
        approximateVolume: '',
        materialTypes: [],
        textOptIn: false,
        gateCode: '',
        apartmentNumber: '',
        preferredDate: '',
        preferredTime: '',
        accessConsiderations: '',
        approximateItemCount: '',
        photos: [],
        videos: [],
        additionalNotes: '',
        howDidYouHear: '',
        priority: 'standard'
      });

    } catch (error: any) {
      console.error('Failed to submit estimate request:', error);
      setError('Failed to submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
            <p className="text-gray-600 mb-6">{success}</p>
            <button
              onClick={() => window.location.href = '/app/'}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Junk Removal Request Form</h1>
          <p className="text-gray-600">Fill out this form to get your free junk removal estimate</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* Required Fields Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Required Fields</h4>
                  <p className="text-sm text-blue-700">
                    Fields marked with <span className="text-red-500 font-semibold">*</span> are required for a complete quote request.
                  </p>
                </div>
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
                  </label>
                  <input
                    type="text"
                    required={true}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required={true}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required={true}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.textOptIn}
                    onChange={(e) => setFormData({ ...formData, textOptIn: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">OK to text me updates</span>
                </div>
              </div>
            </div>

            {/* Service Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Service Address
                <span className="ml-2 text-sm text-red-500 font-normal">* Where the junk removal will occur</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Address *
                  </label>
                  <input
                    type="text"
                    required={true}
                    value={formData.serviceAddress}
                    onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address where junk removal will occur"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Anything else we should know about your project?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFormData({ ...formData, photos: files });
                      }}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-600">Click to upload photos or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    </label>
                  </div>
                  {formData.photos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected photos ({formData.photos.length}):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formData.photos.map((file: File, index: number) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const newPhotos = formData.photos.filter((_: File, i: number) => i !== index);
                                  setFormData({ ...formData, photos: newPhotos });
                                }}
                                className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="mt-1">
                              <p className="text-xs text-gray-600 truncate" title={file.name}>{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Videos (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFormData({ ...formData, videos: files });
                      }}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-600">Click to upload videos or drag and drop</p>
                        <p className="text-xs text-gray-500">MP4, AVI, MOV up to 50MB each</p>
                      </div>
                    </label>
                  </div>
                  {formData.videos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected videos ({formData.videos.length}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.videos.map((file: File, index: number) => (
                          <div key={index} className="relative group">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-full object-cover"
                                controls={false}
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-50 rounded-full p-2">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-2 right-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const newVideos = formData.videos.filter((_: File, i: number) => i !== index);
                                  setFormData({ ...formData, videos: newVideos });
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="mt-1">
                              <p className="text-xs text-gray-600 truncate" title={file.name}>{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>
                  {submitting ? 'Submitting Request...' : 'Submit Request for Quote'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Form ID: {formId}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerFormPage;
