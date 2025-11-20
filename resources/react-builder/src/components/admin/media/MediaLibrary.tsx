import React, { useState, useEffect } from 'react';
import { FiUpload, FiSearch, FiGrid, FiList, FiFilter } from 'react-icons/fi';
import { mediaApi, mediaFoldersApi } from '../../../api/services';
import type { Media, MediaFolder } from '../../../types';
import FolderTree from './FolderTree';
import MediaUpload from './MediaUpload';
import MediaGrid from './MediaGrid';
import MediaDetailModal from './MediaDetailModal';

type ViewMode = 'grid' | 'list';
type MediaTypeFilter = 'all' | 'image' | 'video';
type SortBy = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'size_asc' | 'size_desc';

const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load folders
  useEffect(() => {
    loadFolders();
  }, []);

  // Load media when filters change
  useEffect(() => {
    loadMedia();
  }, [selectedFolderId, searchQuery, page, mediaTypeFilter, sortBy]);

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

      if (mediaTypeFilter === 'image') {
        params.type = 'image';
      } else if (mediaTypeFilter === 'video') {
        params.type = 'video';
      }

      // Sort mapping
      const sortMap: Record<SortBy, string> = {
        newest: 'created_at_desc',
        oldest: 'created_at_asc',
        name_asc: 'name_asc',
        name_desc: 'name_desc',
        size_asc: 'size_asc',
        size_desc: 'size_desc',
      };
      params.sort = sortMap[sortBy];

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

  const handleMediaUpdate = (_updatedMedia: Media) => {
    // Reload media list to reflect folder changes
    loadMedia();
    setSelectedMedia(null);
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
    <>
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-light-text">Media Bibliothek</h1>
              <p className="text-sm text-light-muted mt-1">Verwalte Bilder, Videos und andere Dateien</p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <FiUpload size={18} />
              Media hochladen
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted" size={18} />
              <input
                type="text"
                placeholder="Suche nach Dateinamen..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-dark-panel border border-dark-border rounded-lg text-light-text placeholder-light-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                isFilterOpen
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : 'bg-dark-panel border-dark-border text-light-text hover:border-brand-primary'
              }`}
            >
              <FiFilter size={18} />
              Filter
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-dark-panel border border-dark-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-brand-primary text-white'
                    : 'text-light-muted hover:text-light-text'
                }`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brand-primary text-white'
                    : 'text-light-muted hover:text-light-text'
                }`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="mt-4 p-4 bg-dark-panel border border-dark-border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Media Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Medien-Typ
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'all' as MediaTypeFilter, label: 'Alle' },
                      { value: 'image' as MediaTypeFilter, label: 'Bilder' },
                      { value: 'video' as MediaTypeFilter, label: 'Videos' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setMediaTypeFilter(option.value);
                          setPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          mediaTypeFilter === option.value
                            ? 'bg-brand-primary border-brand-primary text-white'
                            : 'bg-dark-surface border-dark-border text-light-text hover:border-brand-primary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Sortierung
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="newest">Neueste zuerst</option>
                    <option value="oldest">Älteste zuerst</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="size_asc">Größe (Klein-Groß)</option>
                    <option value="size_desc">Größe (Groß-Klein)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Folder Tree */}
        <div className="w-64 bg-dark-surface border-r border-dark-border overflow-y-auto">
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={handleFolderSelect}
            onFolderCreate={handleFolderCreate}
            onFoldersChange={loadFolders}
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto bg-dark-bg">
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
    </>
  );
};

export default MediaLibrary;
