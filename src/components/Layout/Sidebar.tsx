import React from 'react';
import {
  Home,
  Calendar,
  Users,
  UserPlus,
  Calculator,
  BarChart3,
  Settings,
  X,
  CheckCircle,
  Clock,
  DollarSign,
  Briefcase,
  Truck,
  UserCheck,
  Building
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, jobs, leads, analytics } = useApp();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      badge: null
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      badge: jobs.filter(j => j.status === 'scheduled' || j.status === 'in-progress').length
    },

    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: null
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: null
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: UserPlus,
      badge: leads.filter(l => l.status === 'new').length
    },
    {
      id: 'estimates',
      label: 'Estimates',
      icon: Calculator,
      badge: null
    },
    {
      id: 'trucks',
      label: 'Fleet Management',
      icon: Truck,
      badge: null
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'portal',
      label: 'Client Portal',
      icon: Building,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  const handleMenuClick = (viewId: string) => {
    setCurrentView(viewId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <nav className="p-4">
          {/* Quick Stats */}
          <div className="mb-6 space-y-2">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Today's Revenue</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-900">${analytics.totalRevenue.toLocaleString()}</p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">Pending Jobs</span>
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-orange-900">
                {jobs.filter(j => j.status === 'scheduled').length}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 && (
                    <span className={`
                      px-2 py-1 text-xs rounded-full font-medium
                      ${isActive
                        ? 'bg-white text-blue-600'
                        : 'bg-red-500 text-white'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;