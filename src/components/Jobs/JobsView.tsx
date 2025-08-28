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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">Manage your junk removal jobs</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </button>
          
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Map View</span>
          </button>
          
          {selectedJob && (
            <button
              onClick={() => setViewMode('progress')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'progress'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Progress Tracker</span>
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Job Progress Tracker</h2>
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
