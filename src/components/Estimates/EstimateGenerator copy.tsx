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
import { customersService, CreateCustomerRequest } from '../../services/customersService';
import awsUploadService from '../../services/awsUploadService';
import { useApp } from '../../contexts/AppContext';
import { usePDFGenerator } from '../../hooks/usePDFGenerator';
import { useToast } from '../../contexts/ToastContext';

const EstimatesDashboard: React.FC = () => {
  const { customers, estimates, refreshEstimates, refreshCustomers } = useApp();
  const { generateEstimatePDF, generateSimpleQuotePDF, loading: pdfLoading } = usePDFGenerator();
  const { showSuccess, showError } = useToast();
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
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showCustomerUrlModal, setShowCustomerUrlModal] = useState(false);
  const [customerReviewUrl, setCustomerReviewUrl] = useState<string>('');
  const [showFormLinkModal, setShowFormLinkModal] = useState(false);
  const [formLinkUrl, setFormLinkUrl] = useState('');

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
    // Customer address fields (for new customers only)
    customerAddress: '',
    customerCity: '',
    customerState: '',
    customerZipCode: '',
    // Service address (for estimate request)
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
      
      // Check if estimate has a quote amount
      if (!estimate.quote_amount || estimate.quote_amount <= 0) {
        alert('Please set a quote amount before sending to customer.');
        return;
      }
      
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
          
          // UPDATE FIELDS - These are what we want to change (don't change status when sending to customer)
          amount: estimate.quote_amount, // Set amount column to same value as quote_amount
          quote_amount: estimate.quote_amount,
          quote_notes: estimate.quote_notes
        }
      );
      
      console.log('Estimate sent to customer successfully');
      await refreshEstimates();
      
      // Generate customer review URL using hash routing
      const isProduction = import.meta.env.VITE_API_BASE_URL?.includes('junkremovalapi.onrender.com');
      const baseUrl = isProduction 
        ? 'https://junkremovalappplanner.com' 
        : window.location.origin;
      const url = `${baseUrl}/app/#/customer-review/${estimate.id}`;
      setCustomerReviewUrl(url);
      setShowCustomerUrlModal(true);
    } catch (error) {
      console.error('Failed to send estimate to customer:', error);
      alert('Failed to send estimate to customer. Please try again.');
    }
  };

  const handleSendFormToCustomer = async () => {
    try {
      // Generate a unique form link using the API endpoint
      const isProduction = import.meta.env.VITE_API_BASE_URL?.includes('junkremovalapi.onrender.com');
      const baseUrl = isProduction 
        ? 'https://junkremovalappplanner.com' 
        : window.location.origin;
      
      // Generate a unique form ID (using timestamp and random string)
      const formId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const formUrl = `${baseUrl}/customer-form/${formId}`;

      // Here you would typically save the form link to your database 
      // For now, we'll just show the link to the user
      console.log('Generated form link for customer:', {
        formUrl,
        formId
      });

      // Show the form link modal (same pattern as customer review)
      setFormLinkUrl(formUrl);
      setShowFormLinkModal(true);
    } catch (error: any) {
      console.error('Error generating form link:', error);
      showError(`Failed to generate form link: ${error.message}`);
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
      showError('Please select an existing customer');
      return;
    }

    if (requestFormData.isNewCustomer && (!requestFormData.fullName || !requestFormData.phone || !requestFormData.email || !requestFormData.customerAddress || !requestFormData.customerCity || !requestFormData.customerState || !requestFormData.customerZipCode || !requestFormData.serviceAddress || !requestFormData.locationOnProperty || !requestFormData.approximateVolume)) {
      showError('Please fill in all required fields for new customer');
      return;
    }

    try {
      setUploadingFiles(true);
      let customerId = requestFormData.selectedCustomerId;

      // Step 1: Create new customer if needed
      if (requestFormData.isNewCustomer) {
        try {
          console.log('=== CREATING NEW CUSTOMER ===');
          const customerData: CreateCustomerRequest = {
            name: requestFormData.fullName,
            email: requestFormData.email,
            phone: requestFormData.phone.replace(/[\s\-\(\)]/g, ''),
            address: requestFormData.customerAddress,
            city: requestFormData.customerCity,
            state: requestFormData.customerState,
            zip_code: requestFormData.customerZipCode,
            customer_type: 'residential',
            status: 'new'
          };

          console.log('Customer data being sent:', JSON.stringify(customerData, null, 2));
          const customerResponse = await customersService.createCustomer(customerData);
          
          console.log('Customer service response:', customerResponse);
          
          if (customerResponse.success) {
            customerId = customerResponse.data.customer.id.toString();
            console.log('✅ Customer created successfully with ID:', customerId);
            console.log('Customer details:', customerResponse.data.customer);
            showSuccess('New customer created successfully!');
            
            // Refresh customers list
            if (refreshCustomers) {
              await refreshCustomers();
            }
          } else {
            console.error('❌ Customer creation failed:', customerResponse);
            throw new Error(customerResponse.message || 'Failed to create customer');
          }
        } catch (error: any) {
          console.error('❌ Error creating customer:', error);
          console.error('Customer creation error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          showError(`Failed to create customer: ${error.message}`);
          setUploadingFiles(false);
          return;
        }
      }

      // Step 2: Upload photos and videos
      let uploadedPhotos: string[] = [];
      let uploadedVideos: string[] = [];

      try {
        console.log('=== UPLOADING FILES ===');
        console.log('Photos to upload:', requestFormData.photos.length);
        console.log('Videos to upload:', requestFormData.videos.length);
        console.log('Customer ID for metadata:', customerId);

        // Upload photos (try multiple first, fallback to single)
        if (requestFormData.photos.length > 0) {
          console.log('Uploading photos:', requestFormData.photos.length);
          
          // Validate all photos first
          const validPhotos = [];
          for (const file of requestFormData.photos) {
            const validation = awsUploadService.validateFile(file, 10); // 10MB limit for photos
            if (validation.valid) {
              validPhotos.push(file);
            } else {
              console.error(`❌ Photo validation failed for ${file.name}:`, validation.error);
            }
          }
          
          if (validPhotos.length > 0) {
            try {
              // Try multiple upload first
              console.log('Attempting multiple photo upload...');
              const photoResponse = await awsUploadService.uploadMultipleFiles(
                validPhotos,
                { upload_type: 'estimate_request', customer_id: customerId },
                ['estimate', 'photos']
              );
              
              console.log('Multiple photo upload response:', photoResponse);
              
              if (photoResponse.success) {
                // Handle different response formats
                if (Array.isArray(photoResponse.data)) {
                  // Multiple files response
                  uploadedPhotos = photoResponse.data.map((item: any) => item.file_url || item.url);
                } else if (photoResponse.data && photoResponse.data.file_url) {
                  // Single file response (shouldn't happen with multiple, but just in case)
                  uploadedPhotos = [photoResponse.data.file_url];
                } else if (photoResponse.data && Array.isArray((photoResponse.data as any).files)) {
                  // Alternative array format
                  uploadedPhotos = (photoResponse.data as any).files.map((item: any) => item.file_url || item.url);
                } else {
                  console.error('❌ Unexpected multiple upload response format:', photoResponse.data);
                  throw new Error('Unexpected response format');
                }
                console.log('✅ Multiple photos uploaded successfully:', uploadedPhotos);
              } else {
                throw new Error(photoResponse.message || 'Multiple upload failed');
              }
            } catch (error) {
              console.warn('Multiple photo upload failed, falling back to single uploads:', error);
              
              // Fallback to single uploads
              for (let i = 0; i < validPhotos.length; i++) {
                const file = validPhotos[i];
                console.log(`Uploading photo ${i + 1}/${validPhotos.length}:`, file.name);
                
                const singlePhotoResponse = await awsUploadService.uploadFile(
                  file,
                  { upload_type: 'estimate_request', customer_id: customerId },
                  ['estimate', 'photos']
                );
                
                if (singlePhotoResponse.success) {
                  uploadedPhotos.push(singlePhotoResponse.data.file_url);
                  console.log(`✅ Photo ${i + 1} uploaded successfully:`, singlePhotoResponse.data.file_url);
                } else {
                  console.error(`❌ Photo ${i + 1} upload failed:`, singlePhotoResponse);
                }
              }
            }
          }
          console.log('✅ All photos processed:', uploadedPhotos);
        }

        // Upload videos (try multiple first, fallback to single)
        if (requestFormData.videos.length > 0) {
          console.log('Uploading videos:', requestFormData.videos.length);
          
          // Validate all videos first
          const validVideos = [];
          for (const file of requestFormData.videos) {
            const validation = awsUploadService.validateFile(file, 50); // 50MB limit for videos
            if (validation.valid) {
              validVideos.push(file);
            } else {
              console.error(`❌ Video validation failed for ${file.name}:`, validation.error);
            }
          }
          
          if (validVideos.length > 0) {
            try {
              // Try multiple upload first
              console.log('Attempting multiple video upload...');
              const videoResponse = await awsUploadService.uploadMultipleFiles(
                validVideos,
                { upload_type: 'estimate_request', customer_id: customerId },
                ['estimate', 'videos']
              );
              
              console.log('Multiple video upload response:', videoResponse);
              
              if (videoResponse.success) {
                // Handle different response formats
                if (Array.isArray(videoResponse.data)) {
                  // Multiple files response
                  uploadedVideos = videoResponse.data.map((item: any) => item.file_url || item.url);
                } else if (videoResponse.data && videoResponse.data.file_url) {
                  // Single file response (shouldn't happen with multiple, but just in case)
                  uploadedVideos = [videoResponse.data.file_url];
                } else if (videoResponse.data && Array.isArray((videoResponse.data as any).files)) {
                  // Alternative array format
                  uploadedVideos = (videoResponse.data as any).files.map((item: any) => item.file_url || item.url);
                } else {
                  console.error('❌ Unexpected multiple upload response format:', videoResponse.data);
                  throw new Error('Unexpected response format');
                }
                console.log('✅ Multiple videos uploaded successfully:', uploadedVideos);
              } else {
                throw new Error(videoResponse.message || 'Multiple upload failed');
              }
            } catch (error) {
              console.warn('Multiple video upload failed, falling back to single uploads:', error);
              
              // Fallback to single uploads
              for (let i = 0; i < validVideos.length; i++) {
                const file = validVideos[i];
                console.log(`Uploading video ${i + 1}/${validVideos.length}:`, file.name);
                
                const singleVideoResponse = await awsUploadService.uploadFile(
                  file,
                  { upload_type: 'estimate_request', customer_id: customerId },
                  ['estimate', 'videos']
                );
                
                if (singleVideoResponse.success) {
                  uploadedVideos.push(singleVideoResponse.data.file_url);
                  console.log(`✅ Video ${i + 1} uploaded successfully:`, singleVideoResponse.data.file_url);
                } else {
                  console.error(`❌ Video ${i + 1} upload failed:`, singleVideoResponse);
                }
              }
            }
          }
          console.log('✅ All videos processed:', uploadedVideos);
        }
      } catch (error: any) {
        console.error('❌ Error uploading files:', error);
        console.error('File upload error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        showError(`Failed to upload files: ${error.message}`);
        setUploadingFiles(false);
        return;
      }

      // Step 3: Create estimate request
      try {
        console.log('=== CREATING ESTIMATE REQUEST ===');
        console.log('Customer ID to use:', customerId);
        console.log('Is new customer:', requestFormData.isNewCustomer);
        console.log('Uploaded photos:', uploadedPhotos);
        console.log('Uploaded videos:', uploadedVideos);

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
          existing_client_id: requestFormData.isNewCustomer ? parseInt(customerId) : parseInt(requestFormData.selectedCustomerId),
        ok_to_text: Boolean(requestFormData.textOptIn),
        gate_code: requestFormData.gateCode || null,
        apartment_unit: requestFormData.apartmentNumber || null,
        preferred_date: formatDateForMySQL(requestFormData.preferredDate),
        preferred_time: requestFormData.preferredTime || null,
        access_considerations: requestFormData.accessConsiderations || null,
          photos: uploadedPhotos.length > 0 ? uploadedPhotos : null,
          videos: uploadedVideos.length > 0 ? uploadedVideos : null,
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

        console.log('Estimate data being sent:', JSON.stringify(estimateData, null, 2));

        // Submit the estimate request
        const response = await estimatesService.createEstimate(estimateData);
        
        console.log('Estimate service response:', response);
        
        if (response.success) {
          console.log('✅ Estimate request created successfully:', response.data);
          showSuccess('Request submitted successfully! We\'ll review it and send you a quote within 24 hours.');
      
      // Reset form
      setRequestFormData({
        isNewCustomer: true,
        selectedCustomerId: '',
        fullName: '',
        phone: '',
        email: '',
            customerAddress: '',
            customerCity: '',
            customerState: '',
            customerZipCode: '',
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
            priority: 'standard' as 'standard' | 'urgent' | 'low',
        textOptIn: false
      });

      setShowNewRequest(false);
      await refreshEstimates();
        } else {
          console.error('❌ Failed to create estimate request:', response);
          showError(`Failed to submit request: ${response.message || 'Unknown error'}`);
        }
    } catch (error: any) {
        console.error('❌ Error creating estimate request:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        showError(`Error submitting request: ${error.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error in handleSubmitRequest:', error);
      showError(`Error submitting request: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingFiles(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Estimates & Client Requests</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage client portal requests and create estimates</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowNewRequest(true)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Request</span>
          </button>
          <button
            onClick={handleSendFormToCustomer}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Send className="w-4 h-4" />
            <span>Send Form to Customer</span>
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
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 sm:p-6">
          {/* Client Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 text-center sm:text-left">Pending Client Requests</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={refreshEstimates}
                    className="flex items-center justify-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors"
                    title="Refresh Requests"
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Refresh</span>
                  </button>
                  <select className="px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm">
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
                  <div key={request.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-center sm:text-left">Request #{request.id}</h3>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstimateStatusColor(request.status)}`}>
                              {(request.status || 'need review').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.request_priority)}`}>
                              {(request.request_priority || 'standard').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-600 mb-2 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start space-x-1">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{request.full_name}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start space-x-1">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{request.phone_number}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start space-x-1">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{request.email_address}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-600 mb-2 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start space-x-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{request.service_address}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start space-x-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Created: {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start space-x-1">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{request.approximate_volume}</span>
                          </div>
                        </div>

                        {request.additional_notes && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 text-center sm:text-left">{request.additional_notes}</p>
                        )}

                        {request.material_types && Array.isArray(request.material_types) && request.material_types.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2 justify-center sm:justify-start">
                            {request.material_types.map((type: any, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-col space-y-2 sm:space-y-2">
                        <button
                          onClick={() => handleViewEstimate(request)}
                          className="flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleCalculateQuote(request)}
                          className="flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
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
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 text-center sm:text-left">Estimates</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={refreshEstimates}
                    className="flex items-center justify-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors"
                    title="Refresh Estimates"
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Refresh</span>
                  </button>
                  <select className="px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm">
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
                    <div key={estimate.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-center sm:text-left">Estimate #{estimate.id}</h3>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstimateStatusColor(estimate.status)}`}>
                              {(estimate.status || 'need review').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(estimate.request_priority)}`}>
                              {(estimate.request_priority || 'standard').toUpperCase()}
                            </span>
                          </div>
                        </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                            <div>
                              <div className="font-medium text-gray-900 mb-1">Customer Information</div>
                              <div>Name: {estimate.full_name}</div>
                              <div>Phone: {estimate.phone_number}</div>
                              <div>Email: {estimate.email_address}</div>
                        </div>
                            <div>
                              <div className="font-medium text-gray-900 mb-1">Service Details</div>
                              <div>Address: {estimate.service_address}</div>
                              <div>Location: {estimate.location_on_property}</div>
                              <div>Volume: {estimate.approximate_volume}</div>
                              <div>Materials: {estimate.material_types?.join(', ') || 'N/A'}</div>
                            </div>
                          </div>
                          {estimate.quote_amount && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center sm:text-left">
                              <div className="text-xs sm:text-sm font-medium text-green-800">
                                Quote Amount: ${(estimate.quote_amount || 0).toLocaleString()}
                              </div>
                            </div>
                          )}
                          {estimate.additional_notes && (
                            <p className="mt-2 text-xs sm:text-sm text-gray-600 text-center sm:text-left">Notes: {estimate.additional_notes}</p>
                          )}
                          <div className="mt-2 text-xs text-gray-500 text-center sm:text-left">
                            Created: {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'N/A'} at {estimate.created_at ? new Date(estimate.created_at).toLocaleTimeString() : 'N/A'}
                      </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-col space-y-2 sm:space-y-2 sm:ml-4">
                        <button
                          onClick={() => handleViewEstimate(estimate)}
                          className="flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Edit Details</span>
                        </button>
                        <button
                          onClick={() => handleSendToCustomer(estimate)}
                          className="flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Send to Customer for Review</span>
                          <span className="sm:hidden">Send to Customer</span>
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
          uploadingFiles={uploadingFiles}
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
                  status: 'quoted',
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
                <div className="space-y-3">
                  <div className="flex">
                    <input
                      type="text"
                      value={customerReviewUrl}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(customerReviewUrl);
                        alert('URL copied to clipboard!');
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        window.open(customerReviewUrl, '_blank');
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Open in New Tab</span>
                    </button>
                  </div>
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

      {/* Form Link Modal */}
      {showFormLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Form Link Generated</h2>
                <p className="text-sm text-gray-600 mt-1">Send this link to your customer so they can request an estimate</p>
              </div>
              <button 
                onClick={() => setShowFormLinkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Form URL
                </label>
                <div className="space-y-3">
                  <div className="flex">
                    <input
                      type="text"
                      value={formLinkUrl}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(formLinkUrl);
                        alert('URL copied to clipboard!');
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        window.open(formLinkUrl, '_blank');
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Open in New Tab</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">What happens next?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Customer visits the URL to fill out the estimate request form</li>
                      <li>• Form submission creates a pending estimate request</li>
                      <li>• You can then review and quote the request as normal</li>
                      <li>• Customer will receive their estimate for approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setShowFormLinkModal(false)}
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
  uploadingFiles: boolean;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({
  onClose,
  onSubmit,
  formData,
  setFormData,
  handleMaterialTypeToggle,
  customers,
  handleCustomerSelection,
  uploadingFiles
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

          {/* Customer Address (New Customers Only) */}
          {formData.isNewCustomer && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Customer Address
                <span className="ml-2 text-sm text-red-500 font-normal">* Required for new customers</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required={formData.isNewCustomer}
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required={formData.isNewCustomer}
                    value={formData.customerCity}
                    onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required={formData.isNewCustomer}
                    value={formData.customerState}
                    onChange={(e) => setFormData({ ...formData, customerState: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                  <input
                    type="text"
                    required={formData.isNewCustomer}
                    value={formData.customerZipCode}
                    onChange={(e) => setFormData({ ...formData, customerZipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This address will be saved to your customer profile and can be different from the service address below.
              </p>
            </div>
          )}

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
                  placeholder="Street address where junk removal will occur (can be different from customer address)"
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
              disabled={uploadingFiles}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingFiles}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploadingFiles && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>
                {uploadingFiles ? 'Creating Customer & Uploading Files...' : 'Submit Request for Quote'}
              </span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Photos & Media
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {estimate.photos && estimate.photos.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Photos ({estimate.photos.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {estimate.photos.map((photoUrl: string, index: number) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={photoUrl}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => window.open(photoUrl, '_blank')}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-2 transition-all duration-200">
                              <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                
                {estimate.videos && estimate.videos.length > 0 && (
            <div>
                    <h4 className="font-medium text-gray-900 mb-3">Videos ({estimate.videos.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {estimate.videos.map((videoUrl: string, index: number) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                            <video
                              src={videoUrl}
                              className="w-full h-full object-cover cursor-pointer"
                              controls
                              preload="metadata"
                            />
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 truncate" title={videoUrl}>
                              Video {index + 1}
                            </p>
                            <button
                              onClick={() => window.open(videoUrl, '_blank')}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              Open in new tab
                            </button>
                          </div>
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