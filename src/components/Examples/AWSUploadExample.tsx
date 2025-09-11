import React, { useState, useEffect } from 'react';
import { Upload, Image, Video, FileText, Download, Trash2 } from 'lucide-react';
import FileUpload from '../Common/FileUpload';
import MediaGallery from '../Common/MediaGallery';
import { awsUploadService, MediaItem, UploadResponse } from '../../services/awsUploadService';

const AWSUploadExample: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');

  useEffect(() => {
    loadUserMedia();
  }, []);

  const loadUserMedia = async () => {
    try {
      setLoading(true);
      const response = await awsUploadService.getUserMedia({ page: 1, limit: 50 });
      setMediaItems(response.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (response: UploadResponse) => {
    console.log('Upload completed:', response);
    // Reload media to show the new upload
    loadUserMedia();
  };

  const handleUploadError = (error: string) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
  };

  const handleDeleteMedia = async (mediaId: number) => {
    try {
      await awsUploadService.deleteMedia(mediaId);
      setMediaItems(prev => prev.filter(item => item.id !== mediaId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleToggleVisibility = async (mediaId: number, isPublic: boolean) => {
    try {
      await awsUploadService.updateUpload(mediaId, { is_public: isPublic });
      setMediaItems(prev => prev.map(item => 
        item.id === mediaId ? { ...item, is_public: isPublic } : item
      ));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const downloadAllMedia = async () => {
    try {
      for (const item of mediaItems) {
        await awsUploadService.getSignedUrl(item.file_path);
        // Trigger download for each item
        const link = document.createElement('a');
        link.href = item.file_url;
        link.download = item.file_path.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AWS S3 Upload System Demo
        </h1>
        <p className="text-gray-600">
          Upload and manage images and videos with AWS S3 integration
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Files
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gallery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Image className="w-4 h-4 inline mr-2" />
              Media Gallery ({mediaItems.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-8">
          {/* Single File Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Single File Upload
            </h2>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              accept="image/*,video/*"
              maxSizeMB={50}
              multiple={false}
              uploadOptions={{
                title: 'Demo Upload',
                description: 'Uploaded via AWS S3 demo',
                isPublic: false
              }}
            />
          </div>

          {/* Multiple Files Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Multiple Files Upload
            </h2>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              accept="image/*,video/*"
              maxSizeMB={50}
              multiple={true}
              uploadOptions={{
                title: 'Batch Upload',
                description: 'Multiple files uploaded via AWS S3',
                isPublic: false
              }}
            />
          </div>

          {/* Upload Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Image className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">
                  {mediaItems.filter(item => item.file_type === 'image').length}
                </p>
                <p className="text-blue-700">Images</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Video className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {mediaItems.filter(item => item.file_type === 'video').length}
                </p>
                <p className="text-purple-700">Videos</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">
                  {awsUploadService.formatFileSize(
                    mediaItems.reduce((total, item) => total + item.file_size, 0)
                  )}
                </p>
                <p className="text-green-700">Total Size</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Gallery Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Your Media Library
              </h2>
              <p className="text-gray-600">
                {mediaItems.length} files uploaded
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadAllMedia}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </button>
              <button
                onClick={loadUserMedia}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Media Gallery */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading media...</p>
            </div>
          ) : (
            <MediaGallery
              mediaItems={mediaItems}
              onDelete={handleDeleteMedia}
              onToggleVisibility={handleToggleVisibility}
              showActions={true}
              gridCols={4}
            />
          )}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How to Use This System
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Upload Process:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Select files using the upload area or drag & drop</li>
              <li>Files are validated for type and size</li>
              <li>Upload progress is shown in real-time</li>
              <li>Files are uploaded to AWS S3</li>
              <li>Database records are created automatically</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Supported Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Images: JPEG, PNG, GIF, WebP</li>
              <li>Videos: MP4, WebM, AVI, MOV</li>
              <li>File size up to 50MB</li>
              <li>Automatic thumbnail generation</li>
              <li>Signed URLs for private access</li>
              <li>Batch upload and download</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWSUploadExample;
