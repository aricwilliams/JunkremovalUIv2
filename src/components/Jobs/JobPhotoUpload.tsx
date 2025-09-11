import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { awsUploadService, MediaItem } from '../../services/awsUploadService';

interface JobPhotoUploadProps {
  jobId: string;
  onPhotosUpdated?: (photos: MediaItem[]) => void;
  className?: string;
}

interface JobPhoto extends MediaItem {
  photo_type?: 'before' | 'after';
}

const JobPhotoUpload: React.FC<JobPhotoUploadProps> = ({
  jobId,
  onPhotosUpdated,
  className = ""
}) => {
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'before' | 'after'>('before');

  useEffect(() => {
    loadJobPhotos();
  }, [jobId]);

  const loadJobPhotos = async () => {
    try {
      const jobPhotos = await awsUploadService.getJobPhotos(jobId);
      setPhotos(jobPhotos as JobPhoto[]);
    } catch (error: any) {
      console.error('Error loading job photos:', error);
      setError('Failed to load job photos');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const response = await awsUploadService.uploadJobPhoto(
          jobId,
          file,
          selectedType,
          `${selectedType} photo - ${file.name}`
        );
        return response.data;
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotos(prev => [...prev, ...uploadedPhotos]);
      onPhotosUpdated?.(photos);
      
      // Clear the input
      event.target.value = '';
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await awsUploadService.deleteMedia(photoId);
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      onPhotosUpdated?.(photos.filter(photo => photo.id !== photoId));
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      setError(error.message);
    }
  };

  const getPhotosByType = (type: 'before' | 'after') => {
    return photos.filter(photo => 
      photo.metadata?.photo_type === type || 
      photo.tags?.includes(type) ||
      photo.photo_type === type
    );
  };

  const formatFileSize = (bytes: number) => {
    return awsUploadService.formatFileSize(bytes);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`job-photo-upload ${className}`}>
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Job Photos
            </h3>
            
            {/* Photo Type Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedType('before')}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedType === 'before'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setSelectedType('after')}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedType === 'after'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                After
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="job-photo-upload"
              disabled={uploading}
            />
            <label
              htmlFor="job-photo-upload"
              className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : `Click to upload ${selectedType} photos`}
              </p>
              <p className="text-xs text-gray-500">
                Images and videos up to 50MB
              </p>
            </label>
          </div>

          {error && (
            <div className="mt-3 flex items-center text-red-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Before Photos */}
        {getPhotosByType('before').length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Before Photos ({getPhotosByType('before').length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {getPhotosByType('before').map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {photo.file_type === 'image' ? (
                      <img
                        src={photo.thumbnail_url || photo.file_url}
                        alt={photo.caption || 'Before photo'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={photo.file_url}
                        className="w-full h-full object-cover"
                        poster={photo.thumbnail_url}
                      />
                    )}
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Delete photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Info */}
                  <div className="mt-1">
                    <p className="text-xs text-gray-500 truncate">
                      {formatFileSize(photo.file_size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(photo.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* After Photos */}
        {getPhotosByType('after').length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              After Photos ({getPhotosByType('after').length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {getPhotosByType('after').map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {photo.file_type === 'image' ? (
                      <img
                        src={photo.thumbnail_url || photo.file_url}
                        alt={photo.caption || 'After photo'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={photo.file_url}
                        className="w-full h-full object-cover"
                        poster={photo.thumbnail_url}
                      />
                    )}
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Delete photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Info */}
                  <div className="mt-1">
                    <p className="text-xs text-gray-500 truncate">
                      {formatFileSize(photo.file_size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(photo.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {photos.length === 0 && (
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No photos uploaded yet</p>
            <p className="text-gray-400 text-sm">Upload before and after photos to document the job</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPhotoUpload;
