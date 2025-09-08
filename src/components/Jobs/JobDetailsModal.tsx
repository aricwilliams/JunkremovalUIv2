import React, { useState, useEffect } from 'react';
import { Job, EstimateRequest } from '../../types';
import { jobsService, JobItem, JobNote, StatusHistoryEntry } from '../../services/jobsService';
import { estimatesService } from '../../services/estimatesService';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import JobItemForm from './JobItemForm';
import JobNoteForm from './JobNoteForm';
import {
  X,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  Loader,
  Package,
  StickyNote,
  History,
  Plus,
  Pencil,
  Trash
} from 'lucide-react';

interface JobDetailsModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated: (updatedJob: Job) => void;
  onJobDeleted: (jobId: number) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onJobUpdated,
  onJobDeleted
}) => {
  const { deleteJob } = useApp();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'estimate'>('details');
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [estimate, setEstimate] = useState<EstimateRequest | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  
  // Form states
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobItem | undefined>(undefined);
  const [editingNote, setEditingNote] = useState<JobNote | undefined>(undefined);
  
  // Form state
  const [formData, setFormData] = useState({
    customer_id: job.customer_id || undefined,
    title: job.title || '',
    description: job.description || '',
    status: job.status || 'scheduled',
    total_cost: job.total_cost || 0,
    scheduled_date: job.scheduled_date ? new Date(job.scheduled_date).toISOString().slice(0, 16) : '',
    assigned_employee_id: job.assigned_employee_id || undefined
  });

  // Reset form when job changes
  useEffect(() => {
    setFormData({
      customer_id: job.customer_id || undefined,
      title: job.title || '',
      description: job.description || '',
      status: job.status || 'scheduled',
      total_cost: job.total_cost || 0,
      scheduled_date: job.scheduled_date ? new Date(job.scheduled_date).toISOString().slice(0, 16) : '',
      assigned_employee_id: job.assigned_employee_id || undefined
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setActiveTab('details');
  }, [job]);

  // Load detailed job data when modal opens
  useEffect(() => {
    if (isOpen && job.id) {
      loadDetailedJob();
      // Load estimate data if job has an estimate_id
      if (job.estimate_id) {
        loadEstimateData();
      }
    }
  }, [isOpen, job.id, job.estimate_id]);

  const loadDetailedJob = async () => {
    setLoadingDetails(true);
    try {
      const response = await jobsService.getDetailedJob(job.id);
      const detailedJobData = response.data.job;
      setStatusHistory(detailedJobData.status_history || []);
    } catch (err: any) {
      console.error('Error loading detailed job:', err);
      setError('Failed to load job details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadEstimateData = async () => {
    if (!job.estimate_id) return;
    
    setLoadingEstimate(true);
    try {
      const response = await estimatesService.getEstimate(job.estimate_id);
      console.log('🔍 Estimate data:', response.data.estimate);
      setEstimate(response.data.estimate);
    } catch (err: any) {
      console.error('Error loading estimate:', err);
      // Don't show error to user, just log it - estimate might not exist
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_cost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedJob = await jobsService.updateJob(job.id, formData);
      onJobUpdated(updatedJob.data.job);
      setIsEditing(false);
      showSuccess('Job Updated', 'Changes saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update job');
      showError('Update Failed', err.message || 'Failed to update job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteJob(job.id);
      onJobDeleted(job.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
      setIsLoading(false);
    }
  };

  // Item management handlers
  const handleAddItem = () => {
    setEditingItem(undefined);
    setIsItemFormOpen(true);
  };

  const handleEditItem = (item: JobItem) => {
    setEditingItem(item);
    setIsItemFormOpen(true);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      // Optimistic update - remove from UI immediately
      setItems(prev => prev.filter(item => item.id !== itemId));
      showSuccess('Item Deleted', 'Item removed successfully!');
      
      // Then delete via API
      await jobsService.deleteJobItem(job.id, itemId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      showError('Delete Failed', err.message || 'Failed to delete item');
      // Revert optimistic update
      await loadDetailedJob();
    }
  };

  const handleItemSaved = (savedItem: JobItem) => {
    if (editingItem) {
      setItems(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
      showSuccess('Item Updated', 'Item updated successfully!');
    } else {
      setItems(prev => [...prev, savedItem]);
      showSuccess('Item Added', 'Item added successfully!');
    }
    setIsItemFormOpen(false);
    setEditingItem(undefined);
  };

  // Note management handlers
  const handleAddNote = () => {
    setEditingNote(undefined);
    setIsNoteFormOpen(true);
  };

  const handleEditNote = (note: JobNote) => {
    setEditingNote(note);
    setIsNoteFormOpen(true);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      // Optimistic update - remove from UI immediately
      setNotes(prev => prev.filter(note => note.id !== noteId));
      showSuccess('Note Deleted', 'Note removed successfully!');
      
      // Then delete via API
      await jobsService.deleteJobNote(job.id, noteId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
      showError('Delete Failed', err.message || 'Failed to delete note');
      // Revert optimistic update
      await loadDetailedJob();
    }
  };

  const handleNoteSaved = (savedNote: JobNote) => {
    if (editingNote) {
      setNotes(prev => prev.map(note => note.id === savedNote.id ? savedNote : note));
      showSuccess('Note Updated', 'Note updated successfully!');
    } else {
      setNotes(prev => [...prev, savedNote]);
      showSuccess('Note Added', 'Note added successfully!');
    }
    setIsNoteFormOpen(false);
    setEditingNote(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAddress = () => {
    if (job.customer) {
      return `${job.customer.address}, ${job.customer.city}, ${job.customer.state} ${job.customer.zip_code}`;
    }
    return 'Address not available';
  };

  const formatEmployeeName = () => {
    if (job.employee) {
      return `${job.employee.first_name} ${job.employee.last_name}`;
    }
    return 'Not assigned';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Job' : 'Job Details'}
          </h2>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
            {job.estimate_id && (
              <button
                onClick={() => setActiveTab('estimate')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === 'estimate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Quote Information</span>
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-100 text-red-700 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-100 text-green-700 rounded-lg mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Loading State */}
          {loadingDetails && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading job details...</p>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {!loadingDetails && (
            <>
              {activeTab === 'details' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{job.customer?.name || 'Unknown Customer'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{job.customer?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:col-span-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{job.customer?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-start space-x-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="break-words">{formatAddress()}</span>
                      </div>
                    </div>
                  </div>

          {/* Job Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Job Information</h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{job.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{job.description || 'No description provided'}</p>
              )}
            </div>

            {/* Status and Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Cost
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="total_cost"
                    value={formData.total_cost}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">${job.total_cost?.toLocaleString() || '0'}</p>
                )}
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date & Time
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-900">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(job.scheduled_date).toLocaleDateString()}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{new Date(job.scheduled_date).toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {/* Assigned Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Employee
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="assigned_employee_id"
                  value={formData.assigned_employee_id || ''}
                  onChange={handleInputChange}
                  placeholder="Employee ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{formatEmployeeName()}</p>
              )}
            </div>

            
          </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}


              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Status History</h3>
                  
                  {statusHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No status history available.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {statusHistory.map((entry, index) => (
                        <div key={entry.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${
                              entry.new_status === 'scheduled' ? 'bg-blue-500' :
                              entry.new_status === 'in_progress' ? 'bg-yellow-500' :
                              entry.new_status === 'completed' ? 'bg-green-500' :
                              'bg-red-500'
                            }`}></div>
                            {index < statusHistory.length - 1 && (
                              <div className="w-px h-8 bg-gray-300 ml-1.5 mt-1"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {entry.old_status ? `${entry.old_status} → ${entry.new_status}` : `Status set to ${entry.new_status}`}
                              </span>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-gray-600 mb-1">{entry.notes}</p>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>By: {entry.employee_name || `${entry.employee_first_name} ${entry.employee_last_name}`}</span>
                              <span>•</span>
                              <span>{new Date(entry.changed_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Estimate Tab */}
              {activeTab === 'estimate' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Estimate Details</h3>
                  
                  {loadingEstimate ? (
                    <div className="text-center py-8 text-gray-500">
                      <Loader className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-spin" />
                      <p>Loading estimate data...</p>
                    </div>
                  ) : estimate ? (
                    <div className="space-y-6">
                      {/* Estimate Status */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Estimate Status</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            estimate.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            estimate.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                            estimate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            estimate.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                          </span>
                        </div>
                        {estimate.quote_amount && (
                          <p className="text-lg font-semibold text-gray-900">
                            ${estimate.quote_amount.toFixed(2)}
                          </p>
                        )}
                        {estimate.quote_notes && (
                          <p className="text-sm text-gray-600 mt-1">{estimate.quote_notes}</p>
                        )}
                      </div>

                      {/* Client Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {estimate.full_name}</p>
                            <p><span className="font-medium">Phone:</span> {estimate.phone_number}</p>
                            <p><span className="font-medium">Email:</span> {estimate.email_address}</p>
                            {estimate.ok_to_text && (
                              <p className="text-green-600">✓ OK to text updates</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Location:</span> {estimate.location_on_property}</p>
                            <p><span className="font-medium">Volume:</span> {estimate.approximate_volume}</p>
                            {estimate.preferred_date && (
                              <p><span className="font-medium">Preferred Date:</span> {new Date(estimate.preferred_date).toLocaleDateString()}</p>
                            )}
                            {estimate.preferred_time && (
                              <p><span className="font-medium">Preferred Time:</span> {estimate.preferred_time}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Service Address */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Service Address</h4>
                        <p className="text-sm text-gray-600">{estimate.service_address}</p>
                        {estimate.gate_code && (
                          <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Gate Code:</span> {estimate.gate_code}</p>
                        )}
                        {estimate.apartment_unit && (
                          <p className="text-sm text-gray-600"><span className="font-medium">Unit:</span> {estimate.apartment_unit}</p>
                        )}
                      </div>

                      {/* Material Types */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Material Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {estimate.material_types.map((material, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Item Details */}
                      {estimate.approximate_item_count && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Item Count</h4>
                          <p className="text-sm text-gray-600">{estimate.approximate_item_count}</p>
                        </div>
                      )}

                      {/* Safety & Hazards */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Safety & Hazards</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {estimate.hazardous_materials && <p className="text-red-600">⚠️ Hazardous materials</p>}
                          {estimate.mold_present && <p className="text-red-600">⚠️ Mold present</p>}
                          {estimate.pests_present && <p className="text-red-600">⚠️ Pests present</p>}
                          {estimate.sharp_objects && <p className="text-orange-600">⚠️ Sharp objects</p>}
                          {estimate.heavy_lifting_required && <p className="text-orange-600">💪 Heavy lifting required</p>}
                          {estimate.disassembly_required && <p className="text-blue-600">🔧 Disassembly required</p>}
                          {estimate.items_filled_water && <p className="text-blue-600">💧 Items filled with water</p>}
                          {estimate.items_filled_oil_fuel && <p className="text-orange-600">⛽ Items filled with oil/fuel</p>}
                          {estimate.items_tied_bags && <p className="text-green-600">✅ Items tied in bags</p>}
                          {estimate.oversized_items && <p className="text-purple-600">📦 Oversized items</p>}
                        </div>
                      </div>

                      {/* Access Considerations */}
                      {estimate.access_considerations && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Access Considerations</h4>
                          <p className="text-sm text-gray-600">{estimate.access_considerations}</p>
                        </div>
                      )}

                      {/* Additional Services */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Additional Services</h4>
                        <div className="space-y-1 text-sm">
                          {estimate.request_donation_pickup && <p className="text-green-600">✓ Donation pickup requested</p>}
                          {estimate.request_demolition_addon && <p className="text-blue-600">✓ Demolition add-on requested</p>}
                        </div>
                      </div>

                      {/* Additional Notes */}
                      {estimate.additional_notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                          <p className="text-sm text-gray-600">{estimate.additional_notes}</p>
                        </div>
                      )}

                      {/* How they heard about us */}
                      {estimate.how_did_you_hear && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Marketing Source</h4>
                          <p className="text-sm text-gray-600">{estimate.how_did_you_hear}</p>
                        </div>
                      )}

                      {/* Priority */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          estimate.request_priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          estimate.request_priority === 'standard' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {estimate.request_priority.charAt(0).toUpperCase() + estimate.request_priority.slice(1)}
                        </span>
                      </div>

                      {/* Media */}
                      {(estimate.photos && estimate.photos.length > 0) || (estimate.videos && estimate.videos.length > 0) ? (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Media</h4>
                          <div className="space-y-2">
                            {estimate.photos && estimate.photos.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Photos ({estimate.photos.length})</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {estimate.photos.map((photo, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      {photo}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {estimate.videos && estimate.videos.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Videos ({estimate.videos.length})</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {estimate.videos.map((video, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      {video}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Timestamps */}
                      <div className="text-xs text-gray-500 border-t pt-4">
                        <p>Created: {new Date(estimate.created_at).toLocaleString()}</p>
                        <p>Updated: {new Date(estimate.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No estimate data found.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Item Form Modal */}
        <JobItemForm
          jobId={job.id}
          item={editingItem}
          isOpen={isItemFormOpen}
          onClose={() => {
            setIsItemFormOpen(false);
            setEditingItem(undefined);
          }}
          onItemSaved={handleItemSaved}
        />

        {/* Note Form Modal */}
        <JobNoteForm
          jobId={job.id}
          note={editingNote}
          isOpen={isNoteFormOpen}
          onClose={() => {
            setIsNoteFormOpen(false);
            setEditingNote(undefined);
          }}
          onNoteSaved={handleNoteSaved}
        />
      </div>
    </div>
  );
};

export default JobDetailsModal;
