import React, { useState, useRef, useCallback } from 'react';
import { FiUpload, FiX, FiFile, FiImage, FiVideo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { mediaApi } from '../../../api/services';
import type { Media } from '../../../types';

interface MediaUploadProps {
  currentFolderId: number | null;
  onClose: () => void;
  onUploadComplete: (media: Media) => void;
}

interface UploadFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  media?: Media;
  altText?: string;
  caption?: string;
  makeSvgColorable?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  currentFolderId,
  onClose,
  onUploadComplete,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const uploadFiles: UploadFile[] = fileArray.map((file) => {
      const uploadFile: UploadFile = {
        file,
        status: 'pending',
        progress: 0,
        makeSvgColorable: file.type === 'image/svg+xml',
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file ? { ...f, preview: e.target?.result as string } : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      return uploadFile;
    });

    setFiles((prev) => [...prev, ...uploadFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
    },
    [addFiles]
  );

  const uploadFile = async (uploadFile: UploadFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.file === uploadFile.file ? { ...f, status: 'uploading', progress: 0 } : f
      )
    );

    try {
      const options: any = {};
      if (uploadFile.altText) options.alt_text = uploadFile.altText;
      if (uploadFile.caption) options.caption = uploadFile.caption;
      if (currentFolderId) options.folder_id = currentFolderId;
      if (uploadFile.makeSvgColorable && uploadFile.file.type === 'image/svg+xml') {
        options.make_svg_colorable = true;
      }

      const result = await mediaApi.upload(uploadFile.file, options);

      setFiles((prev) =>
        prev.map((f) =>
          f.file === uploadFile.file
            ? { ...f, status: 'success', progress: 100, media: result.media }
            : f
        )
      );

      onUploadComplete(result.media);
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === uploadFile.file
            ? {
                ...f,
                status: 'error',
                progress: 0,
                error: error.response?.data?.message || 'Upload failed',
              }
            : f
        )
      );
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  const removeFile = (fileToRemove: UploadFile) => {
    setFiles((prev) => prev.filter((f) => f.file !== fileToRemove.file));
  };

  const updateFileMetadata = (file: UploadFile, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.file === file.file ? { ...f, ...updates } : f))
    );
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FiImage size={24} />;
    if (file.type.startsWith('video/')) return <FiVideo size={24} />;
    return <FiFile size={24} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasFiles = files.length > 0;
  const hasPendingFiles = files.some((f) => f.status === 'pending');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Upload Media</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FiUpload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Support for images (JPG, PNG, GIF, SVG, WebP) and videos (MP4, WebM)
            </p>
            <p className="text-xs text-gray-400 mt-2">Maximum file size: 50MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File List */}
          {hasFiles && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Files to upload</h3>
              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Preview/Icon */}
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {uploadFile.preview ? (
                        <img
                          src={uploadFile.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getFileIcon(uploadFile.file)
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadFile.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(uploadFile.file.size)}
                          </p>
                        </div>

                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {uploadFile.status === 'success' && (
                            <FiCheckCircle size={20} className="text-green-600" />
                          )}
                          {uploadFile.status === 'error' && (
                            <FiAlertCircle size={20} className="text-red-600" />
                          )}
                          {uploadFile.status === 'pending' && (
                            <button
                              onClick={() => removeFile(uploadFile)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <FiX size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadFile.status === 'error' && (
                        <p className="mt-1 text-xs text-red-600">{uploadFile.error}</p>
                      )}

                      {/* Metadata Inputs */}
                      {uploadFile.status === 'pending' && (
                        <div className="mt-3 space-y-2">
                          <input
                            type="text"
                            placeholder="Alt text (optional)"
                            value={uploadFile.altText || ''}
                            onChange={(e) =>
                              updateFileMetadata(uploadFile, { altText: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={uploadFile.caption || ''}
                            onChange={(e) =>
                              updateFileMetadata(uploadFile, { caption: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          {/* SVG Colorable Option */}
                          {uploadFile.file.type === 'image/svg+xml' && (
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={uploadFile.makeSvgColorable || false}
                                onChange={(e) =>
                                  updateFileMetadata(uploadFile, {
                                    makeSvgColorable: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              Make SVG colorable (replace colors with currentColor)
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={uploadAll}
            disabled={!hasPendingFiles}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Upload {files.filter((f) => f.status === 'pending').length} Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
