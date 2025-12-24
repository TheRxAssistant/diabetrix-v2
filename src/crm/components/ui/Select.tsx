import React, { ReactNode } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value?: string;
    onChange?: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function Select({ value, onChange, options, placeholder, className = '', style }: SelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={`
        px-3 py-2 border border-gray-300 rounded-md
        bg-white text-gray-900
        focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:border-transparent
        ${className}
      `}
            style={style}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
