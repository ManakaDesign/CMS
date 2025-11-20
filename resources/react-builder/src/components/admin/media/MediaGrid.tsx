import React from 'react';
import { FiImage, FiVideo, FiFile, FiChevronLeft, FiChevronRight, FiCheckSquare, FiSquare } from 'react-icons/fi';
import type { Media } from '../../../types';

interface MediaGridProps {
  media: Media[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  onMediaClick: (media: Media) => void;
  selectedMediaIds: Set<number>;
  onMediaSelect: (mediaId: number, isShiftKey: boolean, isCtrlKey: boolean) => void;
  onSelectAll: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  viewMode,
  isLoading,
  onMediaClick,
  selectedMediaIds,
  onMediaSelect,
  onSelectAll,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getMediaThumbnail = (item: Media) => {
    if (item.is_image) {
      return item.thumbnail_url || item.url;
    }
    return null;
  };

  const getMediaIcon = (item: Media) => {
    if (item.is_image) return <FiImage size={48} />;
    if (item.is_video) return <FiVideo size={48} />;
    return <FiFile size={48} />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media...</p>
        </div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FiImage size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-900 mb-2">No media files</p>
          <p className="text-sm text-gray-500">
            Upload some files to get started
          </p>
        </div>
      </div>
    );
  }

  const allSelected = media.length > 0 && media.every((m) => selectedMediaIds.has(m.id));

  return (
    <div className="flex flex-col h-full">
      {/* Select All Header */}
      {media.length > 0 && (
        <div className="px-6 py-3 border-b border-dark-border bg-dark-surface flex items-center gap-3">
          <button
            onClick={onSelectAll}
            className="flex items-center gap-2 text-sm text-light-text hover:text-brand-primary transition-colors"
          >
            {allSelected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
            <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
          {selectedMediaIds.size > 0 && (
            <span className="text-sm text-gray-400">
              {selectedMediaIds.size} selected
            </span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-6">
            {media.map((item) => {
              const thumbnail = getMediaThumbnail(item);
              const isSelected = selectedMediaIds.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey) {
                      onMediaSelect(item.id, e.shiftKey, e.ctrlKey || e.metaKey);
                    } else {
                      onMediaClick(item);
                    }
                  }}
                  className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-4 ring-blue-500'
                      : 'hover:ring-2 hover:ring-blue-500'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMediaSelect(item.id, false, true);
                    }}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/80 text-gray-700 opacity-0 group-hover:opacity-100'
                    }`}>
                      {isSelected ? <FiCheckSquare size={16} /> : <FiSquare size={16} />}
                    </div>
                  </div>

                  {/* Thumbnail/Icon */}
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={item.alt_text || item.original_filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {getMediaIcon(item)}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className={`absolute inset-0 transition-all ${
                    isSelected ? 'bg-blue-500/20' : 'bg-black/0 group-hover:bg-black/40'
                  }`} />

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">
                      {item.original_filename}
                    </p>
                    <p className="text-white text-xs opacity-75">
                      {item.human_size}
                      {item.dimensions && ` • ${item.dimensions}`}
                    </p>
                  </div>

                  {/* SVG Colorable Badge */}
                  {item.is_svg_colorable && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded shadow">
                      Colorable
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {media.map((item) => {
              const thumbnail = getMediaThumbnail(item);

              return (
                <div
                  key={item.id}
                  onClick={() => onMediaClick(item)}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Thumbnail/Icon */}
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={item.alt_text || item.original_filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {getMediaIcon(item)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.original_filename}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{item.human_size}</span>
                      {item.dimensions && <span>{item.dimensions}</span>}
                      {item.mime_type && <span>{item.mime_type}</span>}
                    </div>
                    {item.alt_text && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Alt: {item.alt_text}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {item.is_svg_colorable && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        Colorable
                      </span>
                    )}
                    {item.webp_url && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        WebP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGrid;
