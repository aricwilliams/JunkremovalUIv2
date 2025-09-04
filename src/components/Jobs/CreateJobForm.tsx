import React, { useState } from 'react';
import { jobsService } from '../../services/jobsService';
import { X, Calendar, User, DollarSign, FileText } from 'lucide-react';

interface CreateJobFormProps {
  onJobCreated: (job: any) => void;
  onCancel: () => void;
  customers?: Array<{ id: number; name: string; email: string; phone: string }>;
  employees?: Array<{ id: number; first_name: string; last_name: string; job_title: string }>;
}

interface CreateJobData {
  customer_id: number;
  estimate_id?: number;
  assigned_employee_id?: number;
  title: string;
  description?: string;
  scheduled_date: string;
  total_cost?: number;
}

const CreateJobForm: React.FC<CreateJobFormProps> = ({ 
  onJobCreated, 
  onCancel,
  customers = [],
  employees = []
}) => {
  const [formData, setFormData] = useState<CreateJobData>({
    customer_id: 0,
    title: '',
    description: '',
    scheduled_date: '',
    total_cost: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customer_id' || name === 'assigned_employee_id' || name === 'total_cost' 
        ? Number(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.title || !formData.scheduled_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsService.createJob(formData);
      
      if (response.success && response.data) {
        onJobCreated(response.data.job);
        // Reset form
        setFormData({
          customer_id: 0,
          title: '',
          description: '',
          scheduled_date: '',
          total_cost: 0
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Job</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <X className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="customer_id" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                <span>Customer *</span>
              </label>
              <select
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="assigned_employee_id" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                <span>Assigned Employee</span>
              </label>
              <select
                id="assigned_employee_id"
                name="assigned_employee_id"
                value={formData.assigned_employee_id || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Select an employee (optional)</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} ({employee.job_title})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              <span>Job Title *</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Residential Cleanout, Office Furniture Removal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              <span>Description</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe the job details, items to be removed, special instructions, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="scheduled_date" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Scheduled Date & Time *</span>
              </label>
              <input
                type="datetime-local"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="total_cost" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4" />
                <span>Estimated Cost</span>
              </label>
              <input
                type="number"
                id="total_cost"
                name="total_cost"
                value={formData.total_cost || ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Job</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobForm;
