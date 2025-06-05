import React, { useState } from 'react';

export const Select = ({ children, value, onValueChange, disabled = false, ...props }) => {
  return (
    <SelectProvider value={value} onValueChange={onValueChange} disabled={disabled}>
      {children}
    </SelectProvider>
  );
};

export const SelectTrigger = ({ children, className = '', ...props }) => {
  const { isOpen, setIsOpen, disabled } = useSelectContext();
  
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder = "Select...", className = '' }) => {
  const { value, selectedLabel } = useSelectContext();
  
  return (
    <span className={className}>
      {selectedLabel || placeholder}
    </span>
  );
};

export const SelectContent = ({ children, className = '', ...props }) => {
  const { isOpen } = useSelectContext();
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={`absolute z-50 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const SelectItem = ({ children, value, className = '', ...props }) => {
  const { onValueChange, setIsOpen, selectedValue } = useSelectContext();
  
  const handleClick = () => {
    onValueChange(value);
    setIsOpen(false);
  };
  
  return (
    <div 
      className={`relative flex cursor-pointer select-none items-center py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${selectedValue === value ? 'bg-blue-50 text-blue-600' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Context for Select component
const SelectContext = React.createContext();

const SelectProvider = ({ children, value, onValueChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedLabel, setSelectedLabel] = useState('');

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <SelectContext.Provider value={{
      isOpen,
      setIsOpen,
      selectedValue,
      selectedLabel,
      setSelectedLabel,
      onValueChange: handleValueChange,
      disabled
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('useSelectContext must be used within SelectProvider');
  }
  return context;
};

// Simple ChevronDown icon component
const ChevronDown = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
