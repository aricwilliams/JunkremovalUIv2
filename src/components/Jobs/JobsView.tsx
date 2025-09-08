import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Job, EstimateRequest } from '../../types';
import JobsListView from './JobsListView';
import JobsMapView from './JobsMapView';
import JobProgressTracker from './JobProgressTracker';
import JobStatsDashboard from './JobStatsDashboard';
import CreateJobForm from './CreateJobForm';
import { Map, List, Play, Plus, BarChart3 } from 'lucide-react';

const JobsView: React.FC = () => {
  const { estimates, refreshEstimates, customers } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'progress' | 'stats'>('list');
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateRequest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (estimateId: string, newStatus: string) => {
    // Handle estimate status update if needed
    console.log('Status update for estimate:', estimateId, newStatus);
  };

  const handleEstimateSelect = (estimate: EstimateRequest) => {
    setSelectedEstimate(estimate);
    setViewMode('progress');
  };

  const handleEstimateCreated = (estimate: EstimateRequest) => {
    setShowCreateForm(false);
    refreshEstimates(); // Refresh the estimates list
  };

  const handleEstimateUpdated = (updatedEstimate: EstimateRequest) => {
    // The AppContext already handles optimistic updates
    // No need to refresh - the UI will update immediately
    console.log('✅ Estimate updated successfully:', updatedEstimate);
  };

  const handleEstimateDeleted = (estimateId: number) => {
    // The AppContext already handles the deletion
    // No need to refresh - the UI will update immediately
    console.log('✅ Estimate deleted successfully:', estimateId);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your junk removal estimates</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {error && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
              <span>Error: {error}</span>
              <button
                onClick={refreshEstimates}
                className="underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Job</span>
            <span className="sm:hidden">Create</span>
          </button> */}

          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List View</span>
            <span className="sm:hidden">List</span>
          </button>

          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Map View</span>
            <span className="sm:hidden">Map</span>
          </button>

          <button
            onClick={() => setViewMode('stats')}
            className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${viewMode === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Statistics</span>
            <span className="sm:hidden">Stats</span>
          </button>

          {selectedEstimate && (
            <button
              onClick={() => setViewMode('progress')}
              className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${viewMode === 'progress'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Progress Tracker</span>
              <span className="sm:hidden">Progress</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading estimates...</p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <JobsListView 
          jobs={estimates} 
          onJobSelect={handleEstimateSelect}
          onJobUpdated={handleEstimateUpdated}
          onJobDeleted={handleEstimateDeleted}
        />
      ) : viewMode === 'map' ? (
        <JobsMapView 
          jobs={estimates} 
          onJobSelect={handleEstimateSelect}
          onJobUpdated={handleEstimateUpdated}
          onJobDeleted={handleEstimateDeleted}
        />
      ) : viewMode === 'stats' ? (
        <JobStatsDashboard />
      ) : (
        selectedEstimate ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Estimate Progress Tracker</h2>
              <button
                onClick={() => setViewMode('list')}
                className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Back to Estimates
              </button>
            </div>
            <JobProgressTracker
              job={selectedEstimate}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500 mb-2">No Estimate Selected</p>
            <p className="text-sm text-gray-400 mb-4">Select an estimate from the list to track its progress</p>
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Estimates List
            </button>
          </div>
        )
      )}

      {showCreateForm && (
        <CreateJobForm
          onJobCreated={handleEstimateCreated}
          onCancel={() => setShowCreateForm(false)}
          customers={customers.map(customer => ({
            id: typeof customer.id === 'string' ? parseInt(customer.id) : customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone
          }))}
        />
      )}
    </div>
  );
};

export default JobsView;
