import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiFolder, FiSearch, FiCheck } from 'react-icons/fi';
import { mediaApi, mediaFoldersApi } from '../../../api/services';
import type { Media, MediaFolder } from '../../../types';
import MediaUpload from './MediaUpload';

interface MediaPickerProps {
  onSelect: (media: Media) => void;
  onClose: () => void;
  accept?: 'image' | 'video' | 'all';
  title?: string;
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  onSelect,
  onClose,
  accept = 'all',
  title = 'Select Media',
}) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    loadMedia();
  }, [selectedFolderId, searchQuery, page, accept]);

  const loadFolders = async () => {
    try {
      const data = await mediaFoldersApi.list();
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        per_page: 24,
      };

      if (selectedFolderId !== null) {
        params.folder_id = selectedFolderId;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      // Filter by type if specified
      if (accept === 'image') {
        params.type = 'image';
      } else if (accept === 'video') {
        params.type = 'video';
      }

      const response = await mediaApi.list(params);
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (newMedia: Media) => {
    setMedia((prev) => [newMedia, ...prev]);
    setIsUploadOpen(false);
  };

  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia);
      onClose();
    }
  };

  const flattenFolders = (folders: MediaFolder[], level = 0): Array<MediaFolder & { level: number }> => {
    let result: Array<MediaFolder & { level: number }> = [];
    for (const folder of folders) {
      result.push({ ...folder, level });
      if (folder.children && folder.children.length > 0) {
        result = result.concat(flattenFolders(folder.children, level + 1));
      }
    }
    return result;
  };

  const flatFolders = flattenFolders(folders);

  const getMediaThumbnail = (item: Media) => {
    if (item.is_image) {
      return item.thumbnail_url || item.url;
    }
    return null;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <FiUpload size={16} />
                Upload
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedFolderId || ''}
              onChange={(e) => {
                setSelectedFolderId(e.target.value ? Number(e.target.value) : null);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Folders</option>
              {flatFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {'  '.repeat(folder.level)}
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading media...</p>
                </div>
              </div>
            ) : media.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiFolder size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No media files</p>
                  <p className="text-sm text-gray-500">Upload some files to get started</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {media.map((item) => {
                  const thumbnail = getMediaThumbnail(item);
                  const isSelected = selectedMedia?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500'
                          : 'hover:ring-2 hover:ring-blue-300'
                      }`}
                    >
                      {/* Thumbnail */}
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={item.alt_text || item.original_filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiFolder size={48} />
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <FiCheck size={16} className="text-white" />
                        </div>
                      )}

                      {/* Filename Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-xs truncate">
                          {item.original_filename}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedMedia && (
                <span>
                  Selected: <span className="font-medium">{selectedMedia.original_filename}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedMedia}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <MediaUpload
          currentFolderId={selectedFolderId}
          onClose={() => setIsUploadOpen(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  );
};

export default MediaPicker;
