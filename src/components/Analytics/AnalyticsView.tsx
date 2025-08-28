import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Star,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const AnalyticsView: React.FC = () => {
  const { analytics, jobs, customers, leads } = useApp();

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Jobs',
      value: analytics.totalJobs,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Active Customers',
      value: customers.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Avg Job Value',
      value: `$${Math.round(analytics.averageJobValue)}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(analytics.completionRate * 100)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+2%',
      trend: 'up'
    },
    {
      title: 'Customer Rating',
      value: analytics.customerSatisfaction.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+0.2',
      trend: 'up'
    }
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.trend === 'up' ? (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last period</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.monthlyRevenue.map((revenue, index) => {
              const maxRevenue = Math.max(...analytics.monthlyRevenue);
              const height = (revenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg relative overflow-hidden">
                    <div 
                      className="bg-blue-600 rounded-t-lg transition-all duration-1000 ease-out"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 mt-2">{monthNames[index]}</span>
                  <span className="text-xs font-medium text-gray-900">
                    ${revenue.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Job Sources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Sources</h2>
          
          <div className="space-y-4">
            {Object.entries(analytics.jobsBySource).map(([source, count]) => {
              const total = Object.values(analytics.jobsBySource).reduce((a, b) => a + b, 0);
              const percentage = Math.round((count / total) * 100);
              
              return (
                <div key={source} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">{source}</span>
                    <span className="text-sm text-gray-500">{count} jobs ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h2>
          
          <div className="space-y-4">
            {analytics.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.count} jobs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${service.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Job completed for {job.customerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(job.updated).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-sm font-semibold text-green-600">
                    +${job.actualTotal || job.totalEstimate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;