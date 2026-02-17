import React, { ReactNode } from 'react';
import { useThemeConfig } from '../../../hooks/useThemeConfig';

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
    const themeConfig = useThemeConfig();
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const getTypeStyles = () => {
        switch (type) {
            case 'primary':
                return {
                    backgroundColor: themeConfig.primary_color,
                    color: '#ffffff',
                } as React.CSSProperties;
            case 'link':
                return {
                    color: themeConfig.primary_color,
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                } as React.CSSProperties;
            default:
                return {};
        }
    };

    const getHoverColor = () => {
        if (type === 'primary') {
            return themeConfig.button_hover_color || themeConfig.secondary_color;
        }
        return null;
    };

    const typeClasses = {
        primary: 'text-white focus:ring-[var(--theme-primary)]',
        default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
        link: 'bg-transparent border-none p-0',
        text: 'text-gray-700 hover:text-gray-900 bg-transparent border-none',
    };

    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        middle: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg',
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    const typeStyles = getTypeStyles();
    const hoverColor = getHoverColor();

    return (
        <button 
            type={htmlType} 
            className={`${baseClasses} ${typeClasses[type]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
            style={typeStyles}
            onMouseEnter={(e) => {
                if (type === 'primary' && !disabled && hoverColor) {
                    e.currentTarget.style.backgroundColor = hoverColor;
                }
            }}
            onMouseLeave={(e) => {
                if (type === 'primary' && !disabled && typeStyles.backgroundColor) {
                    e.currentTarget.style.backgroundColor = typeStyles.backgroundColor as string;
                }
            }}
            onClick={onClick} 
            disabled={disabled}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
}
