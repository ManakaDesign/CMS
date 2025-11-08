import React, { useState } from 'react';
import { Link, Unlink } from 'lucide-react';

interface SpacingControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SpacingControl: React.FC<SpacingControlProps> = ({
  label,
  value,
  onChange,
  className = '',
}) => {
  const [isLinked, setIsLinked] = useState(true);

  // Parse value into individual sides
  const parseValue = (val: string): { top: string; right: string; bottom: string; left: string } => {
    if (!val) return { top: '', right: '', bottom: '', left: '' };

    const parts = val.trim().split(/\s+/);

    if (parts.length === 1) {
      return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    } else if (parts.length === 2) {
      return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    } else if (parts.length === 3) {
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
    } else {
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    }
  };

  const [sides, setSides] = useState(parseValue(value));

  // Update individual side
  const updateSide = (side: keyof typeof sides, newValue: string) => {
    // Auto-append 'px' if only number
    const finalValue = /^\d+$/.test(newValue.trim()) ? `${newValue}px` : newValue;

    if (isLinked) {
      // Update all sides
      const newSides = {
        top: finalValue,
        right: finalValue,
        bottom: finalValue,
        left: finalValue,
      };
      setSides(newSides);
      onChange(finalValue);
    } else {
      // Update only the specific side
      const newSides = { ...sides, [side]: finalValue };
      setSides(newSides);
      // Build CSS value: top right bottom left
      onChange(`${newSides.top} ${newSides.right} ${newSides.bottom} ${newSides.left}`);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-light-text">{label}</label>
        <button
          onClick={() => setIsLinked(!isLinked)}
          className="p-1 hover:bg-dark-hover rounded transition-colors"
          title={isLinked ? 'Unlink sides' : 'Link sides'}
        >
          {isLinked ? (
            <Link className="w-4 h-4 text-brand-primary" />
          ) : (
            <Unlink className="w-4 h-4 text-light-muted" />
          )}
        </button>
      </div>

      {isLinked ? (
        // Single input when linked
        <input
          type="text"
          value={sides.top}
          onChange={(e) => updateSide('top', e.target.value)}
          className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
          placeholder="e.g. 10px or 10"
        />
      ) : (
        // Grid of inputs when unlinked
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-light-muted mb-1 block">Top</label>
            <input
              type="text"
              value={sides.top}
              onChange={(e) => updateSide('top', e.target.value)}
              className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="0px"
            />
          </div>
          <div>
            <label className="text-xs text-light-muted mb-1 block">Right</label>
            <input
              type="text"
              value={sides.right}
              onChange={(e) => updateSide('right', e.target.value)}
              className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="0px"
            />
          </div>
          <div>
            <label className="text-xs text-light-muted mb-1 block">Bottom</label>
            <input
              type="text"
              value={sides.bottom}
              onChange={(e) => updateSide('bottom', e.target.value)}
              className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="0px"
            />
          </div>
          <div>
            <label className="text-xs text-light-muted mb-1 block">Left</label>
            <input
              type="text"
              value={sides.left}
              onChange={(e) => updateSide('left', e.target.value)}
              className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="0px"
            />
          </div>
        </div>
      )}
    </div>
  );
};
