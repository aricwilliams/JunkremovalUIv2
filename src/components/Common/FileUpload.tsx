import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, FileVideo, AlertCircle, CheckCircle } from 'lucide-react';
import { awsUploadService, UploadProgress, UploadOptions } from '../../services/awsUploadService';

interface FileUploadProps {
  onUploadComplete?: (response: any) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  uploadOptions?: UploadOptions;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
  success?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  accept = "image/*,video/*",
  maxSizeMB = 50,
  multiple = false,
  uploadOptions = {},
  className = "",
  disabled = false,
  showPreview = true
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const createFilePreview = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return '';
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    return awsUploadService.validateFile(file, maxSizeMB);
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithPreview[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        const fileWithPreview: FileWithPreview = {
          ...file,
          id: generateFileId(),
          preview: createFilePreview(file)
        };
        newFiles.push(fileWithPreview);
      } else {
        onUploadError?.(validation.error || 'Invalid file');
      }
    });

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles);
    }
  }, [multiple, maxSizeMB, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updated;
    });
  };

  const uploadFile = async (file: FileWithPreview) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, uploading: true, progress: 0 } : f
      ));

      const response = await awsUploadService.uploadFile(file, {
        ...uploadOptions,
        onProgress: (progress: UploadProgress) => {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress: progress.percentage } : f
          ));
        }
      });

      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, uploading: false, success: true, progress: 100 } : f
      ));

      onUploadComplete?.(response);
    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          uploading: false, 
          error: error.message,
          progress: 0
        } : f
      ));
      onUploadError?.(error.message);
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = files
        .filter(file => !file.success && !file.uploading)
        .map(file => uploadFile(file));
      
      await Promise.all(uploadPromises);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAllFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    return awsUploadService.formatFileSize(bytes);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <FileVideo className="w-8 h-8 text-purple-500" />;
    }
    return <FileImage className="w-8 h-8 text-gray-500" />;
  };

  const hasUnuploadedFiles = files.some(file => !file.success && !file.uploading);
  const hasUploadingFiles = files.some(file => file.uploading);

  return (
    <div className={`file-upload ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-sm text-gray-500">
          {accept.includes('image') && accept.includes('video') 
            ? 'Images and videos up to ' + maxSizeMB + 'MB'
            : accept.includes('image')
            ? 'Images up to ' + maxSizeMB + 'MB'
            : 'Videos up to ' + maxSizeMB + 'MB'
          }
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              Selected Files ({files.length})
            </h3>
            <div className="flex space-x-2">
              {hasUnuploadedFiles && (
                <button
                  onClick={uploadAllFiles}
                  disabled={hasUploadingFiles || isUploading}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload All'}
                </button>
              )}
              <button
                onClick={clearAllFiles}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0 mr-3">
                  {showPreview && file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {file.uploading && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.progress || 0}% uploaded
                      </p>
                    </div>
                  )}

                  {/* Status Messages */}
                  {file.error && (
                    <div className="flex items-center mt-1 text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <p className="text-xs">{file.error}</p>
                    </div>
                  )}
                  
                  {file.success && (
                    <div className="flex items-center mt-1 text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <p className="text-xs">Upload successful</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 ml-3">
                  {!file.uploading && !file.success && (
                    <button
                      onClick={() => uploadFile(file)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Upload file"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-red-600 hover:text-red-700 ml-1"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
