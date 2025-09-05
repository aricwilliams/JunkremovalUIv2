import React, { useState, useEffect } from 'react';
import { jobsService, CreateJobNoteRequest, UpdateJobNoteRequest, JobNote } from '../../services/jobsService';
import {
  X,
  Save,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface JobNoteFormProps {
  jobId: number;
  note?: JobNote;
  isOpen: boolean;
  onClose: () => void;
  onNoteSaved: (note: JobNote) => void;
}

const JobNoteForm: React.FC<JobNoteFormProps> = ({
  jobId,
  note,
  isOpen,
  onClose,
  onNoteSaved
}) => {
  const [formData, setFormData] = useState({
    note_type: note?.note_type || 'general' as 'general' | 'customer_communication' | 'internal' | 'issue' | 'resolution',
    content: note?.content || '',
    is_important: note?.is_important || false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update form data when note prop changes
  useEffect(() => {
    if (note) {
      setFormData({
        note_type: note.note_type || 'general',
        content: note.content || '',
        is_important: note.is_important || false
      });
    } else {
      // Reset form for new note
      setFormData({
        note_type: 'general',
        content: '',
        is_important: false
      });
    }
  }, [note]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (note) {
        // Update existing note
        const updateData: UpdateJobNoteRequest = {
          note_type: formData.note_type,
          content: formData.content,
          is_important: formData.is_important
        };
        const response = await jobsService.updateJobNote(jobId, note.id, updateData);
        onNoteSaved(response.data.note);
        setSuccess('Note updated successfully!');
      } else {
        // Create new note
        const createData: CreateJobNoteRequest = {
          note_type: formData.note_type,
          content: formData.content,
          is_important: formData.is_important
        };
        const response = await jobsService.addJobNote(jobId, createData);
        onNoteSaved(response.data.note);
        setSuccess('Note added successfully!');
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save note');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {note ? 'Edit Note' : 'Add Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-100 text-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Note Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Type
            </label>
            <select
              name="note_type"
              value={formData.note_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="customer_communication">Customer Communication</option>
              <option value="internal">Internal</option>
              <option value="issue">Issue</option>
              <option value="resolution">Resolution</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your note here..."
            />
          </div>

          {/* Important Flag */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_important"
              checked={formData.is_important}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Mark as important
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{note ? 'Update Note' : 'Add Note'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobNoteForm;
