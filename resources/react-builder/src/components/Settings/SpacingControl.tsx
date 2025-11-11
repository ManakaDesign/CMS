import React, { useState } from 'react';
import { Link, Unlink } from 'lucide-react';

interface SpacingControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

type LinkMode = 'all' | 'axes' | 'none';

export const SpacingControl: React.FC<SpacingControlProps> = ({
  label,
  value,
  onChange,
  className = '',
}) => {
  const [linkMode, setLinkMode] = useState<LinkMode>('all');

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

  // Auto-append 'px' if only number
  const formatValue = (val: string): string => {
    return /^\d+$/.test(val.trim()) ? `${val}px` : val;
  };

  // Update individual side (without auto-px, that happens on blur)
  const updateSide = (side: keyof typeof sides, newValue: string) => {
    if (linkMode === 'all') {
      // Update all sides
      const newSides = {
        top: newValue,
        right: newValue,
        bottom: newValue,
        left: newValue,
      };
      setSides(newSides);
      onChange(newValue);
    } else if (linkMode === 'axes') {
      // Update vertical or horizontal pair
      const newSides = { ...sides };
      if (side === 'top' || side === 'bottom') {
        newSides.top = newValue;
        newSides.bottom = newValue;
      } else {
        newSides.left = newValue;
        newSides.right = newValue;
      }
      setSides(newSides);
      onChange(`${newSides.top} ${newSides.right} ${newSides.bottom} ${newSides.left}`);
    } else {
      // Update only the specific side
      const newSides = { ...sides, [side]: newValue };
      setSides(newSides);
      // Ensure empty values are treated as "0" for proper CSS shorthand
      const top = newSides.top || '0';
      const right = newSides.right || '0';
      const bottom = newSides.bottom || '0';
      const left = newSides.left || '0';
      onChange(`${top} ${right} ${bottom} ${left}`);
    }
  };

  // Apply auto-px on blur
  const handleBlur = (side: keyof typeof sides) => {
    const currentValue = sides[side];
    const formattedValue = formatValue(currentValue);

    if (currentValue !== formattedValue) {
      updateSide(side, formattedValue);
    }
  };

  const cycleLinkMode = () => {
    if (linkMode === 'all') setLinkMode('axes');
    else if (linkMode === 'axes') setLinkMode('none');
    else setLinkMode('all');
  };

  const getLinkIcon = () => {
    if (linkMode === 'all') {
      return <Link className="w-4 h-4 text-brand-primary" />;
    } else if (linkMode === 'axes') {
      return (
        <div className="relative w-4 h-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-brand-primary text-xs font-bold">⊕</div>
          </div>
        </div>
      );
    } else {
      return <Unlink className="w-4 h-4 text-light-muted" />;
    }
  };

  const getLinkTitle = () => {
    if (linkMode === 'all') return 'All sides linked - Click for axis mode';
    if (linkMode === 'axes') return 'Vertical/Horizontal linked - Click to unlink';
    return 'All unlinked - Click to link all';
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-light-text">{label}</label>
        <button
          onClick={cycleLinkMode}
          className="p-1 hover:bg-dark-hover rounded transition-colors"
          title={getLinkTitle()}
        >
          {getLinkIcon()}
        </button>
      </div>

      {linkMode === 'all' ? (
        // Single input when all linked
        <input
          type="text"
          value={sides.top}
          onChange={(e) => updateSide('top', e.target.value)}
          onBlur={() => handleBlur('top')}
          className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
          placeholder="e.g. 10px or 10"
        />
      ) : linkMode === 'axes' ? (
        // Two inputs for vertical/horizontal
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-light-muted mb-1 block">Vertical (Top & Bottom)</label>
            <input
              type="text"
              value={sides.top}
              onChange={(e) => updateSide('top', e.target.value)}
              onBlur={() => handleBlur('top')}
              className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="0px"
            />
          </div>
          <div>
            <label className="text-xs text-light-muted mb-1 block">Horizontal (Left & Right)</label>
            <input
              type="text"
              value={sides.left}
              onChange={(e) => updateSide('left', e.target.value)}
              onBlur={() => handleBlur('left')}
              className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="0px"
            />
          </div>
        </div>
      ) : (
        // Grid of 4 inputs when unlinked
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-light-muted mb-1 block">Top</label>
            <input
              type="text"
              value={sides.top}
              onChange={(e) => updateSide('top', e.target.value)}
              onBlur={() => handleBlur('top')}
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
              onBlur={() => handleBlur('right')}
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
              onBlur={() => handleBlur('bottom')}
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
              onBlur={() => handleBlur('left')}
              className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="0px"
            />
          </div>
        </div>
      )}
    </div>
  );
};
