import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const JobStatsDashboard: React.FC = () => {
  const { estimates, loading, error } = useApp();

  // Calculate statistics from estimates data
  const stats = useMemo(() => {
    if (!estimates || estimates.length === 0) {
      return {
        total_jobs: 0,
        total_revenue: 0,
        average_job_value: 0,
        completed_jobs: 0,
        scheduled_jobs: 0,
        in_progress_jobs: 0,
        cancelled_jobs: 0,
        jobs_today: 0,
        scheduled_today: 0
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

    const total_jobs = jobs.length;
    const total_revenue = jobs.reduce((sum, job) => sum + (job.amount || 0), 0);
    const average_job_value = total_jobs > 0 ? total_revenue / total_jobs : 0;

    // Count by status
    const completed_jobs = jobs.filter(job => job.status === 'completed').length;
    const scheduled_jobs = jobs.filter(job => job.status === 'scheduled').length;
    const in_progress_jobs = jobs.filter(job => job.status === 'in progress').length;
    const cancelled_jobs = jobs.filter(job => job.status === 'cancelled').length;

    // Today's activity
    const today = new Date().toISOString().split('T')[0];
    const jobs_today = jobs.filter(job => 
      job.preferred_date && job.preferred_date.startsWith(today)
    ).length;
    const scheduled_today = jobs.filter(job => 
      job.status === 'scheduled' && 
      job.preferred_date && 
      job.preferred_date.startsWith(today)
    ).length;

    return {
      total_jobs,
      total_revenue,
      average_job_value,
      completed_jobs,
      scheduled_jobs,
      in_progress_jobs,
      cancelled_jobs,
      jobs_today,
      scheduled_today
    };
  }, [estimates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  if (!estimates || estimates.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No estimates data available</p>
      </div>
    );
  }

  const completionRate = stats.total_jobs > 0 ? (stats.completed_jobs / stats.total_jobs) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Job Statistics</h2>
          <p className="text-sm sm:text-base text-gray-600">Overview of your job performance and metrics</p>
        </div>
        <div className="flex items-center justify-center sm:justify-end space-x-2 text-xs sm:text-sm text-gray-500">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Real-time data from estimates</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Jobs */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total_jobs}</p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">${stats.total_revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Average Job Value */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Average Job Value</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">${stats.average_job_value.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Scheduled</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{stats.scheduled_jobs}</span>
                <span className="text-xs text-gray-500">
                  ({stats.total_jobs > 0 ? ((stats.scheduled_jobs / stats.total_jobs) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{stats.in_progress_jobs}</span>
                <span className="text-xs text-gray-500">
                  ({stats.total_jobs > 0 ? ((stats.in_progress_jobs / stats.total_jobs) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{stats.completed_jobs}</span>
                <span className="text-xs text-gray-500">
                  ({stats.total_jobs > 0 ? ((stats.completed_jobs / stats.total_jobs) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Cancelled</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{stats.cancelled_jobs}</span>
                <span className="text-xs text-gray-500">
                  ({stats.total_jobs > 0 ? ((stats.cancelled_jobs / stats.total_jobs) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Jobs Today</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.jobs_today}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Scheduled Today</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.scheduled_today}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total_jobs}</div>
            <div className="text-sm text-gray-600">Total Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">${stats.total_revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{completionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStatsDashboard;