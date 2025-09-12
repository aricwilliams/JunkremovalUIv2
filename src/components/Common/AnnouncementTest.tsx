import React, { useState } from 'react';
import { announcementsService } from '../../services/announcementsService';

const AnnouncementTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const createAnnouncement = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await announcementsService.createAnnouncement(message, isVisible);
      if (response.success) {
        setResult('✅ Announcement created successfully!');
        setMessage('');
      } else {
        setResult('❌ Failed to create announcement');
      }
    } catch (error) {
      setResult('❌ Error creating announcement');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsService.getAnnouncements(true);
      if (response.success) {
        setResult(`📢 Found ${response.data.announcements.length} visible announcements`);
        console.log('Announcements:', response.data.announcements);
      } else {
        setResult('❌ Failed to fetch announcements');
      }
    } catch (error) {
      setResult('❌ Error fetching announcements');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md">
      <h3 className="text-lg font-semibold mb-4">Announcement Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter announcement message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isVisible"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isVisible" className="text-sm text-gray-700">
            Make visible immediately
          </label>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={createAnnouncement}
            disabled={loading || !message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Announcement'}
          </button>
          
          <button
            onClick={fetchAnnouncements}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Fetch Announcements'}
          </button>
        </div>

        {result && (
          <div className="p-3 bg-gray-100 rounded-md text-sm">
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementTest;
