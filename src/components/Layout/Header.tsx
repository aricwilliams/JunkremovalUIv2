import React, { useMemo } from 'react';
import { Menu, Bell, User, Clock, DollarSign, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import AuthStatus from '../Common/AuthStatus';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { currentView, estimates } = useApp();
  const { user, logout } = useAuth();

  // Calculate today's revenue and pending jobs from estimates
  const headerStats = useMemo(() => {
    if (!estimates || estimates.length === 0) {
      return { todayRevenue: 0, pendingJobs: 0, needReview: 0 };
    }

    // Today's revenue - from completed jobs today
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = estimates
      .filter(estimate => 
        estimate.status === 'completed' && 
        estimate.preferred_date && 
        estimate.preferred_date.startsWith(today) &&
        estimate.amount && 
        estimate.amount > 0
      )
      .reduce((sum, estimate) => sum + (estimate.amount || 0), 0);

    // Pending jobs - scheduled jobs
    const pendingJobs = estimates.filter(estimate => 
      estimate.status === 'scheduled' && 
      estimate.amount && 
      estimate.amount > 0
    ).length;

    // Estimates that need review
    const needReview = estimates.filter(estimate => 
      estimate.status === 'need review'
    ).length;

    return { todayRevenue, pendingJobs, needReview };
  }, [estimates]);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'bookings': return 'Bookings';
      case 'calendar': return 'Calendar';
      case 'customers': return 'Customers';
      case 'leads': return 'Leads';
      case 'estimates': return 'Estimates';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'TarheelJunkCRM';
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Today's Revenue</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-900">${headerStats.todayRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-800">Scheduled Jobs</span>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-lg font-bold text-orange-900">
              {headerStats.pendingJobs}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* <AuthStatus /> */}
          
          {/* <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {headerStats.needReview > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {headerStats.needReview}
              </span>
            )}
          </button> */}

          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.first_name || user?.username || 'User'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-red-600"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;