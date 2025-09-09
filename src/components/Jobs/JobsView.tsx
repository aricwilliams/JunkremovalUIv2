import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Job, EstimateRequest } from '../../types';
import { estimatesService } from '../../services/estimatesService';
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

  // Filter estimates to show jobs with various statuses
  const jobs = estimates.filter(estimate => 
    estimate.status === 'accepted' ||
    estimate.status === 'scheduled' ||
    estimate.status === 'in progress' ||
    estimate.status === 'completed' ||
    estimate.status === 'cancelled'
  );

  const handleStatusUpdate = async (estimateId: string, newStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the estimate to get all current data
      const currentEstimate = estimates.find(est => est.id.toString() === estimateId);
      if (!currentEstimate) {
        throw new Error('Estimate not found');
      }
      
      // Comprehensive data preparation (same as other tabs)
      const updateData = {
        // Basic info
        is_new_client: Boolean(currentEstimate.is_new_client),
        existing_client_id: currentEstimate.existing_client_id || null,
        full_name: currentEstimate.full_name || '',
        phone_number: currentEstimate.phone_number ? currentEstimate.phone_number.replace(/[^0-9]/g, '') : '',
        email_address: currentEstimate.email_address || '',
        ok_to_text: Boolean(currentEstimate.ok_to_text),
        
        // Service details
        service_address: currentEstimate.service_address || '',
        gate_code: currentEstimate.gate_code || null,
        apartment_unit: currentEstimate.apartment_unit || null,
        preferred_date: currentEstimate.preferred_date ? new Date(currentEstimate.preferred_date).toISOString().split('T')[0] : null,
        preferred_time: currentEstimate.preferred_time || null,
        location_on_property: currentEstimate.location_on_property || '',
        approximate_volume: currentEstimate.approximate_volume || '',
        access_considerations: currentEstimate.access_considerations || null,
        
        // Material and safety info
        material_types: currentEstimate.material_types || [],
        approximate_item_count: currentEstimate.approximate_item_count || null,
        items_filled_water: Boolean(currentEstimate.items_filled_water),
        items_filled_oil_fuel: Boolean(currentEstimate.items_filled_oil_fuel),
        hazardous_materials: Boolean(currentEstimate.hazardous_materials),
        items_tied_bags: Boolean(currentEstimate.items_tied_bags),
        oversized_items: Boolean(currentEstimate.oversized_items),
        mold_present: Boolean(currentEstimate.mold_present),
        pests_present: Boolean(currentEstimate.pests_present),
        sharp_objects: Boolean(currentEstimate.sharp_objects),
        heavy_lifting_required: Boolean(currentEstimate.heavy_lifting_required),
        disassembly_required: Boolean(currentEstimate.disassembly_required),
        
        // Additional info
        additional_notes: currentEstimate.additional_notes || null,
        request_donation_pickup: Boolean(currentEstimate.request_donation_pickup),
        request_demolition_addon: Boolean(currentEstimate.request_demolition_addon),
        how_did_you_hear: currentEstimate.how_did_you_hear || null,
        request_priority: currentEstimate.request_priority || null,
        
        // Status and pricing
        status: newStatus as any,
        quote_amount: currentEstimate.quote_amount || null,
        amount: currentEstimate.amount || null,
        quote_notes: currentEstimate.quote_notes || null
      };
      
      // Update the estimate using the main updateEstimate method with comprehensive data
      await estimatesService.updateEstimate(parseInt(estimateId), updateData);
      
      // Refresh the estimates data
      await refreshEstimates();
      
      // Update the selected estimate if it's the one being updated
      if (selectedEstimate && selectedEstimate.id.toString() === estimateId) {
        setSelectedEstimate(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
      
      console.log('Status updated successfully:', estimateId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update job status. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <p className="text-sm sm:text-base text-gray-600">Manage your junk removal jobs ({jobs.length} jobs)</p>
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
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <JobsListView 
          jobs={jobs} 
          onJobSelect={handleEstimateSelect}
          onJobUpdated={handleEstimateUpdated}
          onJobDeleted={handleEstimateDeleted}
        />
      ) : viewMode === 'map' ? (
        <JobsMapView 
          jobs={jobs} 
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Job Progress Tracker</h2>
              <button
                onClick={() => setViewMode('list')}
                className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Back to Jobs
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
            <p className="text-lg font-medium text-gray-500 mb-2">No Job Selected</p>
            <p className="text-sm text-gray-400 mb-4">Select a job from the list to track its progress</p>
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Jobs List
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
