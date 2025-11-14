import React from 'react';
import { useBuilderStore } from '../../store/builderStore';

interface GlobalColorSwatchesProps {
  onColorSelect: (color: string) => void;
}

export const GlobalColorSwatches: React.FC<GlobalColorSwatchesProps> = ({ onColorSelect }) => {
  const { globalColors } = useBuilderStore();

  if (globalColors.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <label className="block text-xs text-light-muted mb-1">Globale Farben</label>
      <div className="flex flex-wrap gap-1">
        {globalColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color.value)}
            className="w-8 h-8 rounded border-2 border-dark-border hover:border-brand-primary transition-all hover:scale-110"
            style={{ backgroundColor: color.value }}
            title={`${color.name} (${color.value})`}
          />
        ))}
      </div>
    </div>
  );
};
