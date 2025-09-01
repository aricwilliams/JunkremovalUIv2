export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  created: Date;
  status: 'new' | 'quoted' | 'scheduled' | 'completed';
  tags: string[];
  notes: string;
  propertyManagerId?: string;
  paymentTerms: 'immediate' | 'net15' | 'net30' | 'net60';
  isCommercial: boolean;
  portalAccess?: boolean;
  portalCredentials?: {
    username: string;
    password: string;
  };
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
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  scheduledDate: Date;
  timeSlot: string;
  estimatedHours: number;
  items: JobItem[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  crewId?: string;
  truckId?: string;
  totalEstimate: number;
  actualTotal?: number;
  notes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  created: Date;
  updated: Date;
  estimateId?: string;
  propertyManagerId?: string;
  volume: {
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