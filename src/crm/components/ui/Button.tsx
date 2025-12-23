import React, { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    type?: 'primary' | 'default' | 'link' | 'text';
    size?: 'small' | 'middle' | 'large';
    icon?: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
}

export default function Button({ children, type = 'default', size = 'middle', icon, onClick, className = '', disabled = false, htmlType = 'button' }: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const typeClasses = {
        primary: 'bg-[#0078D4] text-white hover:bg-[#006bb3] focus:ring-[#0078D4]',
        default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
        link: 'text-[#0078D4] hover:text-[#006bb3] bg-transparent border-none p-0',
        text: 'text-gray-700 hover:text-gray-900 bg-transparent border-none',
    };

    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        middle: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg',
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button type={htmlType} className={`${baseClasses} ${typeClasses[type]} ${sizeClasses[size]} ${disabledClasses} ${className}`} onClick={onClick} disabled={disabled}>
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
}
