import React, { useState } from 'react';
import { FiX, FiDownload, FiTrash2, FiCopy, FiCheck, FiFolder } from 'react-icons/fi';
import { mediaApi } from '../../../api/services';
import type { Media, MediaFolder } from '../../../types';

interface MediaDetailModalProps {
  media: Media;
  folders: MediaFolder[];
  onClose: () => void;
  onUpdate: (media: Media) => void;
  onDelete: (mediaId: number) => void;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  media,
  folders,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [altText, setAltText] = useState(media.alt_text || '');
  const [caption, setCaption] = useState(media.caption || '');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(media.folder_id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await mediaApi.update(media.id, {
        alt_text: altText,
        caption: caption,
        folder_id: selectedFolderId,
      });
      onUpdate(result.media);
    } catch (error) {
      console.error('Failed to update media:', error);
      alert('Failed to update media');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this media file? This action cannot be undone.')) {
      return;
    }

    try {
      await mediaApi.delete(media.id);
      onDelete(media.id);
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete media');
    }
  };

  const copyToClipboard = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2000);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Media Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Preview */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {media.is_image ? (
                  <img
                    src={media.medium_url || media.url}
                    alt={media.alt_text || media.original_filename}
                    className="w-full h-auto"
                  />
                ) : media.is_video ? (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center">
                    <p className="text-gray-500">No preview available</p>
                  </div>
                )}
              </div>

              {/* Download Links */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">Original</p>
                    <p className="text-xs text-gray-500 truncate">{media.url}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => copyToClipboard(media.url || '', 'original')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === 'original' ? (
                        <FiCheck size={16} className="text-green-600" />
                      ) : (
                        <FiCopy size={16} />
                      )}
                    </button>
                    <a
                      href={media.url}
                      download
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Download"
                    >
                      <FiDownload size={16} />
                    </a>
                  </div>
                </div>

                {media.webp_url && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">WebP Version</p>
                      <p className="text-xs text-gray-500 truncate">{media.webp_url}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => copyToClipboard(media.webp_url || '', 'webp')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Copy URL"
                      >
                        {copiedUrl === 'webp' ? (
                          <FiCheck size={16} className="text-green-600" />
                        ) : (
                          <FiCopy size={16} />
                        )}
                      </button>
                      <a
                        href={media.webp_url}
                        download
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Download"
                      >
                        <FiDownload size={16} />
                      </a>
                    </div>
                  </div>
                )}

                {media.thumbnail_url && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">Thumbnail</p>
                      <p className="text-xs text-gray-500 truncate">{media.thumbnail_url}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(media.thumbnail_url || '', 'thumbnail')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === 'thumbnail' ? (
                        <FiCheck size={16} className="text-green-600" />
                      ) : (
                        <FiCopy size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Details & Edit */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Details</h3>

              {/* File Info */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs font-medium text-gray-500">Filename</label>
                  <p className="text-sm text-gray-900 break-all">{media.original_filename}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <p className="text-sm text-gray-900">{media.mime_type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Size</label>
                    <p className="text-sm text-gray-900">{media.human_size}</p>
                  </div>
                </div>

                {media.dimensions && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Dimensions</label>
                    <p className="text-sm text-gray-900">{media.dimensions}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500">Uploaded</label>
                  <p className="text-sm text-gray-900">
                    {new Date(media.created_at).toLocaleString()}
                  </p>
                </div>

                {media.is_svg_colorable && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-900">SVG Colorable</p>
                    <p className="text-xs text-blue-700 mt-1">
                      This SVG has been optimized to use currentColor
                    </p>
                  </div>
                )}
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Optional caption"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiFolder className="inline mr-1" size={14} />
                    Folder
                  </label>
                  <select
                    value={selectedFolderId || ''}
                    onChange={(e) => setSelectedFolderId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No folder</option>
                    {flatFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {'  '.repeat(folder.level)}
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 size={16} />
            Delete
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailModal;
