import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Job, Lead, Crew, PricingItem, Analytics } from '../types';
import { jobsService } from '../services/jobsService';
import { customersService } from '../services/customersService';
import { estimatesService, EstimateRequest } from '../services/estimatesService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface AppContextType {
  customers: Customer[];
  jobs: Job[];
  leads: Lead[];
  crews: Crew[];
  pricingItems: PricingItem[];
  estimates: EstimateRequest[];
  analytics: Analytics;
  currentView: string;
  setCurrentView: (view: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created'>) => void;
  addJob: (job: Omit<Job, 'id' | 'created' | 'updated'>) => void;
  addLead: (lead: Omit<Lead, 'id' | 'created'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: number) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  convertLeadToCustomer: (leadId: string) => void;
  loading: boolean;
  error: string | null;
  refreshJobs: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshEstimates: () => Promise<void>;
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
  const { showSuccess, showError } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [estimates, setEstimates] = useState<EstimateRequest[]>([]);
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

  // Load customers from API when authenticated
  const loadCustomers = async () => {
    if (!isAuthenticated || !user) {
      console.log('🚫 Not authenticated or no user, skipping customers API call');
      return;
    }
    
    console.log('🔄 Loading customers from API...');
    
    try {
      const response = await customersService.getCustomers({
        page: 1,
        limit: 1000, // Load all customers
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (response.success && response.data && response.data.customers) {
        console.log('✅ Setting customers from API:', response.data.customers.length, 'customers');
        setCustomers(response.data.customers);
      } else {
        console.warn('⚠️ Invalid customers API response format:', response);
        setCustomers([]);
      }
    } catch (err: any) {
      console.error('❌ Failed to load customers from API:', err);
      setCustomers([]);
    }
  };

  // Load estimates from API when authenticated
  const loadEstimates = async () => {
    if (!isAuthenticated || !user) {
      console.log('🚫 Not authenticated or no user, skipping estimates API call');
      return;
    }
    
    console.log('🔄 Loading estimates from API...');
    
    try {
      const response = await estimatesService.getEstimates({
        page: 1,
        limit: 1000, // Load all estimates
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      console.log('🔍 Estimates API Response:', response);
      if (response.success && response.data && response.data.estimates) {
        console.log('✅ Setting estimates from API:', response.data.estimates.length, 'estimates');
        setEstimates(response.data.estimates);
      } else {
        console.warn('⚠️ Invalid estimates API response format:', response);
        setEstimates([]);
      }
    } catch (err: any) {
      console.error('❌ Failed to load estimates from API:', err);
      setEstimates([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
      loadCustomers();
      loadEstimates();
    } else {
      // Set empty arrays when not authenticated - no mock data
      setCustomers([]);
      setJobs([]);
      setLeads([]);
      setCrews([]);
      setPricingItems([]);
      setEstimates([]);
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
        
        // Optimistic update - update UI immediately
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, ...updates, updated: new Date() } : job
        ));
        
        // Show immediate success toast
        showSuccess('Job Updated', 'Changes saved successfully!');
        
        // Then update via API in background
        const response = await jobsService.updateJob(jobId, apiUpdates);
        
        // Update with the actual response from API to ensure consistency
        if (response.success && response.data.job) {
          setJobs(prev => prev.map(job => 
            job.id === jobId ? { ...job, ...response.data.job } : job
          ));
        }
      } else {
        // Update locally if not authenticated
        setJobs(prev => prev.map(job => 
          job.id === id ? { ...job, ...updates, updated: new Date() } : job
        ));
        showSuccess('Job Updated', 'Changes saved locally!');
      }
    } catch (err: any) {
      console.error('Failed to update job:', err);
      setError(err.message);
      showError('Update Failed', err.message || 'Failed to update job');
      
      // Revert optimistic update on error
      if (isAuthenticated) {
        await loadJobs();
      }
    }
  };

  const deleteJob = async (id: number) => {
    try {
      // Optimistic update - remove from UI immediately
      setJobs(prev => prev.filter(job => job.id !== id));
      
      // Show immediate success toast
      showSuccess('Job Deleted', 'Job removed successfully!');
      
      // Then delete via API
      if (isAuthenticated) {
        await jobsService.deleteJob(id);
      }
    } catch (err: any) {
      console.error('Failed to delete job:', err);
      setError(err.message);
      showError('Delete Failed', err.message || 'Failed to delete job');
      
      // Revert optimistic update on error
      if (isAuthenticated) {
        await loadJobs();
      }
    }
  };

  const refreshJobs = async () => {
    await loadJobs();
  };

  const refreshCustomers = async () => {
    await loadCustomers();
  };

  const refreshEstimates = async () => {
    await loadEstimates();
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
      estimates,
      analytics,
      currentView,
      setCurrentView,
      addCustomer,
      addJob,
      addLead,
      updateJob,
      deleteJob,
      updateLead,
      convertLeadToCustomer,
      loading,
      error,
      refreshJobs,
      refreshCustomers,
      refreshEstimates,
    }}>
      {children}
    </AppContext.Provider>
  );
};