import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  value: string | number; // Can be "16px", "2em", "100%", or just 16
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowedUnits?: string[]; // e.g., ['px', 'em', 'rem', '%', 'vh', 'vw']
  defaultUnit?: string; // default unit when only number is provided
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
  allowedUnits = ['px', 'em', 'rem', '%', 'vh', 'vw', 'auto'],
  defaultUnit = 'px',
}) => {
  // Parse value into number and unit
  const parseValue = (val: string | number): { num: number; unit: string } => {
    if (typeof val === 'number') {
      return { num: val, unit: defaultUnit };
    }

    const str = String(val).trim();
    if (str === '' || str === 'auto') {
      return { num: 0, unit: 'auto' };
    }

    // Extract number and unit
    const match = str.match(/^(-?\d+\.?\d*)\s*([a-z%]*)$/i);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2] || defaultUnit;
      return { num: isNaN(num) ? 0 : num, unit };
    }

    return { num: 0, unit: defaultUnit };
  };

  const parsed = parseValue(value);
  const [localNum, setLocalNum] = useState<string>(String(parsed.num));
  const [localUnit, setLocalUnit] = useState<string>(parsed.unit);

  useEffect(() => {
    const newParsed = parseValue(value);
    setLocalNum(String(newParsed.num));
    setLocalUnit(newParsed.unit);
  }, [value]);

  const clampValue = (val: number): number => {
    let clamped = val;
    if (min !== undefined && clamped < min) clamped = min;
    if (max !== undefined && clamped > max) clamped = max;
    return clamped;
  };

  const emitChange = (num: string, unit: string) => {
    if (unit === 'auto') {
      onChange('auto');
    } else {
      const numValue = parseFloat(num);
      if (isNaN(numValue)) {
        onChange(`0${unit}`);
      } else {
        onChange(`${numValue}${unit}`);
      }
    }
  };

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalNum(e.target.value);
  };

  const handleNumBlur = () => {
    const trimmed = localNum.trim();

    // Check for special keywords (auto, none, inherit)
    const keywords = ['auto', 'none', 'inherit'];
    if (keywords.includes(trimmed.toLowerCase()) && allowedUnits.includes(trimmed.toLowerCase())) {
      console.log(`NumberInput: Detected keyword "${trimmed}"`);
      setLocalNum('0');
      setLocalUnit(trimmed.toLowerCase());
      onChange(trimmed.toLowerCase());
      return;
    }

    // Check if user entered a value with a unit (e.g., "8em", "100%", "2rem")
    const match = trimmed.match(/^(-?\d+\.?\d*)\s*([a-z%]*)$/i);

    if (match) {
      const num = parseFloat(match[1]);
      const detectedUnit = match[2] || ''; // Ensure empty string instead of undefined

      if (!isNaN(num)) {
        const clamped = clampValue(num);

        // If a unit was detected and it's in allowedUnits, switch to that unit
        if (detectedUnit.length > 0 && allowedUnits.includes(detectedUnit)) {
          console.log(`NumberInput: Auto-detected unit "${detectedUnit}" for value ${clamped}`);
          setLocalNum(String(clamped));
          setLocalUnit(detectedUnit);
          emitChange(String(clamped), detectedUnit);
        } else {
          // No unit or invalid unit - use current unit
          setLocalNum(String(clamped));
          emitChange(String(clamped), localUnit);
        }
      } else {
        emitChange('0', localUnit);
        setLocalNum('0');
      }
    } else {
      emitChange('0', localUnit);
      setLocalNum('0');
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setLocalUnit(newUnit);
    emitChange(localNum, newUnit);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseFloat(localNum) || 0;
      const increment = e.shiftKey ? step * 10 : step;
      const newValue = e.key === 'ArrowUp'
        ? currentValue + increment
        : currentValue - increment;
      const clamped = clampValue(newValue);
      setLocalNum(String(clamped));
      emitChange(String(clamped), localUnit);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleNumBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative flex items-stretch">
      <input
        type="text"
        value={localNum}
        onChange={handleNumChange}
        onBlur={handleNumBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || localUnit === 'auto'}
        className={`${className} flex-1 rounded-r-none`}
      />
      <select
        value={localUnit}
        onChange={handleUnitChange}
        disabled={disabled}
        className="w-20 px-2 py-2 bg-dark-hover border-l border-dark-border rounded-r text-xs text-light-text focus:outline-none focus:border-brand-primary"
      >
        {allowedUnits.map(unit => (
          <option key={unit} value={unit}>{unit}</option>
        ))}
      </select>
    </div>
  );
};
