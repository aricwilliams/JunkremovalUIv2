import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

const DashboardView: React.FC = () => {
  const { estimates } = useApp();

  // Calculate dashboard data from estimates
  const dashboardData = useMemo(() => {
    if (!estimates || estimates.length === 0) {
      return {
        upcomingJobs: [],
        openEstimates: [],
        recentCompletedJobs: [],
        stats: {
          upcomingJobsCount: 0,
          monthlyRevenue: 0,
          activeLeads: 0,
          customerRating: 4.8 // Default rating
        }
      };
    }

    // Filter for actual jobs (estimates with amount > 0 and job statuses)
    const jobs = estimates.filter(estimate => 
      estimate.amount && estimate.amount > 0 && 
      (estimate.status === 'accepted' || 
       estimate.status === 'scheduled' || 
       estimate.status === 'in progress' || 
       estimate.status === 'completed' || 
       estimate.status === 'cancelled')
    );

    // Upcoming jobs (scheduled and in progress)
    const upcomingJobs = jobs.filter(job => 
      (job.status === 'scheduled' || job.status === 'in progress') && 
      job.preferred_date && 
      new Date(job.preferred_date) >= new Date()
    ).slice(0, 5);

    // Open estimates (need review, pending, quoted)
    const openEstimates = estimates.filter(estimate => 
      estimate.status === 'need review' || 
      estimate.status === 'pending' || 
      estimate.status === 'quoted'
    ).slice(0, 3);

    // Recent completed jobs
    const recentCompletedJobs = jobs.filter(job => 
      job.status === 'completed'
    ).slice(0, 3);

    // Calculate monthly revenue (this month's completed jobs)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyRevenue = jobs.filter(job => 
      job.status === 'completed' && 
      job.preferred_date && 
      job.preferred_date.startsWith(currentMonth)
    ).reduce((sum, job) => sum + (job.amount || 0), 0);

    // Active leads (estimates that need review or are pending)
    const activeLeads = estimates.filter(estimate => 
      estimate.status === 'need review' || estimate.status === 'pending'
    ).length;

    return {
      upcomingJobs,
      openEstimates,
      recentCompletedJobs,
      stats: {
        upcomingJobsCount: jobs.filter(j => j.status === 'scheduled' || j.status === 'in progress').length,
        monthlyRevenue,
        activeLeads,
        customerRating: 4.8 // Default rating - could be calculated from reviews if available
      }
    };
  }, [estimates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'need review':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGoogleMaps = (address: string) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.upcomingJobsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardData.stats.monthlyRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Leads</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.activeLeads}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Customer Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.customerRating}/5.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Jobs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Jobs</h2>
            <p className="text-sm text-gray-600">Next 5 scheduled jobs</p>
          </div>
          <div className="p-6">
            {dashboardData.upcomingJobs.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming jobs scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.upcomingJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{job.full_name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.service_address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.preferred_time || 'No time specified'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${job.amount?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : 'No date'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleGoogleMaps(job.service_address)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Open in Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCall(job.phone_number)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Call customer"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEmail(job.email_address)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Email customer"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Open Estimates */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Open Estimates</h2>
            <p className="text-sm text-gray-600">Leads awaiting response</p>
          </div>
          <div className="p-6">
            {dashboardData.openEstimates.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No open estimates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.openEstimates.map((estimate) => (
                  <div key={estimate.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{estimate.full_name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                            {estimate.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{estimate.service_address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${estimate.quote_amount?.toLocaleString() || 'Pending quote'}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{estimate.additional_notes || 'No additional notes'}</p>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleCall(estimate.phone_number)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Call customer"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEmail(estimate.email_address)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Email customer"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600">Latest completed jobs</p>
        </div>
        <div className="p-6">
          {dashboardData.recentCompletedJobs.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent completed jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentCompletedJobs.map((job) => (
                <div key={job.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{job.full_name}</h3>
                    <p className="text-sm text-gray-600">
                      {job.service_address} • ${job.amount?.toLocaleString() || '0'} • {job.updated_at ? new Date(job.updated_at).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Request Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;