import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { notificationsService, Notification, NotificationStats } from '../../services/notificationsService';

interface NotificationsManagerProps {
  className?: string;
}

const NotificationsManager: React.FC<NotificationsManagerProps> = ({ className = "" }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newLink, setNewLink] = useState('');
  const [editLink, setEditLink] = useState('');

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.getNotifications();
      setNotifications(response.notifications);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await notificationsService.getNotificationStats();
      setStats(response.stats);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = notificationsService.validateGoogleReviewLink(newLink);
    if (!validation.valid) {
      setError(validation.error || 'Invalid Google review link');
      return;
    }

    try {
      setLoading(true);
      await notificationsService.createNotification(newLink);
      setNewLink('');
      setShowCreateForm(false);
      await loadNotifications();
      await loadStats();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotification = async (id: number) => {
    const validation = notificationsService.validateGoogleReviewLink(editLink);
    if (!validation.valid) {
      setError(validation.error || 'Invalid Google review link');
      return;
    }

    try {
      setLoading(true);
      await notificationsService.updateNotification(id, editLink);
      setEditingId(null);
      setEditLink('');
      await loadNotifications();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setLoading(true);
      await notificationsService.deleteNotification(id);
      await loadNotifications();
      await loadStats();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (notification: Notification) => {
    setEditingId(notification.id);
    setEditLink(notification.google_review_link);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditLink('');
  };

  const formatDate = (dateString: string) => {
    return notificationsService.formatDate(dateString);
  };

  const extractBusinessName = (url: string) => {
    return notificationsService.extractBusinessNameFromLink(url) || 'Google Review Link';
  };

  return (
    <div className={`notifications-manager ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            Google Review Notifications
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your Google review links for customer notifications
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_notifications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <LinkIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">With Links</p>
                <p className="text-2xl font-bold text-gray-900">{stats.notifications_with_links}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Without Links</p>
                <p className="text-2xl font-bold text-gray-900">{stats.notifications_without_links}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(stats.last_notification_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Google Review Link</h3>
          <form onSubmit={handleCreateNotification} className="space-y-4">
            <div>
              <label htmlFor="google-link" className="block text-sm font-medium text-gray-700 mb-2">
                Google Review Link
              </label>
              <input
                type="url"
                id="google-link"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://www.google.com/maps/place/Your+Business/reviews"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the Google Maps review link for your business
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Add Link
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Google Review Links</h3>
        </div>
        
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No Google review links found</p>
            <p className="text-gray-400 text-sm">Add your first Google review link to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6">
                {editingId === notification.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Review Link
                      </label>
                      <input
                        type="url"
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://www.google.com/maps/place/Your+Business/reviews"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleUpdateNotification(notification.id)}
                        disabled={loading}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <LinkIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="text-lg font-medium text-gray-900">
                          {extractBusinessName(notification.google_review_link)}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 break-all">
                        {notification.google_review_link}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created: {formatDate(notification.created_at)}
                        {notification.updated_at !== notification.created_at && (
                          <>
                            <span className="mx-2">•</span>
                            Updated: {formatDate(notification.updated_at)}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <a
                        href={notification.google_review_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => startEditing(notification)}
                        className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit link"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsManager;
