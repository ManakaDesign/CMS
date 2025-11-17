import React, { useState, useEffect } from 'react';
import { Link, Link2, Minus } from 'lucide-react';
import { NumberInput } from '../UI/NumberInput';

interface SpacingControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

type LinkState = {
  all: boolean;
  vertical: boolean;
  horizontal: boolean;
};

export const SpacingControl: React.FC<SpacingControlProps> = ({
  label,
  value,
  onChange,
  className = '',
}) => {
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
  const [linkState, setLinkState] = useState<LinkState>({
    all: false,
    vertical: false,
    horizontal: false,
  });

  // Update sides when value prop changes
  useEffect(() => {
    setSides(parseValue(value));
  }, [value]);

  // Update individual side
  const updateSide = (side: 'top' | 'right' | 'bottom' | 'left', newValue: string) => {
    let newSides = { ...sides };

    if (linkState.all) {
      // Update all sides
      newSides = {
        top: newValue,
        right: newValue,
        bottom: newValue,
        left: newValue,
      };
    } else {
      // Update specific side
      newSides[side] = newValue;

      // Apply vertical link
      if (linkState.vertical) {
        if (side === 'top') newSides.bottom = newValue;
        if (side === 'bottom') newSides.top = newValue;
      }

      // Apply horizontal link
      if (linkState.horizontal) {
        if (side === 'left') newSides.right = newValue;
        if (side === 'right') newSides.left = newValue;
      }
    }

    setSides(newSides);

    // Format and emit change
    const top = newSides.top || '0px';
    const right = newSides.right || '0px';
    const bottom = newSides.bottom || '0px';
    const left = newSides.left || '0px';
    onChange(`${top} ${right} ${bottom} ${left}`);
  };

  // Toggle link states
  const toggleAll = () => {
    const newAllState = !linkState.all;
    setLinkState({
      all: newAllState,
      vertical: false,
      horizontal: false,
    });
  };

  const toggleVertical = () => {
    setLinkState({
      ...linkState,
      all: false,
      vertical: !linkState.vertical,
    });
  };

  const toggleHorizontal = () => {
    setLinkState({
      ...linkState,
      all: false,
      horizontal: !linkState.horizontal,
    });
  };

  return (
    <div className={className}>
      {/* Header with label and "link all" button */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-light-text">{label}</label>
        <button
          onClick={toggleAll}
          className={`p-1 hover:bg-dark-hover rounded transition-colors ${
            linkState.all ? 'text-brand-primary' : 'text-light-muted'
          }`}
          title={linkState.all ? 'Unlink all sides' : 'Link all sides'}
        >
          {linkState.all ? <Link className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
        </button>
      </div>

      {/* Always show all 4 inputs */}
      <div className="space-y-2">
        {/* Top */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-light-muted w-12">Top</label>
          <NumberInput
            value={sides.top || '0px'}
            onChange={(val) => updateSide('top', val)}
            min={0}
            max={1000}
            step={1}
            className="flex-1 px-2 py-1.5 bg-dark-panel border border-dark-border text-sm text-light-text"
            placeholder="0"
          />
          <button
            onClick={toggleVertical}
            className={`p-1 hover:bg-dark-hover rounded transition-colors ${
              linkState.vertical ? 'text-brand-primary' : 'text-light-muted'
            }`}
            title={linkState.vertical ? 'Unlink vertical' : 'Link top & bottom'}
          >
            <Link2 className="w-3 h-3 rotate-90" />
          </button>
        </div>

        {/* Bottom */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-light-muted w-12">Bottom</label>
          <NumberInput
            value={sides.bottom || '0px'}
            onChange={(val) => updateSide('bottom', val)}
            min={0}
            max={1000}
            step={1}
            className="flex-1 px-2 py-1.5 bg-dark-panel border border-dark-border text-sm text-light-text"
            placeholder="0"
          />
          <button
            onClick={toggleVertical}
            className={`p-1 hover:bg-dark-hover rounded transition-colors ${
              linkState.vertical ? 'text-brand-primary' : 'text-light-muted'
            }`}
            title={linkState.vertical ? 'Unlink vertical' : 'Link top & bottom'}
          >
            <Link2 className="w-3 h-3 rotate-90" />
          </button>
        </div>

        {/* Left */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-light-muted w-12">Left</label>
          <NumberInput
            value={sides.left || '0px'}
            onChange={(val) => updateSide('left', val)}
            min={0}
            max={1000}
            step={1}
            className="flex-1 px-2 py-1.5 bg-dark-panel border border-dark-border text-sm text-light-text"
            placeholder="0"
          />
          <button
            onClick={toggleHorizontal}
            className={`p-1 hover:bg-dark-hover rounded transition-colors ${
              linkState.horizontal ? 'text-brand-primary' : 'text-light-muted'
            }`}
            title={linkState.horizontal ? 'Unlink horizontal' : 'Link left & right'}
          >
            <Link2 className="w-3 h-3" />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-light-muted w-12">Right</label>
          <NumberInput
            value={sides.right || '0px'}
            onChange={(val) => updateSide('right', val)}
            min={0}
            max={1000}
            step={1}
            className="flex-1 px-2 py-1.5 bg-dark-panel border border-dark-border text-sm text-light-text"
            placeholder="0"
          />
          <button
            onClick={toggleHorizontal}
            className={`p-1 hover:bg-dark-hover rounded transition-colors ${
              linkState.horizontal ? 'text-brand-primary' : 'text-light-muted'
            }`}
            title={linkState.horizontal ? 'Unlink horizontal' : 'Link left & right'}
          >
            <Link2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
