import React, { useState } from 'react';
import { FiFolder, FiTrash2, FiX } from 'react-icons/fi';
import type { MediaFolder } from '../../../types';

interface MediaActionBarProps {
  selectedCount: number;
  folders: MediaFolder[];
  onMoveToFolder: (folderId: number | null) => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

const MediaActionBar: React.FC<MediaActionBarProps> = ({
  selectedCount,
  folders,
  onMoveToFolder,
  onDelete,
  onClearSelection,
}) => {
  const [showFolderMenu, setShowFolderMenu] = useState(false);

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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-brand-primary text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-6">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <span className="font-semibold">{selectedCount} selected</span>
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Clear selection"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/30" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Move to Folder */}
          <div className="relative">
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiFolder size={16} />
              Move to folder
            </button>

            {showFolderMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFolderMenu(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl min-w-[200px] max-h-[300px] overflow-y-auto z-20">
                  <button
                    onClick={() => {
                      onMoveToFolder(null);
                      setShowFolderMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
                  >
                    📁 Root / No folder
                  </button>
                  {flatFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        onMoveToFolder(folder.id);
                        setShowFolderMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      style={{ paddingLeft: `${16 + folder.level * 16}px` }}
                    >
                      📁 {folder.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaActionBar;
