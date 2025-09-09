import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import JobDetailsModal from '../Jobs/JobDetailsModal';
import CreateJobForm from '../Jobs/CreateJobForm';

const CalendarView: React.FC = () => {
  const { jobs, updateJob } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleAddJob = () => {
    setShowCreateForm(true);
  };

  const handleJobCreated = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-600 mt-1">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} - {jobs.filter(job => {
              const jobDate = new Date(job.scheduled_date);
              return jobDate.getMonth() === currentDate.getMonth() && jobDate.getFullYear() === currentDate.getFullYear();
            }).length} jobs scheduled
          </p>
        </div>
        {/* <button
          onClick={handleAddJob}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Add Job</span>
        </button> */}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Calendar */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border-b">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <h2 className="text-base sm:text-lg font-semibold text-gray-900 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-2 sm:p-4">
              {/* Status Legend */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Cancelled</span>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {/* Empty cells for days before month starts */}
                {emptyDays.map(day => (
                  <div key={`empty-${day}`} className="p-1 sm:p-2 h-24 sm:h-28"></div>
                ))}

                {/* Days of the month */}
                {days.map(day => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const dayJobs = getJobsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={day}
                      className={`p-1 sm:p-2 h-24 sm:h-28 border border-gray-100 rounded-lg ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day}
                        </span>
                        {dayJobs.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded text-xs">
                            {dayJobs.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {dayJobs.slice(0, 2).map(job => {
                          const jobTime = new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <div
                              key={job.id}
                              className={`text-xs px-1 sm:px-2 py-1 rounded text-white truncate cursor-pointer ${getStatusColor(job.status)}`}
                              onClick={() => handleJobClick(job)}
                              title={`${jobTime} - ${job.title} - ${job.customer?.name || 'Unknown Customer'}`}
                            >
                              <div className="truncate">{job.title}</div>
                              <div className="text-xs opacity-75">{jobTime}</div>
                            </div>
                          );
                        })}
                        {dayJobs.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayJobs.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={showJobModal}
          onClose={() => {
            setShowJobModal(false);
            setSelectedJob(null);
          }}
          onJobUpdated={(updatedJob) => {
            updateJob(updatedJob.id.toString(), updatedJob);
          }}
          onJobDeleted={() => {
            setShowJobModal(false);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Create Job Form Modal */}
      {showCreateForm && (
        <CreateJobForm
          onJobCreated={handleJobCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default CalendarView;