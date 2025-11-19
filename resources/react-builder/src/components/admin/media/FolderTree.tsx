import React, { useState } from 'react';
import { FiFolder, FiFolderPlus, FiChevronRight, FiChevronDown, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import type { MediaFolder } from '../../../types';
import { mediaFoldersApi } from '../../../api/services';

interface FolderTreeProps {
  folders: MediaFolder[];
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number | null) => void;
  onFolderCreate: (name: string, parentId?: number) => void;
  onFoldersChange: () => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  selectedFolderId,
  onFolderSelect,
  onFolderCreate,
  onFoldersChange,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [creatingParentId, setCreatingParentId] = useState<number | null | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    await onFolderCreate(newFolderName, creatingParentId || undefined);
    setNewFolderName('');
    setCreatingParentId(undefined);
  };

  const handleUpdateFolder = async (folderId: number) => {
    if (!editingName.trim()) return;

    try {
      await mediaFoldersApi.update(folderId, { name: editingName });
      setEditingFolderId(null);
      onFoldersChange();
    } catch (error) {
      console.error('Failed to update folder:', error);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (!confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      return;
    }

    try {
      await mediaFoldersApi.delete(folderId);
      onFoldersChange();
    } catch (error) {
      console.error('Failed to delete folder:', error);
      alert('Failed to delete folder. It may contain media files or subfolders.');
    }
  };

  const renderFolder = (folder: MediaFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isEditing = editingFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 group ${
            isSelected ? 'bg-blue-50 text-blue-600' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Folder Icon */}
          <FiFolder size={16} className="flex-shrink-0" />

          {/* Folder Name */}
          {isEditing ? (
            <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateFolder(folder.id);
                  if (e.key === 'Escape') setEditingFolderId(null);
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={() => handleUpdateFolder(folder.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <FiCheck size={14} />
              </button>
              <button
                onClick={() => setEditingFolderId(null)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <FiX size={14} />
              </button>
            </div>
          ) : (
            <>
              <span
                onClick={() => onFolderSelect(folder.id)}
                className="flex-1 text-sm truncate"
              >
                {folder.name}
              </span>
              <span className="text-xs text-gray-500">{folder.media_count || 0}</span>

              {/* Action Buttons */}
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingParentId(folder.id);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Add subfolder"
                >
                  <FiFolderPlus size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolderId(folder.id);
                    setEditingName(folder.name);
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  title="Rename"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* New Subfolder Input */}
        {creatingParentId === folder.id && (
          <div
            className="flex items-center gap-2 px-3 py-2 bg-gray-50"
            style={{ paddingLeft: `${(level + 1) * 20 + 12}px` }}
          >
            <FiFolder size={16} className="text-gray-400" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setCreatingParentId(undefined);
              }}
              placeholder="Folder name..."
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <FiCheck size={14} />
            </button>
            <button
              onClick={() => setCreatingParentId(undefined)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <FiX size={14} />
            </button>
          </div>
        )}

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {folder.children!.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-2">
      {/* All Media */}
      <div
        onClick={() => onFolderSelect(null)}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
          selectedFolderId === null ? 'bg-blue-50 text-blue-600' : ''
        }`}
      >
        <FiFolder size={16} />
        <span className="flex-1 text-sm font-medium">All Media</span>
      </div>

      {/* New Root Folder Button */}
      {creatingParentId === null ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
          <FiFolder size={16} className="text-gray-400" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setCreatingParentId(undefined);
            }}
            placeholder="Folder name..."
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleCreateFolder}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <FiCheck size={14} />
          </button>
          <button
            onClick={() => setCreatingParentId(undefined)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <FiX size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreatingParentId(null)}
          className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-blue-600 hover:bg-blue-50"
        >
          <FiFolderPlus size={16} />
          <span>New Folder</span>
        </button>
      )}

      <div className="border-t border-gray-200 mt-2 pt-2">
        {folders.map((folder) => renderFolder(folder))}
      </div>
    </div>
  );
};

export default FolderTree;
