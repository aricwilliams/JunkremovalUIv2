import React from 'react';
import { Truck, Menu, Bell, User } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { currentView } = useApp();

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
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Truck className="w-8 h-8 text-blue-600" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">TarheelJunkCRM</h1>
                <p className="text-sm text-gray-500">{getViewTitle()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;