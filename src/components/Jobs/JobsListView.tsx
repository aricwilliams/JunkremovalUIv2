import React, { useState, useMemo } from 'react';
import { Job } from '../../types';
import JobDetailsModal from './JobDetailsModal';
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  X,
  Eye
} from 'lucide-react';

interface JobsListViewProps {
  jobs: Job[];
  onJobSelect?: (job: Job) => void;
  onJobUpdated?: (updatedJob: Job) => void;
  onJobDeleted?: (jobId: number) => void;
}

const JobsListView: React.FC<JobsListViewProps> = ({ 
  jobs, 
  onJobSelect, 
  onJobUpdated, 
  onJobDeleted 
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const customerName = job.customer?.name || job.customerName || 'Unknown Customer';
      const address = job.customer?.address || job.address || '';
      const city = job.customer?.city || job.city || '';
      
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [jobs, statusFilter, searchTerm]);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    if (onJobUpdated) {
      onJobUpdated(updatedJob);
    }
  };

  const handleJobDeleted = (jobId: number) => {
    if (onJobDeleted) {
      onJobDeleted(jobId);
    }
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'in-progress':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs by customer name, address, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow">
        {jobs.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No jobs found. Create your first job to get started.</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No jobs found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <div key={job.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 cursor-pointer" onClick={() => handleJobClick(job)}>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {job.customer?.name || job.customerName || 'Unknown Customer'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">{job.status.replace('-', ' ')}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {job.customer?.address || job.address || 'N/A'}, {job.customer?.city || job.city || 'N/A'}, {job.customer?.state || job.state || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{new Date(job.scheduled_date || job.scheduledDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{job.timeSlot || new Date(job.scheduled_date || job.scheduledDate).toLocaleTimeString()}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 flex-shrink-0" />
                        <span>${(job.total_cost || job.totalEstimate || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {(job.description || job.notes) && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {job.description || job.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-col-reverse sm:items-end space-y-2 sm:space-y-0">
                    <div className="flex flex-col sm:items-end text-sm text-gray-500 space-y-1">
                      <div style={{display: 'none'}}>{job.items?.length || 0} items</div>
                      <div>{job.estimatedHours || 2}h estimated</div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleJobClick(job)}
                        className="w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      {onJobSelect && (
                        <button
                          onClick={() => onJobSelect(job)}
                          className="w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Track Progress
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onJobUpdated={handleJobUpdated}
          onJobDeleted={handleJobDeleted}
        />
      )}
    </div>
  );
};

export default JobsListView;
