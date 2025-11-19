import React, { useState, useEffect } from 'react';
import { FiUpload, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { mediaApi, mediaFoldersApi } from '../../../api/services';
import type { Media, MediaFolder } from '../../../types';
import FolderTree from './FolderTree';
import MediaUpload from './MediaUpload';
import MediaGrid from './MediaGrid';
import MediaDetailModal from './MediaDetailModal';

type ViewMode = 'grid' | 'list';

const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load folders
  useEffect(() => {
    loadFolders();
  }, []);

  // Load media when folder or search changes
  useEffect(() => {
    loadMedia();
  }, [selectedFolderId, searchQuery, page]);

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

      const response = await mediaApi.list(params);
      setMedia(response.data);
      setTotalPages(response.last_page);
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

  const handleMediaUpdate = (updatedMedia: Media) => {
    setMedia((prev) =>
      prev.map((item) => (item.id === updatedMedia.id ? updatedMedia : item))
    );
    setSelectedMedia(updatedMedia);
  };

  const handleMediaDelete = (mediaId: number) => {
    setMedia((prev) => prev.filter((item) => item.id !== mediaId));
    setSelectedMedia(null);
  };

  const handleFolderCreate = async (name: string, parentId?: number) => {
    try {
      await mediaFoldersApi.create({ name, parent_id: parentId });
      await loadFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleFolderSelect = (folderId: number | null) => {
    setSelectedFolderId(folderId);
    setPage(1);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiUpload size={18} />
            Upload Media
          </button>
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Folder Tree */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={handleFolderSelect}
            onFolderCreate={handleFolderCreate}
            onFoldersChange={loadFolders}
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto">
          <MediaGrid
            media={media}
            viewMode={viewMode}
            isLoading={isLoading}
            onMediaClick={setSelectedMedia}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
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

      {/* Media Detail Modal */}
      {selectedMedia && (
        <MediaDetailModal
          media={selectedMedia}
          folders={folders}
          onClose={() => setSelectedMedia(null)}
          onUpdate={handleMediaUpdate}
          onDelete={handleMediaDelete}
        />
      )}
    </div>
  );
};

export default MediaLibrary;
