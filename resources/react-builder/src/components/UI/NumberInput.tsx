import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  unit?: string; // e.g., "px", "%", "rem"
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className = '',
  disabled = false,
  unit,
}) => {
  const [localValue, setLocalValue] = useState<string>(String(value));

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const parseValue = (str: string): number => {
    // Remove any non-numeric characters except minus and decimal point
    const cleanStr = str.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  const clampValue = (val: number): number => {
    let clamped = val;
    if (min !== undefined && clamped < min) clamped = min;
    if (max !== undefined && clamped > max) clamped = max;
    return clamped;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const numValue = parseValue(localValue);
    const clamped = clampValue(numValue);
    onChange(clamped);
    setLocalValue(String(clamped));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseValue(localValue);
      const increment = e.shiftKey ? step * 10 : step;
      const newValue = e.key === 'ArrowUp'
        ? currentValue + increment
        : currentValue - increment;
      const clamped = clampValue(newValue);
      onChange(clamped);
      setLocalValue(String(clamped));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`${className} ${unit ? 'pr-8' : ''}`}
      />
      {unit && (
        <span className="absolute right-3 text-sm text-light-muted pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  );
};
