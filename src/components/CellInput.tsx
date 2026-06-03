import React, { useState, useEffect } from 'react';

interface CellInputProps {
  initialValue: string;
  onCommit: (val: string) => void;
  className?: string;
  disabled?: boolean;
}

export const CellInput: React.FC<CellInputProps> = ({ initialValue, onCommit, className = '', disabled = false }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    onCommit(value);
  };

  return (
    <input
      type="text"
      className={`input-field ${className}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={disabled}
      style={{ textAlign: 'center', width: '60px', padding: '8px 4px' }}
    />
  );
};
