import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DashboardView from './components/Dashboard/DashboardView';
import JobsView from './components/Jobs/JobsView';
import BookingForm from './components/Booking/BookingForm';
import CalendarView from './components/Calendar/CalendarView';
import CustomersView from './components/Customers/CustomersView';
import LeadsView from './components/Leads/LeadsView';
import EstimatesDashboard from './components/Estimates/EstimateGenerator';
import AnalyticsView from './components/Analytics/AnalyticsView';
import SettingsView from './components/Settings/SettingsView';
import TrucksView from './components/Fleet/TrucksView';
import EmployeesView from './components/Employees/EmployeesView';
import ClientPortal from './components/Portal/ClientPortal';

const AppContent: React.FC = () => {
  const { currentView } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'jobs':
        return <JobsView />;
      case 'bookings':
        return <BookingForm />;
      case 'calendar':
        return <CalendarView />;
      case 'customers':
        return <CustomersView />;
      case 'leads':
        return <LeadsView />;
      case 'estimates':
        return <EstimatesDashboard />;
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;