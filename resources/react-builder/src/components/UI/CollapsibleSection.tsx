import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-dark-border ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-dark-hover transition-colors text-left"
      >
        <h3 className="text-sm font-semibold text-light-text uppercase">{title}</h3>
        {isOpen ? (
          <FiChevronDown size={16} className="text-light-muted" />
        ) : (
          <FiChevronRight size={16} className="text-light-muted" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
};
