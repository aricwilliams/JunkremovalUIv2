import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import { announcementsService } from '../../services/announcementsService';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
  onClose?: () => void;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onClose }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch visible announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await announcementsService.getAnnouncements(true);
        
        if (response.success && response.data.announcements.length > 0) {
          setAnnouncements(response.data.announcements);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
        setIsVisible(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Refresh announcements every 5 minutes
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate through announcements
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  // Don't render if no announcements or loading
  if (loading || !isVisible || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="announcement-bar">
      <div className="announcement-container">
        {/* Scrolling text container */}
        <div className="announcement-text-container">
          <div 
            className="announcement-text"
            key={currentAnnouncement.id}
          >
            {currentAnnouncement.message}
          </div>
        </div>

        {/* Multiple announcements indicator */}
        {announcements.length > 1 && (
          <div className="announcement-indicators">
            {announcements.map((_, index) => (
              <div
                key={index}
                className={`announcement-indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="announcement-close"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};

export default AnnouncementBar;
