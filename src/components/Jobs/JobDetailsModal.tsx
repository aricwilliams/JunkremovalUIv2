import React, { useState, useEffect } from 'react';
import { Job } from '../../types';
import { jobsService, JobItem, JobNote, StatusHistoryEntry } from '../../services/jobsService';
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
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'notes' | 'history'>('details');
  const [items, setItems] = useState<JobItem[]>([]);
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
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
    }
  }, [isOpen, job.id]);

  const loadDetailedJob = async () => {
    setLoadingDetails(true);
    try {
      const response = await jobsService.getDetailedJob(job.id);
      const detailedJobData = response.data.job;
      setItems(detailedJobData.items || []);
      setNotes(detailedJobData.notes || []);
      setStatusHistory(detailedJobData.status_history || []);
    } catch (err: any) {
      console.error('Error loading detailed job:', err);
      setError('Failed to load job details');
    } finally {
      setLoadingDetails(false);
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
              onClick={() => setActiveTab('items')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                activeTab === 'items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Items ({items.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                activeTab === 'notes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              <span>Notes ({notes.length})</span>
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

            {/* Estimate Information */}
            {job.estimate && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Related Estimate</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Title:</strong> {job.estimate.title}</p>
                  <p><strong>Amount:</strong> ${job.estimate.amount}</p>
                  <p><strong>Status:</strong> {job.estimate.status}</p>
                </div>
              </div>
            )}
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

              {/* Items Tab */}
              {activeTab === 'items' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Job Items</h3>
                    <button 
                      onClick={handleAddItem}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
                  
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No items added to this job yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.category}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Qty: {item.quantity}</span>
                                <span>Price: ${item.base_price}</span>
                                <span>Time: {item.estimated_time}min</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                  item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {item.difficulty}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleEditItem(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Job Notes</h3>
                    <button 
                      onClick={handleAddNote}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Note</span>
                    </button>
                  </div>
                  
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No notes added to this job yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className={`rounded-lg p-4 ${note.is_important ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  note.note_type === 'general' ? 'bg-gray-100 text-gray-800' :
                                  note.note_type === 'customer_communication' ? 'bg-blue-100 text-blue-800' :
                                  note.note_type === 'internal' ? 'bg-purple-100 text-purple-800' :
                                  note.note_type === 'issue' ? 'bg-red-100 text-red-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {note.note_type.replace('_', ' ')}
                                </span>
                                {note.is_important && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                    Important
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-900 mb-2">{note.content}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>By: {note.employee_name || `${note.employee_first_name} ${note.employee_last_name}`}</span>
                                <span>•</span>
                                <span>{new Date(note.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleEditNote(note)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
