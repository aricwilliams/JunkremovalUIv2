import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Job, Lead, Crew, PricingItem, Analytics } from '../types';
import { jobsService } from '../services/jobsService';
import { useAuth } from './AuthContext';

interface AppContextType {
  customers: Customer[];
  jobs: Job[];
  leads: Lead[];
  crews: Crew[];
  pricingItems: PricingItem[];
  analytics: Analytics;
  currentView: string;
  setCurrentView: (view: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created'>) => void;
  addJob: (job: Omit<Job, 'id' | 'created' | 'updated'>) => void;
  addLead: (lead: Omit<Lead, 'id' | 'created'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  convertLeadToCustomer: (leadId: string) => void;
  loading: boolean;
  error: string | null;
  refreshJobs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    totalJobs: 0,
    averageJobValue: 0,
    completionRate: 0,
    customerSatisfaction: 0,
    monthlyRevenue: [],
    jobsBySource: {},
    topServices: [],
    estimatesStats: {
      total: 0,
      sent: 0,
      accepted: 0,
      pending: 0,
      expired: 0
    },
    recurringPickups: {
      total: 0,
      active: 0,
      revenue: 0
    },
    overdueInvoices: {
      count: 0,
      amount: 0
    },
    fleetStats: {
      totalTrucks: 0,
      availableTrucks: 0,
      inUseTrucks: 0,
      maintenanceTrucks: 0
    },
    employeeStats: {
      totalEmployees: 0,
      activeEmployees: 0,
      onLeaveEmployees: 0,
      averageRating: 0
    },
    portalStats: {
      totalUsers: 0,
      activeUsers: 0,
      totalRequests: 0,
      pendingRequests: 0
    }
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load jobs from API when authenticated
  const loadJobs = async () => {
    if (!isAuthenticated || !user) {
      console.log('🚫 Not authenticated or no user, skipping API call');
      return;
    }
    
    console.log('🔄 Loading jobs from API with coordinates...');
    console.log('User:', user);
    console.log('Is authenticated:', isAuthenticated);
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the new method that includes coordinate fetching
      const response = await jobsService.getJobsWithCoordinates();
      console.log('📊 API Response with coordinates received:', response);
      
      if (response.success && response.data && response.data.jobs) {
        console.log('✅ Setting jobs from API with coordinates:', response.data.jobs.length, 'jobs');
        setJobs(response.data.jobs);
      } else {
        console.warn('⚠️ Invalid API response format:', response);
        throw new Error('Invalid API response format');
      }
    } catch (err: any) {
      console.error('❌ Failed to load jobs from API:', err);
      setError(err.message);
      // Set empty jobs array instead of falling back to mock data
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
    } else {
      // Set empty arrays when not authenticated - no mock data
      setCustomers([]);
      setJobs([]);
      setLeads([]);
      setCrews([]);
      setPricingItems([]);
      setAnalytics({
        totalRevenue: 0,
        totalJobs: 0,
        averageJobValue: 0,
        completionRate: 0,
        customerSatisfaction: 0,
        monthlyRevenue: [],
        jobsBySource: {},
        topServices: [],
        estimatesStats: {
          total: 0,
          sent: 0,
          accepted: 0,
          pending: 0,
          expired: 0
        },
        recurringPickups: {
          total: 0,
          active: 0,
          revenue: 0
        },
        overdueInvoices: {
          count: 0,
          amount: 0
        },
        fleetStats: {
          totalTrucks: 0,
          availableTrucks: 0,
          inUseTrucks: 0,
          maintenanceTrucks: 0
        },
        employeeStats: {
          totalEmployees: 0,
          activeEmployees: 0,
          onLeaveEmployees: 0,
          averageRating: 0
        },
        portalStats: {
          totalUsers: 0,
          activeUsers: 0,
          totalRequests: 0,
          pendingRequests: 0
        }
      });
    }
  }, [isAuthenticated, user]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'created'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now(),
      created: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const addJob = (jobData: Omit<Job, 'id' | 'created' | 'updated'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now(),
      created: new Date(),
      updated: new Date(),
    };
    setJobs(prev => [...prev, newJob]);
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'created'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      created: new Date(),
    };
    setLeads(prev => [...prev, newLead]);
  };

  const updateJob = async (id: string | number, updates: Partial<Job>) => {
    try {
      // Update via API if authenticated
      if (isAuthenticated) {
        const jobId = typeof id === 'string' ? parseInt(id) : id;
        const apiUpdates: any = {};
        
        // Map legacy fields to API fields
        if (updates.status) apiUpdates.status = updates.status;
        if (updates.totalEstimate) apiUpdates.total_cost = updates.totalEstimate;
        if (updates.notes) apiUpdates.description = updates.notes;
        
        await jobsService.updateJob(jobId, apiUpdates);
        
        // Refresh jobs from API
        await loadJobs();
      } else {
        // Update locally if not authenticated
        setJobs(prev => prev.map(job => 
          job.id === id ? { ...job, ...updates, updated: new Date() } : job
        ));
      }
    } catch (err: any) {
      console.error('Failed to update job:', err);
      setError(err.message);
    }
  };

  const refreshJobs = async () => {
    await loadJobs();
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, ...updates } : lead
    ));
  };

  const convertLeadToCustomer = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const newCustomer: Customer = {
        id: Date.now(),
        business_id: 1, // Default business ID
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        city: '',
        state: '',
        zip_code: '',
        customer_type: 'residential',
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created: new Date(),
        tags: [],
        notes: lead.notes,
      };
      setCustomers(prev => [...prev, newCustomer]);
      setLeads(prev => prev.filter(l => l.id !== leadId));
    }
  };

  return (
    <AppContext.Provider value={{
      customers,
      jobs,
      leads,
      crews,
      pricingItems,
      analytics,
      currentView,
      setCurrentView,
      addCustomer,
      addJob,
      addLead,
      updateJob,
      updateLead,
      convertLeadToCustomer,
      loading,
      error,
      refreshJobs,
    }}>
      {children}
    </AppContext.Provider>
  );
};