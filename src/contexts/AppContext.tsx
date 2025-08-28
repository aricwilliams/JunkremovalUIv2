import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Job, Lead, Crew, PricingItem, Analytics } from '../types';
import { generateMockData } from '../utils/mockData';

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
    topServices: []
  });
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const mockData = generateMockData();
    setCustomers(mockData.customers);
    setJobs(mockData.jobs);
    setLeads(mockData.leads);
    setCrews(mockData.crews);
    setPricingItems(mockData.pricingItems);
    setAnalytics(mockData.analytics);
  }, []);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'created'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      created: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const addJob = (jobData: Omit<Job, 'id' | 'created' | 'updated'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
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

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates, updated: new Date() } : job
    ));
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
        id: Date.now().toString(),
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        city: '',
        state: '',
        zipCode: '',
        created: new Date(),
        status: 'new',
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
    }}>
      {children}
    </AppContext.Provider>
  );
};