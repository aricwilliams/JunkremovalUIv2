import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Job } from '../../types';
import JobsListView from './JobsListView';
import JobsMapView from './JobsMapView';
import JobProgressTracker from './JobProgressTracker';
import { Map, List, Play } from 'lucide-react';

const JobsView: React.FC = () => {
  const { jobs, updateJob } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'progress'>('list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleStatusUpdate = (jobId: string, newStatus: string) => {
    updateJob(jobId, { status: newStatus as any });
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setViewMode('progress');
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your junk removal jobs</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
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

          {selectedJob && (
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

      {viewMode === 'list' ? (
        <JobsListView jobs={jobs} onJobSelect={handleJobSelect} />
      ) : viewMode === 'map' ? (
        <JobsMapView jobs={jobs} onJobSelect={handleJobSelect} />
      ) : (
        selectedJob && (
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
              job={selectedJob}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        )
      )}
    </div>
  );
};

export default JobsView;
