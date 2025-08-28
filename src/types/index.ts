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
  totalEstimate: number;
  actualTotal?: number;
  notes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  created: Date;
  updated: Date;
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

export interface Crew {
  id: string;
  name: string;
  members: string[];
  capacity: number;
  isAvailable: boolean;
  currentJob?: string;
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
}