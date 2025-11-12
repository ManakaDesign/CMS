import React, { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { X } from 'lucide-react';

interface BreakpointSettingsProps {
  onClose: () => void;
}

export const BreakpointSettings: React.FC<BreakpointSettingsProps> = ({ onClose }) => {
  const { breakpointWidths, setBreakpointWidths } = useBuilderStore();

  const [localWidths, setLocalWidths] = useState(breakpointWidths);

  const handleSave = () => {
    setBreakpointWidths(localWidths);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div className="bg-dark-surface rounded-lg shadow-xl w-full max-w-md border border-dark-border mt-12">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-light-text">Responsive Breakpoints</h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-dark-hover rounded transition-colors"
          >
            <X className="w-5 h-5 text-light-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-light-muted mb-4">
            Customize the pixel widths for each breakpoint. These values determine when the canvas switches between device views.
          </p>

          {/* Desktop */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-light-text">Desktop</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localWidths.desktop}
                  onChange={(e) =>
                    setLocalWidths({ ...localWidths, desktop: parseInt(e.target.value) || 1920 })
                  }
                  className="w-24 px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
                  min="768"
                  max="3840"
                />
                <span className="text-sm text-light-muted">px</span>
              </div>
            </label>
            <p className="text-xs text-light-muted">Default: 1920px</p>
          </div>

          {/* Tablet */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-light-text">Tablet</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localWidths.tablet}
                  onChange={(e) =>
                    setLocalWidths({ ...localWidths, tablet: parseInt(e.target.value) || 768 })
                  }
                  className="w-24 px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
                  min="480"
                  max="1024"
                />
                <span className="text-sm text-light-muted">px</span>
              </div>
            </label>
            <p className="text-xs text-light-muted">Default: 768px</p>
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-light-text">Mobile</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localWidths.mobile}
                  onChange={(e) =>
                    setLocalWidths({ ...localWidths, mobile: parseInt(e.target.value) || 480 })
                  }
                  className="w-24 px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
                  min="320"
                  max="768"
                />
                <span className="text-sm text-light-muted">px</span>
              </div>
            </label>
            <p className="text-xs text-light-muted">Default: 480px</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-dark-border">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-light-text bg-dark-panel hover:bg-dark-hover rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-brand-primary hover:bg-primary-600 rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
