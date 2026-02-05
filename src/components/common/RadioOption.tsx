import React from 'react';

interface RadioOptionProps {
  value: string;
  selected: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function RadioOption({
  value,
  selected,
  onChange,
  children,
  disabled = false,
}: RadioOptionProps) {
  return (
    <label
      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        type="radio"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
          selected ? 'border-blue-600' : 'border-gray-400'
        }`}
      >
        {selected && <div className="w-3 h-3 rounded-full bg-blue-600"></div>}
      </div>
      <span className="text-base text-gray-900">{children}</span>
    </label>
  );
}
