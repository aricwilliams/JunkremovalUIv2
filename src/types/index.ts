export interface Customer {
  id: number;
  business_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  customer_type: 'residential' | 'commercial' | 'industrial' | 'government';
  status: 'new' | 'quoted' | 'scheduled' | 'completed' | 'inactive' | 'blacklisted';
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  zipCode?: string;
  created?: Date;
  tags?: string[];
  notes?: string;
  propertyManagerId?: string;
  paymentTerms?: 'immediate' | 'net15' | 'net30' | 'net60';
  isCommercial?: boolean;
  portalAccess?: boolean;
  portalCredentials?: {
    username: string;
    password: string;
  };
}

export interface EstimateRequest {
  id: number;
  is_new_client: boolean;
  existing_client_id?: number;
  full_name: string;
  phone_number: string;
  email_address: string;
  ok_to_text: boolean;
  service_address: string;
  gate_code?: string;
  apartment_unit?: string;
  preferred_date?: string;
  preferred_time?: string;
  location_on_property: string;
  approximate_volume: string;
  access_considerations?: string;
  photos?: string[];
  videos?: string[];
  material_types: string[];
  approximate_item_count?: string;
  items_filled_water: boolean;
  items_filled_oil_fuel: boolean;
  hazardous_materials: boolean;
  items_tied_bags: boolean;
  oversized_items: boolean;
  mold_present: boolean;
  pests_present: boolean;
  sharp_objects: boolean;
  heavy_lifting_required: boolean;
  disassembly_required: boolean;
  additional_notes?: string;
  request_donation_pickup: boolean;
  request_demolition_addon: boolean;
  how_did_you_hear?: string;
  request_priority: 'standard' | 'urgent' | 'low';
  status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'declined' | 'expired' | 'need review' | 'scheduled' | 'in progress' | 'completed' | 'cancelled';
  quote_amount?: number;
  quote_notes?: string;
  created_at: string;
  updated_at: string;
  existing_customer_name?: string;
  existing_customer_email?: string;
  existing_customer_phone?: string;
  existing_customer_address?: string;
  existing_customer_city?: string;
  existing_customer_state?: string;
  existing_customer_zip_code?: string;
}

export interface PropertyManager {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentTerms: 'immediate' | 'net15' | 'net30' | 'net60';
  taxId: string;
  billingEmail: string;
  notes: string;
  created: Date;
  customers: string[]; // Customer IDs
}

export interface Truck {
  id: string;
  name: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  capacity: {
    weight: number; // in pounds
    volume: number; // in cubic yards
  };
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  assignedCrew?: string; // Crew ID
  assignedJob?: string; // Job ID
  maintenanceHistory: MaintenanceRecord[];
  fuelLevel: number; // percentage
  mileage: number;
  lastServiceDate: Date;
  nextServiceDate: Date;
  insurance: {
    policyNumber: string;
    expiryDate: Date;
    provider: string;
  };
  registration: {
    number: string;
    expiryDate: Date;
  };
  notes: string;
  created: Date;
  updated: Date;
}

export interface MaintenanceRecord {
  id: string;
  truckId: string;
  date: Date;
  type: 'routine' | 'repair' | 'emergency';
  description: string;
  cost: number;
  mileage: number;
  performedBy: string; // Employee ID
  nextServiceMileage?: number;
  nextServiceDate?: Date;
  receipts: string[]; // URLs to receipt images
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  employeeType: 'manager' | 'regular' | '1099';
  position: 'driver' | 'helper' | 'supervisor' | 'manager' | 'admin';
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  hireDate: Date;
  terminationDate?: Date;
  portalCredentials?: {
    username: string;
    email: string;
    password: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents: {
    driversLicense: {
      number: string;
      expiryDate: Date;
      state: string;
    };
    backgroundCheck: {
      completed: boolean;
      date?: Date;
      status: 'pending' | 'passed' | 'failed';
    };
    drugTest: {
      completed: boolean;
      date?: Date;
      status: 'pending' | 'passed' | 'failed';
    };
  };
  certifications: Certification[];
  assignedCrew?: string; // Crew ID
  assignedTruck?: string; // Truck ID
  payRate: {
    hourly: number;
    overtime: number;
  };
  schedule: WorkSchedule;
  performance: {
    rating: number; // 1-5
    reviews: PerformanceReview[];
  };
  notes: string;
  created: Date;
  updated: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
}

export interface WorkSchedule {
  monday: { start: string; end: string; available: boolean };
  tuesday: { start: string; end: string; available: boolean };
  wednesday: { start: string; end: string; available: boolean };
  thursday: { start: string; end: string; available: boolean };
  friday: { start: string; end: string; available: boolean };
  saturday: { start: string; end: string; available: boolean };
  sunday: { start: string; end: string; available: boolean };
}

export interface PerformanceReview {
  id: string;
  date: Date;
  reviewer: string; // Employee ID
  rating: number; // 1-5
  comments: string;
  goals: string[];
  nextReviewDate: Date;
}

export interface Crew {
  id: string;
  name: string;
  members: string[]; // Employee IDs
  capacity: number;
  isAvailable: boolean;
  currentJob?: string;
  assignedTruck?: string; // Truck ID
  supervisor?: string; // Employee ID
  schedule: WorkSchedule;
  performance: {
    averageRating: number;
    completedJobs: number;
    onTimeRate: number;
  };
  created: Date;
  updated: Date;
}

export interface Estimate {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyManagerId?: string;
  propertyManagerName?: string;
  items: EstimateItem[];
  laborHours: number;
  laborRate: number;
  additionalFees: {
    disposal: number;
    travel: number;
    difficulty: number;
  };
  subtotal: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  sentDate?: Date;
  expiryDate: Date;
  notes: string;
  created: Date;
  updated: Date;
  volume: {
    weight: number; // in pounds
    yardage: number; // in cubic yards
  };
  recurringPickupId?: string;
}

export interface EstimateItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  basePrice: number;
  total: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  volume: {
    weight: number;
    yardage: number;
  };
}

export interface RecurringPickup {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31 for monthly/quarterly
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  estimatedVolume: {
    weight: number;
    yardage: number;
  };
  rate: number;
  notes: string;
  created: Date;
  nextPickupDate: Date;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  propertyManagerId?: string;
  propertyManagerName?: string;
  jobId?: string;
  estimateId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  sentDate?: Date;
  paidDate?: Date;
  paymentTerms: 'immediate' | 'net15' | 'net30' | 'net60';
  notes: string;
  created: Date;
  updated: Date;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Job {
  id: number;
  business_id: number;
  customer_id: number;
  estimate_id?: number;
  assigned_employee_id?: number;
  title: string;
  description?: string;
  scheduled_date: string;
  completion_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  total_cost?: number;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
  };
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    job_title: string;
  };
  estimate?: {
    id: number;
    title: string;
    amount: number;
    status: string;
  };
  // Legacy fields for backward compatibility
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  scheduledDate?: Date;
  timeSlot?: string;
  estimatedHours?: number;
  items?: JobItem[];
  crewId?: string;
  truckId?: string;
  totalEstimate?: number;
  actualTotal?: number;
  notes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  created?: Date;
  updated?: Date;
  propertyManagerId?: string;
  volume?: {
    weight: number;
    yardage: number;
  };
}

export interface JobItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  basePrice: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  crewId?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  source: 'website' | 'google' | 'yelp' | 'referral' | 'facebook' | 'other';
  status: 'new' | 'contacted' | 'quoted' | 'scheduled' | 'lost';
  created: Date;
  notes: string;
  estimatedValue: number;
}

export interface PricingItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  pricePerUnit: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  volume: {
    weight: number;
    yardage: number;
  };
}

// Client Portal Types
export interface PortalUser {
  id: string;
  customerId: string;
  username: string;
  email: string;
  role: 'owner' | 'manager' | 'employee';
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
  created: Date;
}

export interface PortalRequest {
  id: string;
  customerId: string;
  customerName: string;
  type: 'pickup' | 'service' | 'quote' | 'support';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'standard';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  subject: string;
  description: string;
  requestedDate: Date;
  preferredDate?: Date;
  preferredTime?: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  volume?: {
    weight: number;
    yardage: number;
  };
  attachments: string[]; // URLs to uploaded files
  assignedTo?: string; // Employee ID
  notes: string;
  created: Date;
  updated: Date;
  // Additional fields for junk removal requests
  fullName?: string;
  phone?: string;
  email?: string;
  serviceAddress?: string;
  gateCode?: string;
  apartmentNumber?: string;
  locationOnProperty?: string;
  accessConsiderations?: string;
  approximateVolume?: string;
  materialTypes?: string[];
  filledWithWater?: boolean;
  filledWithOil?: boolean;
  hazardousMaterial?: boolean;
  hazardousDescription?: string;
  itemsInBags?: boolean;
  bagContents?: string;
  oversizedItems?: boolean;
  oversizedDescription?: string;
  approximateItemCount?: string;
  hasMold?: boolean;
  hasPests?: boolean;
  hasSharpObjects?: boolean;
  heavyLiftingRequired?: boolean;
  disassemblyRequired?: boolean;
  disassemblyDescription?: string;
  additionalNotes?: string;
  requestDonationPickup?: boolean;
  requestDemolition?: boolean;
  demolitionDescription?: string;
  howDidYouHear?: string;
  textOptIn?: boolean;
}

export interface PortalReport {
  id: string;
  customerId: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  data: {
    totalJobs: number;
    totalVolume: {
      weight: number;
      yardage: number;
    };
    totalSpent: number;
    averageJobValue: number;
    jobsByMonth: Array<{
      month: string;
      jobs: number;
      revenue: number;
      volume: {
        weight: number;
        yardage: number;
      };
    }>;
  };
  generatedDate: Date;
  downloadUrl: string;
}

// Client Request that can be converted to Estimate
export interface ClientRequest extends PortalRequest {
  estimateId?: string;
  canCreateEstimate: boolean;
  estimateStatus: 'pending' | 'created' | 'sent' | 'accepted' | 'rejected';
}

export interface Analytics {
  totalRevenue: number;
  totalJobs: number;
  averageJobValue: number;
  completionRate: number;
  customerSatisfaction: number;
  monthlyRevenue: number[];
  jobsBySource: Record<string, number>;
  topServices: Array<{ name: string; count: number; revenue: number }>;
  estimatesStats: {
    total: number;
    sent: number;
    accepted: number;
    pending: number;
    expired: number;
  };
  recurringPickups: {
    total: number;
    active: number;
    revenue: number;
  };
  overdueInvoices: {
    count: number;
    amount: number;
  };
  fleetStats: {
    totalTrucks: number;
    availableTrucks: number;
    inUseTrucks: number;
    maintenanceTrucks: number;
  };
  employeeStats: {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    averageRating: number;
  };
  portalStats: {
    totalUsers: number;
    activeUsers: number;
    totalRequests: number;
    pendingRequests: number;
  };
}

// Twilio Calling Service Types
export interface PhoneNumber {
  id: string | number;
  phone_number: string;
  business_id?: string | number;
  twilio_sid?: string;
  friendly_name?: string;
  websiteId?: string;
  provider?: string;
  monthlyFee?: number;
  monthly_cost?: string;
  callCount?: number;
  status?: "active" | "inactive";
  is_active?: number;
  country: string;
  region?: string;
  locality?: string;
  purchase_price?: string;
  purchase_price_unit?: string;
  capabilities: {
    voice?: boolean;
    sms?: boolean;
  };
  created_at?: string;
  updated_at?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TwilioCall {
  id: string | number;
  call_sid?: string;
  callSid?: string;
  business_id?: string | number;
  userId?: string;
  phone_number_id?: string | number;
  phoneNumberId?: string;
  to_number?: string;
  from_number?: string;
  to?: string;
  from?: string;
  direction: 'inbound' | 'outbound' | 'outbound-api';
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'failed' | 'no-answer' | 'canceled';
  duration: number;
  price?: string | number;
  price_unit?: string;
  priceUnit?: string;
  recording_url?: string;
  recordingUrl?: string;
  recording_sid?: string;
  recordingSid?: string;
  recording_duration?: number;
  recording_status?: 'completed' | 'processing' | 'failed';
  transcription?: string;
  start_time?: string;
  startTime?: Date;
  end_time?: string;
  endTime?: Date;
  created_at?: string;
  createdAt?: Date;
  updated_at?: string;
  updatedAt?: Date;
}

export interface TwilioRecording {
  id: string;
  recordingSid: string;
  userId: string;
  callSid: string;
  phoneNumberId: string;
  duration: number;
  channels: number;
  status: 'in-progress' | 'paused' | 'stopped' | 'processing' | 'completed' | 'absent';
  mediaUrl: string;
  price?: number;
  priceUnit?: string;
  createdAt: Date;
  updatedAt: Date;
  fromNumber?: string;
  toNumber?: string;
  callDuration?: number;
  callStatus?: string;
}

export interface CallForwarding {
  id: string;
  business_id: string;
  phone_number_id: string;
  forward_to_number: string;
  is_active: boolean;
  forwarding_type: 'always' | 'busy' | 'no_answer' | 'unavailable';
  ring_timeout: number;
  created_at: string;
  updated_at: string;
}

export interface CallForwardingFormData {
  phone_number_id: string;
  forward_to_number: string;
  forwarding_type: 'always' | 'busy' | 'no_answer' | 'unavailable';
  ring_timeout: number;
}

export interface UserPhoneNumbersContextType {
  phoneNumbers: PhoneNumber[];
  calls: TwilioCall[];
  recordings: TwilioRecording[];
  phoneNumberStats: any;
  loading: boolean;
  error: string | null;
  getMyNumbers: () => Promise<void>;
  searchAvailableNumbers: (params: { areaCode?: string; country?: string; limit?: number }) => Promise<any>;
  buyPhoneNumber: (data: { phoneNumber: string; country?: string; areaCode?: string; websiteId?: string }) => Promise<any>;
  updatePhoneNumber: (id: string, updates: Partial<PhoneNumber>) => Promise<PhoneNumber>;
  releasePhoneNumber: (id: string) => Promise<void>;
  getCallHistory: (params?: { phoneNumberId?: string; limit?: number; page?: number; status?: string }) => Promise<void>;
  getCallDetails: (callSid: string) => Promise<TwilioCall>;
  getRecordings: (params?: { callSid?: string; phoneNumberId?: string; limit?: number; page?: number }) => Promise<void>;
  deleteRecording: (recordingSid: string) => Promise<void>;
}