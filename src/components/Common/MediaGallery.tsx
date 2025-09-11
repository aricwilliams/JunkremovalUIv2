import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Trash2, Eye, EyeOff, Calendar, FileImage, FileVideo } from 'lucide-react';
import { awsUploadService, MediaItem } from '../../services/awsUploadService';

interface MediaGalleryProps {
  mediaItems: MediaItem[];
  onDelete?: (mediaId: number) => void;
  onToggleVisibility?: (mediaId: number, isPublic: boolean) => void;
  showActions?: boolean;
  className?: string;
  gridCols?: 2 | 3 | 4 | 5 | 6;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  mediaItems,
  onDelete,
  onToggleVisibility,
  showActions = true,
  className = "",
  gridCols = 4
}) => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [expandedMedia, setExpandedMedia] = useState<string | null>(null);

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }[gridCols];

  const formatFileSize = (bytes: number) => {
    return awsUploadService.formatFileSize(bytes);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoPlay = (mediaId: string) => {
    setPlayingVideo(playingVideo === mediaId ? null : mediaId);
  };

  const handleDownload = async (mediaItem: MediaItem) => {
    try {
      // If it's a private file, get signed URL first
      let downloadUrl = mediaItem.file_url;
      if (!mediaItem.file_url.startsWith('http')) {
        downloadUrl = await awsUploadService.getSignedUrl(mediaItem.file_path);
      }

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = mediaItem.file_path.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = (mediaId: number) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      onDelete?.(mediaId);
    }
  };

  const handleToggleVisibility = (mediaId: number, currentVisibility: boolean) => {
    onToggleVisibility?.(mediaId, !currentVisibility);
  };

  if (mediaItems.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No media files found</p>
        <p className="text-gray-400 text-sm">Upload some images or videos to get started</p>
      </div>
    );
  }

  return (
    <div className={`media-gallery ${className}`}>
      <div className={`grid ${gridColsClass} gap-4`}>
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Media Content */}
            <div className="aspect-square relative">
              {item.file_type === 'image' ? (
                <img
                  src={item.thumbnail_url || item.file_url}
                  alt={item.caption || 'Media file'}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setExpandedMedia(expandedMedia === item.id ? null : item.id)}
                />
              ) : (
                <div className="relative w-full h-full bg-gray-900">
                  <video
                    className="w-full h-full object-cover"
                    poster={item.thumbnail_url}
                    controls={playingVideo === item.id}
                    onPlay={() => setPlayingVideo(item.id)}
                    onPause={() => setPlayingVideo(null)}
                  >
                    <source src={item.file_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video Overlay */}
                  {playingVideo !== item.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <button
                        onClick={() => handleVideoPlay(item.id)}
                        className="p-3 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                      >
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Video Duration */}
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(item.duration)}
                    </div>
                  )}
                </div>
              )}

              {/* File Type Badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  item.file_type === 'image' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {item.file_type === 'image' ? (
                    <FileImage className="w-3 h-3 inline mr-1" />
                  ) : (
                    <FileVideo className="w-3 h-3 inline mr-1" />
                  )}
                  {item.file_type.toUpperCase()}
                </span>
              </div>

              {/* Actions Overlay */}
              {showActions && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Media Info */}
            <div className="p-3">
              {item.caption && (
                <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {item.caption}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(item.created_at)}
                </div>
                <span>{formatFileSize(item.file_size)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Media Modal */}
      {expandedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setExpandedMedia(null)}
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300 z-10"
            >
              ×
            </button>
            
            {(() => {
              const item = mediaItems.find(m => m.id === expandedMedia);
              if (!item) return null;
              
              return item.file_type === 'image' ? (
                <img
                  src={item.file_url}
                  alt={item.caption || 'Media file'}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={item.file_url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                >
                  Your browser does not support the video tag.
                </video>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
