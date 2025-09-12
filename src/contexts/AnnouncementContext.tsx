import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Announcement } from '../types';
import { announcementsService } from '../services/announcementsService';

interface AnnouncementContextType {
  announcements: Announcement[];
  visibleAnnouncements: Announcement[];
  loading: boolean;
  error: string | null;
  isAnnouncementBarVisible: boolean;
  refreshAnnouncements: () => Promise<void>;
  toggleAnnouncementBar: () => void;
  hideAnnouncementBar: () => void;
  showAnnouncementBar: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const useAnnouncements = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return context;
};

interface AnnouncementProviderProps {
  children: ReactNode;
}

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnnouncementBarVisible, setIsAnnouncementBarVisible] = useState(true);

  // Fetch all announcements
  const fetchAllAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await announcementsService.getAnnouncements(false);
      
      if (response.success) {
        setAnnouncements(response.data.announcements);
        // Filter visible announcements
        const visible = response.data.announcements.filter(ann => ann.is_visible);
        setVisibleAnnouncements(visible);
      } else {
        setError('Failed to fetch announcements');
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  // Fetch only visible announcements
  const fetchVisibleAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await announcementsService.getAnnouncements(true);
      
      if (response.success) {
        setVisibleAnnouncements(response.data.announcements);
        // Update the full announcements list if we have fewer visible ones
        if (response.data.announcements.length < announcements.length) {
          // Keep existing announcements but update visibility
          setAnnouncements(prev => 
            prev.map(ann => {
              const visibleAnn = response.data.announcements.find(v => v.id === ann.id);
              return visibleAnn ? { ...ann, is_visible: true } : { ...ann, is_visible: false };
            })
          );
        }
      } else {
        setError('Failed to fetch announcements');
      }
    } catch (err) {
      console.error('Error fetching visible announcements:', err);
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  // Refresh announcements (fetch all)
  const refreshAnnouncements = async () => {
    await fetchAllAnnouncements();
  };

  // Toggle announcement bar visibility
  const toggleAnnouncementBar = () => {
    setIsAnnouncementBarVisible(prev => !prev);
  };

  // Hide announcement bar
  const hideAnnouncementBar = () => {
    setIsAnnouncementBarVisible(false);
  };

  // Show announcement bar
  const showAnnouncementBar = () => {
    setIsAnnouncementBarVisible(true);
  };

  // Load announcements on mount
  useEffect(() => {
    fetchVisibleAnnouncements();
  }, []);

  // Set up periodic refresh (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVisibleAnnouncements();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const value: AnnouncementContextType = {
    announcements,
    visibleAnnouncements,
    loading,
    error,
    isAnnouncementBarVisible,
    refreshAnnouncements,
    toggleAnnouncementBar,
    hideAnnouncementBar,
    showAnnouncementBar,
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
};
