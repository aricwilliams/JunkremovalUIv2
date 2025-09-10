import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { UserPhoneNumbersProvider } from './contexts/UserPhoneNumbersContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DashboardView from './components/Dashboard/DashboardView';
import JobsView from './components/Jobs/JobsView';
import CalendarView from './components/Calendar/CalendarView';
import CustomersView from './components/Customers/CustomersView';
import LeadsView from './components/Leads/LeadsView';
import EstimatesDashboard from './components/Estimates/EstimateGenerator';
import AnalyticsView from './components/Analytics/AnalyticsView';
import SettingsView from './components/Settings/SettingsView';
import TrucksView from './components/Fleet/TrucksView';
import EmployeesView from './components/Employees/EmployeesView';
import ClientPortal from './components/Portal/ClientPortal';
import AuthPage from './components/Auth/AuthPage';
import CustomerReviewPage from './components/CustomerReview/CustomerReviewPage';
import TwilioCallingService from './components/Calling/TwilioCallingService';

const AppContent: React.FC = () => {
  const { currentView } = useApp();
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customerReviewId, setCustomerReviewId] = useState<string | null>(null);

  // Handle URL-based routing for customer review page
  useEffect(() => {
    const path = window.location.pathname;
    const customerReviewMatch = path.match(/^\/junkremoval\/customer-review\/(\d+)$/);
    
    if (customerReviewMatch) {
      setCustomerReviewId(customerReviewMatch[1]);
    } else {
      setCustomerReviewId(null);
    }
  }, []);

  // If we're on a customer review page, show it regardless of authentication
  if (customerReviewId) {
    return <CustomerReviewPage estimateId={customerReviewId} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'jobs':
        return <JobsView />;
      case 'calendar':
        return <CalendarView />;
      case 'customers':
        return <CustomersView />;
      case 'leads':
        return <LeadsView />;
      case 'estimates':
        return <EstimatesDashboard />;
      case 'calling':
        return <TwilioCallingService />;
      case 'trucks':
        return <TrucksView />;
      case 'employees':
        return <EmployeesView />;
      case 'portal':
        return <ClientPortal />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth page
  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => {
      // Login success is handled by AuthContext automatically
      // The tokens are stored in localStorage and will be picked up on next render
    }} />;
  }

  // If authenticated, show main app
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <UserPhoneNumbersProvider>
            <AppContent />
          </UserPhoneNumbersProvider>
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;